import { TaxInputs, SimulationResult, TaxBracketData } from '../types';

// Constantes OFFICIELLES 2025 (Revenus 2024)
export const DEFAULT_VALUES: TaxInputs = {
    situation: 'Célibataire',
    children: 0, 
    salary1: 24000,
    realExpenses1: 0,
    treatAsRNI1: false,
    per1: 0,
    perCeiling1: 3500, 
    salary2: 0,
    realExpenses2: 0,
    treatAsRNI2: false,
    per2: 0,
    perCeiling2: 3500, 
    commonCharges: 0,
    reduction: 0
};

// Barème OFFICIEL 2025 (Revenus 2024)
const TAX_BRACKETS = [
    { limit: 11497, rate: 0.00, label: '0%', color: '#94a3b8' },
    { limit: 29315, rate: 0.11, label: '11%', color: '#60a5fa' },
    { limit: 83823, rate: 0.30, label: '30%', color: '#818cf8' },
    { limit: 180294, rate: 0.41, label: '41%', color: '#6366f1' },
    { limit: 999999999, rate: 0.45, label: '45%', color: '#4338ca' }
];

const THRESHOLDS = {
    DEDUCTION_10_PERCENT_MAX: 14426,
    DEDUCTION_10_PERCENT_MIN: 504,
    PFQF_CEILING: 1791, 
    RCV_AMOUNT: 1993, 
    DECOTE_SINGLE_MAX: 889,
    DECOTE_SINGLE_THRESHOLD: 1964,
    DECOTE_COUPLE_MAX: 1470,
    DECOTE_COUPLE_THRESHOLD: 3249,
    DECOTE_RATE: 0.4525,
    RECOUVREMENT_THRESHOLD: 61,
};

function calculateDeduction(salary: number, realExpenses: number): number {
    if (salary === 0) return 0;
    const deduction10Pct = Math.min(salary * 0.10, THRESHOLDS.DEDUCTION_10_PERCENT_MAX);
    const finalDeduction10Pct = Math.max(deduction10Pct, THRESHOLDS.DEDUCTION_10_PERCENT_MIN);
    return Math.max(finalDeduction10Pct, realExpenses);
}

function getParts(situation: string, children: number): number {
    let parts = 0;
    if (situation === 'Couple') {
        parts = 2;
    } else if (situation === 'Veuf') {
        parts = children > 0 ? 2 : 1;
    } else {
        parts = 1;
    }
    if (children >= 1) parts += 0.5;
    if (children >= 2) parts += 0.5;
    if (children >= 3) parts += (children - 2) * 1;
    return parts;
}

function calculateTaxBrut(rni: number, parts: number) {
    const qf = rni / parts;
    let taxBrutQF = 0;
    let prevLimit = 0;
    const bracketData: TaxBracketData[] = [];
    let highestRate = 0;

    for (const bracket of TAX_BRACKETS) {
        const taxableAmount = Math.min(qf, bracket.limit) - prevLimit;
        if (taxableAmount > 0) {
            taxBrutQF += taxableAmount * bracket.rate;
            bracketData.push({ label: bracket.label, rate: bracket.rate, amount: taxableAmount, color: bracket.color });
            if (bracket.rate > 0) highestRate = bracket.rate;
        }
        prevLimit = bracket.limit;
        if (qf <= bracket.limit) break;
    }
    return { tax: Math.floor(taxBrutQF * parts), qf, bracketData, highestRate };
}

