import { TaxInputs, SimulationResult, TaxBracketData, PasResult } from '../types';

// Constantes
export const DEFAULT_VALUES: TaxInputs = {
    situation: 'Couple',
    children: 1, 
    salary1: 400000,
    realExpenses1: 45000,
    treatAsRNI1: false,
    per1: 0,
    perCeiling1: 35500, 
    salary2: 400000,
    realExpenses2: 45000,
    treatAsRNI2: false,
    per2: 0,
    perCeiling2: 35500, 
    commonCharges: 0,
    reduction: 0
};

// Barème OFFICIEL 2025 (Revenus 2024) - Source PDF Page 5 & 3
const TAX_BRACKETS = [
    { limit: 11497, rate: 0.00, label: '0%', color: '#60a5fa' },
    { limit: 29315, rate: 0.11, label: '11%', color: '#34d399' },
    { limit: 83823, rate: 0.30, label: '30%', color: '#facc15' },
    { limit: 180294, rate: 0.41, label: '41%', color: '#f97316' },
    { limit: 999999999, rate: 0.45, label: '45%', color: '#dc2626' }
];

// Seuils et Plafonds OFFICIELS 2025 - Source PDF Page 2, 3, 11, 13
const THRESHOLDS = {
    // Page 11 : "Déduction 10% (maximum 14 426 €)", "b est au minimum de 504€"
    DEDUCTION_10_PERCENT_MAX: 14426,
    DEDUCTION_10_PERCENT_MIN: 504,
    
    // Page 2 : "PLAFONNEMENT DES EFFETS DU QUOTIENT FAMILIAL ... plafonné à 1 791 €"
    PFQF_CEILING: 1791, 
    
    // Page 3 & 13 : "VEUFS ... réduction d’impôt complémentaire d’un montant maximal de 1 993 €"
    RCV_AMOUNT: 1993, 
    
    // Page 3 & 13 : DÉCOTE
    // Célibataire : "égale à la différence entre 889 € et les 45,25%...", seuil 1964 €
    DECOTE_SINGLE_MAX: 889,
    DECOTE_SINGLE_THRESHOLD: 1964,
    
    // Couple : "égale à la différence entre 1 470 € et les 45,25%...", seuil 3 249 €
    DECOTE_COUPLE_MAX: 1470,
    DECOTE_COUPLE_THRESHOLD: 3249,
    
    DECOTE_RATE: 0.4525,
    RECOUVREMENT_THRESHOLD: 61,
};

const CEHR_BRACKETS = [
    { situation: 'Célibataire', lower: 0, upper: 250000, rate: 0.00 },
    { situation: 'Célibataire', lower: 250000, upper: 500000, rate: 0.03 },
    { situation: 'Célibataire', lower: 500000, upper: Infinity, rate: 0.04 },
    { situation: 'Couple', lower: 0, upper: 500000, rate: 0.00 },
    { situation: 'Couple', lower: 500000, upper: 1000000, rate: 0.03 },
    { situation: 'Couple', lower: 1000000, upper: Infinity, rate: 0.04 }
];

// --- Helpers ---

function calculateDeduction(salary: number, realExpenses: number, treatAsRNI: boolean): number {
    if (treatAsRNI) return 0;
    if (salary === 0) return 0;
    const deduction10Pct = Math.min(salary * 0.10, THRESHOLDS.DEDUCTION_10_PERCENT_MAX);
    const finalDeduction10Pct = Math.max(deduction10Pct, THRESHOLDS.DEDUCTION_10_PERCENT_MIN);
    return Math.max(finalDeduction10Pct, realExpenses);
}

/**
 * Calcul des parts fiscales selon la situation.
 */
function getParts(situation: string, children: number): number {
    const numChildren = Math.floor(children);
    let parts = 0;

    if (situation === 'Couple') {
        parts = 2; // Base couple
    } else if (situation === 'Veuf') {
        // Veuf avec enfants à charge : situation de famille du marié (2 parts de base)
        // Veuf sans enfants à charge : 1 part (Situation générale)
        parts = numChildren > 0 ? 2 : 1;
    } else {
        parts = 1; // Base célibataire
    }

    // Parts enfants
    if (numChildren >= 1) parts += 0.5; // 1er
    if (numChildren >= 2) parts += 0.5; // 2ème
    if (numChildren >= 3) parts += (numChildren - 2) * 1; // 3ème et suivants

    return parts;
}

