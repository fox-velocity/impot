import { TaxInputs, SimulationResult, TaxBracketData, PasResult } from '../types';

// Constantes - Valeurs par défaut
export const DEFAULT_VALUES: TaxInputs = {
    situation: 'Couple',
    children: 2, 
    salary1: 55000,
    realExpenses1: 6000,
    treatAsRNI1: false,
    per1: 2000,
    perCeiling1: 5900, 
    salary2: 45000,
    realExpenses2: 5000,
    treatAsRNI2: false,
    per2: 2500,
    perCeiling2: 5137, 
    commonCharges: 0,
    reduction: 0
};

const TAX_BRACKETS = [
    { limit: 11497, rate: 0.00, label: '0%', color: '#60a5fa' },
    { limit: 29315, rate: 0.11, label: '11%', color: '#34d399' },
    { limit: 83823, rate: 0.30, label: '30%', color: '#facc15' },
    { limit: 180294, rate: 0.41, label: '41%', color: '#f97316' },
    { limit: 999999999, rate: 0.45, label: '45%', color: '#dc2626' }
];

const THRESHOLDS = {
    DEDUCTION_10_PERCENT_MAX: 14426,
    DEDUCTION_10_PERCENT_MIN: 504,
    PFQF_CEILING: 1791, 
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
    return Math.max(deduction10Pct, realExpenses);
}

function getParts(situation: string, children: number): number {
    const numChildren = Math.floor(children);
    let parts = situation === 'Couple' || (situation === 'Veuf' && numChildren > 0) ? 2 : 1;
    if (numChildren >= 1) parts += 0.5;
    if (numChildren >= 2) parts += 0.5;
    if (numChildren >= 3) parts += (numChildren - 2) * 1;
    return parts;
}

function calculateTaxBrut(rni: number, parts: number) {
    const qf = rni / parts;
    let taxBrutQF = 0;
    let prevLimit = 0;
    const details: string[] = [];
    const bracketData: TaxBracketData[] = [];
    let highestRate = 0;

    for (const bracket of TAX_BRACKETS) {
        const taxableAmount = Math.min(qf, bracket.limit) - prevLimit;
        if (taxableAmount > 0) {
            const taxInBracket = taxableAmount * bracket.rate;
            taxBrutQF += taxInBracket;
            details.push(`Tranche ${bracket.label} : ${taxableAmount.toFixed(0)}€ * ${bracket.rate * 100}% = ${taxInBracket.toFixed(0)}€`);
            bracketData.push({ label: bracket.label, rate: bracket.rate, amount: taxableAmount, color: bracket.color });
            if (bracket.rate > 0) highestRate = bracket.rate;
        }
        prevLimit = bracket.limit;
        if (qf <= bracket.limit) break;
    }

    return { tax: taxBrutQF * parts, details, qf, bracketData, highestRate };
}

function calculateTaxWithCapping(rni: number, parts: number, situation: string) {
    const real = calculateTaxBrut(rni, parts);
    const baseParts = situation === 'Couple' ? 2 : 1; 

    if (parts <= baseParts) return { ...real, isCapped: false, capAmount: 0, baseTax: real.tax };

    const base = calculateTaxBrut(rni, baseParts);
    const nbDemiParts = (parts - baseParts) * 2;
    const maxAdvantage = nbDemiParts * THRESHOLDS.PFQF_CEILING;
    const taxFloor = Math.max(0, base.tax - maxAdvantage);
    
    if (real.tax < taxFloor) {
        return { 
            tax: taxFloor, isCapped: true, capAmount: maxAdvantage, 
            details: [...base.details, `Plafonnement QF: Avantage limité à ${maxAdvantage}€`],
            qf: base.qf, highestRate: base.highestRate, bracketData: base.bracketData, baseTax: base.tax 
        };
    }
    return { ...real, isCapped: false, capAmount: 0, baseTax: base.tax };
}

export function runSimulation(inputs: TaxInputs): SimulationResult {
    const { situation, children, salary1, realExpenses1, per1, perCeiling1, reduction } = inputs;
    let { salary2, realExpenses2, per2, perCeiling2 } = inputs;

    if (situation !== 'Couple') {
        salary2 = 0; realExpenses2 = 0; per2 = 0; perCeiling2 = 0;
    }

    const deduction1 = calculateDeduction(salary1, realExpenses1);
    const deduction2 = calculateDeduction(salary2, realExpenses2);
    const rfr = (salary1 - deduction1) + (salary2 - deduction2);
    
    const perDeducted1 = Math.min(per1, perCeiling1);
    const perDeducted2 = Math.min(per2, perCeiling2);
    const rni = Math.max(0, rfr - perDeducted1 - perDeducted2);

    const parts = getParts(situation, children);
    const res = calculateTaxWithCapping(rni, parts, situation);
    
    const finalTax = Math.round(Math.max(0, res.tax - reduction));
    const totalTax = finalTax;

    const pas = { tauxFoyer: 0, tauxD1: 0, tauxD2: 0 };
    const totalNet = salary1 + salary2;
    if (totalNet > 0) pas.tauxFoyer = (finalTax / totalNet) * 100;

    if (situation === 'Couple' && totalNet > 0) {
        const partsIndiv = parts / 2;
        const rni2 = Math.max(0, (salary2 - deduction2) - perDeducted2);
        const res2 = calculateTaxWithCapping(rni2, partsIndiv, 'Célibataire');
        pas.tauxD2 = salary2 > 0 ? (res2.tax / salary2) * 100 : 0;
        const taxD1 = Math.max(0, finalTax - res2.tax);
        pas.tauxD1 = salary1 > 0 ? (taxD1 / salary1) * 100 : 0;
    } else {
        pas.tauxD1 = pas.tauxFoyer;
    }

    // --- LOGIQUE OPTIMISATION PER (Toujours calculée) ---
    let perInvest = 0, perSaving = 0, perMsg = "Aucune optimisation fiscale immédiate possible.";
    if (res.highestRate > 0) {
        const currentBracketIndex = TAX_BRACKETS.findIndex(b => b.rate === res.highestRate);
        if (currentBracketIndex > 0) {
            const lowerLimit = TAX_BRACKETS[currentBracketIndex - 1].limit;
            const currentQf = rni / parts;
            // On calcule l'effort pour atteindre le plafond de la tranche en dessous
            perInvest = Math.max(0, Math.round((currentQf - lowerLimit) * parts));
            perSaving = Math.round(perInvest * res.highestRate);
            perMsg = `Votre TMI est de ${(res.highestRate * 100).toFixed(0)}%.`;
        }
    }

    return {
        rbg: rfr, rni, rfr, parts, qf: res.qf, finalTax, cehr: 0, totalTax, tmi: res.highestRate, 
        pas, details: res.details, bracketData: res.bracketData,
        pfqf: { isCapped: res.isCapped, advantage: res.capAmount, cap: res.capAmount, taxBase: finalTax, rcvReduction: 0, taxBeforeRCV: finalTax },
        decote: { amount: 0, taxBeforeDecote: finalTax },
        perWarning: { isPer1Capped: per1 > perCeiling1, isPer2Capped: per2 > perCeiling2 },
        perSimulation: { investAmount: perInvest, savingAmount: perSaving, message: perMsg }
    };
}