export function runSimulation(inputs: TaxInputs): SimulationResult {
    const { situation, children, salary1, realExpenses1, salary2, realExpenses2, per1, perCeiling1, per2, perCeiling2, commonCharges, reduction } = inputs;

    // 1. Calcul RNI (Revenu Net Imposable)
    const deduc1 = calculateDeduction(salary1, realExpenses1);
    const deduc2 = situation === 'Couple' ? calculateDeduction(salary2, realExpenses2) : 0;
    const perD1 = Math.min(per1, perCeiling1);
    const perD2 = situation === 'Couple' ? Math.min(per2, perCeiling2) : 0;

    const rni = Math.max(0, (salary1 - deduc1 - perD1) + (salary2 - deduc2 - perD2) - commonCharges);
    const rfr = (salary1 + salary2) * 0.9;

    // 2. Parts et Impôt Brut
    const parts = getParts(situation, children);
    const baseParts = (situation === 'Couple' || (situation === 'Veuf' && children > 0)) ? 2 : 1;
    
    const taxReal = calculateTaxBrut(rni, parts);
    const taxBase = calculateTaxBrut(rni, baseParts);

    // 3. Plafonnement QF
    let finalTaxBrut = taxReal.tax;
    let isCapped = false;
    let capAmount = 0;

    if (parts > baseParts) {
        const maxAdvantage = (parts - baseParts) * 2 * THRESHOLDS.PFQF_CEILING;
        const cappedTax = taxBase.tax - maxAdvantage;
        if (taxReal.tax < cappedTax) {
            finalTaxBrut = cappedTax;
            isCapped = true;
            capAmount = maxAdvantage;
        }
    }

    // 4. Décote
    let appliedDecote = 0;
    const isCoupleDecote = situation === 'Couple';
    const decoteThreshold = isCoupleDecote ? THRESHOLDS.DECOTE_COUPLE_THRESHOLD : THRESHOLDS.DECOTE_SINGLE_THRESHOLD;
    const decoteMax = isCoupleDecote ? THRESHOLDS.DECOTE_COUPLE_MAX : THRESHOLDS.DECOTE_SINGLE_MAX;

    if (finalTaxBrut > 0 && finalTaxBrut < decoteThreshold) {
        appliedDecote = Math.max(0, decoteMax - (finalTaxBrut * THRESHOLDS.DECOTE_RATE));
        appliedDecote = Math.min(appliedDecote, finalTaxBrut);
    }

    const taxAfterDecote = Math.max(0, finalTaxBrut - appliedDecote);

    // 5. Optimisation PER
    let perInvest = 0;
    let perSaving = 0;
    let perMessage = "";
    const tmi = taxReal.highestRate;

    if (tmi >= 0.11) {
        // On calcule combien de revenu est "bloqué" dans la tranche la plus haute
        const currentQF = rni / parts;
        const currentBracket = TAX_BRACKETS.find(b => currentQF <= b.limit) || TAX_BRACKETS[TAX_BRACKETS.length - 1];
        const lowerBracket = TAX_BRACKETS[TAX_BRACKETS.indexOf(currentBracket) - 1];
        
        // Montant à investir pour descendre d'une tranche
        const amountToDropBracket = (currentQF - lowerBracket.limit) * parts;
        perInvest = Math.round(amountToDropBracket);
        perSaving = Math.round(perInvest * tmi);
        perMessage = `En investissant <strong>${perInvest.toLocaleString()} €</strong> dans un PER, vous basculez dans la tranche à <strong>${(lowerBracket.rate * 100).toFixed(0)}%</strong>.`;
    }

    // 6. Finalisation
    let totalTax = Math.max(0, Math.round(taxAfterDecote - reduction));
    if (totalTax < THRESHOLDS.RECOUVREMENT_THRESHOLD) totalTax = 0;

    return {
        rbg: salary1 + (situation === 'Couple' ? salary2 : 0),
        rni,
        rfr,
        parts,
        qf: taxReal.qf,
        finalTax: totalTax,
        cehr: 0,
        totalTax,
        tmi,
        pas: { tauxFoyer: rni > 0 ? (totalTax / rni) * 100 : 0, tauxD1: 0, tauxD2: 0 },
        details: [
            `Revenu Net Imposable : ${Math.round(rni).toLocaleString()} €`,
            `Impôt Brut : ${Math.round(finalTaxBrut).toLocaleString()} €`,
            appliedDecote > 0 ? `Décote : -${Math.round(appliedDecote).toLocaleString()} €` : "",
            reduction > 0 ? `Réductions : -${reduction.toLocaleString()} €` : ""
        ].filter(l => l !== ""),
        bracketData: taxReal.bracketData,
        pfqf: { isCapped, advantage: capAmount, cap: THRESHOLDS.PFQF_CEILING, taxBase: finalTaxBrut, rcvReduction: 0, taxBeforeRCV: finalTaxBrut },
        decote: { amount: appliedDecote, taxBeforeDecote: finalTaxBrut },
        perWarning: { isPer1Capped: per1 > perCeiling1, isPer2Capped: per2 > perCeiling2 },
        perSimulation: { investAmount: perInvest, savingAmount: perSaving, message: perMessage }
    };
}