// Calcul simple de l'impôt brut selon le quotient familial
function calculateTaxBrut(rni: number, parts: number) {
    const qf = rni / parts;
    let taxBrutQF = 0;
    let prevLimit = 0;
    const details: string[] = [];
    const bracketData: TaxBracketData[] = [];
    let rniInBrackets = 0;
    let highestRate = 0;

    for (const bracket of TAX_BRACKETS) {
        const taxableAmount = Math.min(qf, bracket.limit) - prevLimit;
        if (taxableAmount > 0) {
            const taxInBracket = taxableAmount * bracket.rate;
            taxBrutQF += taxInBracket;
            details.push(`Tranche ${bracket.label} : ${taxableAmount.toFixed(0)}€ * ${bracket.rate * 100}% = ${taxInBracket.toFixed(0)}€`);
            bracketData.push({
                label: bracket.label,
                rate: bracket.rate,
                amount: taxableAmount,
                color: bracket.color
            });
            rniInBrackets += taxableAmount;
            if (bracket.rate > highestRate) highestRate = bracket.rate;
        }
        prevLimit = bracket.limit;
        if (qf <= bracket.limit) break;
    }

    if (rniInBrackets <= 0) {
        bracketData.push({ label: '0%', rate: 0, amount: 0, color: '#60a5fa' });
    }

    const totalTaxBrut = taxBrutQF * parts;
    // On tronque à l'euro inférieur
    return { tax: Math.floor(Math.max(0, totalTaxBrut)), details, qf, bracketData, highestRate };
}

// Helper complet pour calculer l'impôt AVEC le plafonnement du QF standard
function calculateTaxWithCapping(rni: number, parts: number, situation: string) {
    const real = calculateTaxBrut(rni, parts);
    
    // Définition de la situation de base pour le plafonnement (Référence)
    // Pour Couple -> Base 2.
    // Pour Célibataire -> Base 1.
    // Pour Veuf -> La référence est Célibataire (1 part) pour calculer le plafonnement standard.
    const baseParts = situation === 'Couple' ? 2 : 1; 

    // Si pas de parts supplémentaires par rapport à la base, pas de plafonnement
    if (parts <= baseParts) {
        return { 
            tax: real.tax, isCapped: false, capAmount: 0, details: real.details,
            qf: real.qf, highestRate: real.highestRate, bracketData: real.bracketData,
            baseTax: real.tax // Pour info
        };
    }

    // Calcul impôt sur les parts de base (Reference)
    const base = calculateTaxBrut(rni, baseParts);
    
    // Calcul de l'avantage maximum autorisé (Plafond STANDARD)
    // Pour Veuf, comme pour Célib/Divorcé, chaque demi-part excédentaire est plafonnée à 1791€.
    const nbDemiParts = (parts - baseParts) * 2;
    const maxAdvantage = nbDemiParts * THRESHOLDS.PFQF_CEILING;

    // L'impôt ne peut pas être inférieur à (Impôt_Base - Avantage_Max)
    const taxFloor = Math.max(0, base.tax - maxAdvantage);
    
    // Détection du plafonnement
    if (real.tax < taxFloor) {
        const cappedDetails = [...base.details];
        cappedDetails.push(`Plafonnement QF: Avantage fiscal limité à ${maxAdvantage}€`);

        return {
            tax: taxFloor, // I1 (Droits Simples)
            isCapped: true,
            capAmount: maxAdvantage,
            details: cappedDetails,
            qf: base.qf, // On affiche le QF correspondant au calcul plafonné (souvent Base QF)
            highestRate: base.highestRate,
            bracketData: base.bracketData,
            baseTax: base.tax
        };
    }

    return { 
        tax: real.tax, isCapped: false, capAmount: 0, details: real.details,
        qf: real.qf, highestRate: real.highestRate, bracketData: real.bracketData,
        baseTax: base.tax
    };
}


function applyDecote(tax: number, situation: string) {
    // Pour la décote, Veuf est considéré comme "Célibataire" (Imposition séparée),
    // contrairement au calcul des parts où il peut être assimilé à un couple (si enfants).
    const isCoupleThreshold = situation === 'Couple'; 
    
    const maxDecote = isCoupleThreshold ? THRESHOLDS.DECOTE_COUPLE_MAX : THRESHOLDS.DECOTE_SINGLE_MAX;
    const threshold = isCoupleThreshold ? THRESHOLDS.DECOTE_COUPLE_THRESHOLD : THRESHOLDS.DECOTE_SINGLE_THRESHOLD;
    
    if (tax <= 0) return { tax: 0, decote: 0 };
    if (tax > threshold) return { tax: tax, decote: 0 };

    const decoteTheorique = maxDecote - (THRESHOLDS.DECOTE_RATE * tax);
    const appliedDecote = Math.max(0, Math.min(decoteTheorique, tax));
    return { tax: tax - appliedDecote, decote: appliedDecote };
}

function calculateCEHR(rfr: number, situation: string): number {
    let cehr = 0;
    let situationToUse = situation === 'Veuf' ? 'Célibataire' : situation;
    const brackets = CEHR_BRACKETS.filter(b => b.situation === situationToUse).sort((a, b) => a.lower - b.lower);

    for (const bracket of brackets) {
        if (bracket.rate > 0 && rfr > bracket.lower) {
            const taxableInBand = Math.min(rfr, bracket.upper) - bracket.lower;
            cehr += taxableInBand * bracket.rate;
        }
    }
    return Math.round(cehr);
}

// --- Logique principale ---

export function runSimulation(inputs: TaxInputs): SimulationResult {
    const { situation, children, salary1, realExpenses1, treatAsRNI1, per1, perCeiling1, commonCharges, reduction } = inputs;
    let { salary2, realExpenses2, treatAsRNI2, per2, perCeiling2 } = inputs;

    // FORCAGE A ZERO POUR VEUF et CELIBATAIRE
    if (situation !== 'Couple') {
        salary2 = 0; realExpenses2 = 0; treatAsRNI2 = false; per2 = 0; perCeiling2 = 0;
    }

    // 1. Calcul du RNI
    const perDeducted1 = Math.min(per1, perCeiling1);
    const perDeducted2 = Math.min(per2, perCeiling2);
    const deduction1 = calculateDeduction(salary1, realExpenses1, treatAsRNI1);
    const deduction2 = calculateDeduction(salary2, realExpenses2, treatAsRNI2);

    const rni1 = Math.max(0, salary1 - deduction1 - perDeducted1);
    const rni2 = Math.max(0, salary2 - deduction2 - perDeducted2);

    const globalGrossIncome = (salary1 + salary2) - (deduction1 + deduction2);
    // Note: Pour le calcul global, on déduit les charges communes du RNI Global.
    const rni = Math.max(0, globalGrossIncome - perDeducted1 - perDeducted2 - commonCharges);
    const rfr = globalGrossIncome; 

    // --- BRANCHE STANDARD ---
    // Calcul des parts
    const partsDisplay = getParts(situation, children);
    
    // Calcul de l'impôt avec plafonnement standard (I1)
    const res = calculateTaxWithCapping(rni, partsDisplay, situation);
    
    const I1 = res.tax; // Droits Simples (après plafonnement standard)
    const baseTax = res.baseTax; // Impôt A (sur 1 part ou 2 parts base)
    
    let H = 0; // Réduction Complémentaire Veuf
    let taxAfterRCV = I1;
    let details = res.details;

    // Calcul Réduction Complémentaire Veuf (Si plafonné)
    if (situation === 'Veuf' && res.isCapped) {
        const resUncapped = calculateTaxBrut(rni, partsDisplay);
        const realTax = resUncapped.tax;
        const excessAdvantage = I1 - realTax; 
        
        H = Math.min(excessAdvantage, THRESHOLDS.RCV_AMOUNT);
        H = Math.floor(H);
        
        if (H > 0) {
            taxAfterRCV = I1 - H;
            details.push(`Réduction Complémentaire Veuf : -${H}€ (Plafond RCV atteint)`);
        }
    }

    const finalTaxBeforeDecote = Math.max(0, taxAfterRCV); // I2

    // --- FINALISATION COMMUNE ---
    
    // 1. Décote (Sur I2)
    const taxBaseForDecote = Math.round(finalTaxBeforeDecote);
    // Veuf : situation='Veuf' -> applyDecote utilise seuil célibataire (Correct)
    const decoteResult = applyDecote(taxBaseForDecote, situation);
    
    // Base pour le PAS : Impôt AVANT réductions d'impôt (car le PAS est un acompte sur l'impôt brut)
    // On conserve le montant après décote mais avant réductions.
    const taxBeforeReductions = Math.round(decoteResult.tax); 

    // 2. Réductions utilisateur
    let finalTax = Math.max(0, taxBeforeReductions - reduction);
    finalTax = Math.round(finalTax);

    // 3. Seuil de recouvrement
    if (finalTax > 0 && finalTax < THRESHOLDS.RECOUVREMENT_THRESHOLD) {
        finalTax = 0;
    }

    // 4. CEHR
    const cehr = calculateCEHR(rfr, situation);
    const totalTax = finalTax + cehr;

    // Données pour UI
    const advantage = res.isCapped ? res.capAmount : 0;
    
    // --- PAS Calculation (Individualisation BOFiP) ---
    const pas = { tauxFoyer: 0, tauxD1: 0, tauxD2: 0 }; 
    const totalNet = salary1 + salary2; 
    
    // Taux Foyer : Impôt AVANT RICI / Net Imposable Total
    // Le PAS est assis sur le revenu net imposable
    if (totalNet > 0) pas.tauxFoyer = (taxBeforeReductions / totalNet) * 100;
    
    // --- Individualisation : Méthode BOFiP (Imputation par soustraction) ---
    // BOFiP : Le taux du conjoint aux revenus les plus faibles est calculé sur ses seuls revenus
    // MAIS en utilisant le quotient familial global du foyer.
    // L'autre conjoint supporte le reste de l'impôt.
    
    if (situation === 'Couple' && totalNet > 0 && (salary1 > 0 || salary2 > 0)) {
        
        // 1. Identifier Conjoint Faible (Min) et Fort (Max)
        const s1 = salary1;
        const s2 = salary2;
        let minIs1 = s1 < s2;
        if (s1 === s2) minIs1 = true; // Arbitraire si égalité

        const salaryMin = minIs1 ? s1 : s2;
        const salaryMax = minIs1 ? s2 : s1;
        
        // Revenu Net Imposable individuel (On ne déduit pas les charges communes pour maximiser la protection du min)
        const rniMin = minIs1 ? rni1 : rni2;

        // 2. Calculer l'impôt théorique sur le revenu FAIBLE seul
        //    CRUCIAL : On utilise 'partsDisplay' (parts GLOBALES du foyer, ex: 3 pour couple + 2 enfants)
        const resMin = calculateTaxWithCapping(rniMin, partsDisplay, 'Couple');
        
        // Appliquer la décote COUPLE sur cet impôt théorique
        const decoteMin = applyDecote(resMin.tax, 'Couple');
        const taxMinTheorique = Math.round(decoteMin.tax);

        // 3. Calculer les taux
        // Taux Min = Impôt Théorique Min / Salaire Min
        const rateMin = salaryMin > 0 ? (taxMinTheorique / salaryMin) * 100 : 0;
        
        // Impôt Max = Impôt Total Foyer (Avant Réduc) - Impôt Théorique Min
        // Le conjoint fort paie le "surplus" d'impôt généré par ses revenus
        const taxMaxTheorique = Math.max(0, taxBeforeReductions - taxMinTheorique);
        const rateMax = salaryMax > 0 ? (taxMaxTheorique / salaryMax) * 100 : 0;

        if (minIs1) {
            pas.tauxD1 = rateMin;
            pas.tauxD2 = rateMax;
        } else {
            pas.tauxD1 = rateMax;
            pas.tauxD2 = rateMin;
        }
    } else {
        // Célibataire / Veuf / Mono-revenu : Taux indiv = Taux foyer
        pas.tauxD1 = pas.tauxFoyer;
        pas.tauxD2 = 0;
    }

    // --- PER Simulation ---
    let perInvest = 0, perSaving = 0, perMessage = "";
    const effectiveTmi = res.highestRate;
    const lowerBracketIndex = TAX_BRACKETS.findIndex(b => b.rate === effectiveTmi) - 1;
    if (effectiveTmi > 0 && lowerBracketIndex >= 0) {
        const lowerBracket = TAX_BRACKETS[lowerBracketIndex];
        const partsForMarginal = res.isCapped ? (situation === 'Couple' || situation === 'Veuf' ? 2 : 1) : partsDisplay;
        const currentQfForTmi = rni / partsForMarginal;
        const rniToInvest = (currentQfForTmi - lowerBracket.limit) * partsForMarginal;
        perInvest = Math.max(0, Math.round(rniToInvest));
        perSaving = Math.max(0, Math.round(rniToInvest * effectiveTmi));
        perMessage = `TMI Effectif: ${(effectiveTmi * 100).toFixed(0)}%. Épargne pour saut de tranche.`;
    }

    return {
        rbg: globalGrossIncome, rni, rfr, parts: partsDisplay, qf: res.qf, 
        finalTax, cehr, totalTax, tmi: effectiveTmi, pas, details, 
        bracketData: res.bracketData,
        pfqf: { 
            isCapped: res.isCapped, 
            advantage: advantage, // Affiche le plafond standard
            cap: res.capAmount, 
            taxBase: I1, // Droits Simples (avant réduction Veuf)
            rcvReduction: H, // La réduction spécifique
            taxBeforeRCV: I1 
        },
        decote: { 
            amount: decoteResult.decote, 
            taxBeforeDecote: I1 
        },
        perWarning: { isPer1Capped: per1 > perCeiling1, isPer2Capped: false },
        perSimulation: { investAmount: perInvest, savingAmount: perSaving, message: perMessage }
    };
}