import { TaxInputs, SimulationResult, TaxBracketData } from '../types';

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
    DECOTE_RATE: 0.4525,
    RECOUVREMENT_THRESHOLD: 61,
};

function calculateDeduction(salary: number, realExpenses: number): number {
    if (salary === 0) return 0;
    const d = Math.min(salary * 0.10, THRESHOLDS.DEDUCTION_10_PERCENT_MAX);
    return Math.max(d, realExpenses);
}

function getParts(situation: string, children: number): number {
    let parts = situation === 'Couple' || situation === 'Veuf' ? 2 : 1;
    if (children >= 1) parts += 0.5;
    if (children >= 2) parts += 0.5;
    if (children >= 3) parts += (children - 2) * 1;
    return parts;
}

function calculateTaxBrut(rni: number, parts: number) {
    const qf = rni / parts;
    let totalTaxBrut = 0;
    let prevLimit = 0;
    const bracketData: TaxBracketData[] = [];
    let highestRate = 0;

    for (const bracket of TAX_BRACKETS) {
        const taxableInBracket = Math.min(qf, bracket.limit) - prevLimit;
        if (taxableInBracket > 0) {
            totalTaxBrut += taxableInBracket * bracket.rate;
            bracketData.push({ label: bracket.label, rate: bracket.rate, amount: taxableInBracket, color: bracket.color });
            if (bracket.rate > 0) highestRate = bracket.rate;
        }
        prevLimit = bracket.limit;
        if (qf <= bracket.limit) break;
    }
    return { tax: totalTaxBrut * parts, highestRate, qf, bracketData };
}

export function runSimulation(inputs: TaxInputs): SimulationResult {
    const s1 = inputs.salary1 - calculateDeduction(inputs.salary1, inputs.realExpenses1);
    const s2 = inputs.situation === 'Couple' ? inputs.salary2 - calculateDeduction(inputs.salary2, inputs.realExpenses2) : 0;
    
    const rfr = s1 + s2;
    const perDeducted = Math.min(inputs.per1, inputs.perCeiling1) + (inputs.situation === 'Couple' ? Math.min(inputs.per2, inputs.perCeiling2) : 0);
    const rni = Math.max(0, rfr - perDeducted - inputs.commonCharges);
    const parts = getParts(inputs.situation, inputs.children);
    
    const res = calculateTaxBrut(rni, parts);
    const finalTax = Math.round(Math.max(0, res.tax - inputs.reduction));

    // Optimisation PER
    let perInvest = 0, perSaving = 0, perMsg = "Vous n'êtes pas imposable.";
    if (res.highestRate > 0) {
        const idx = TAX_BRACKETS.findIndex(b => b.rate === res.highestRate);
        const lowerLimit = TAX_BRACKETS[idx - 1].limit;
        perInvest = Math.max(0, Math.round((res.qf - lowerLimit) * parts));
        perSaving = Math.round(perInvest * res.highestRate);
        perMsg = `TMI de ${(res.highestRate * 100).toFixed(0)}%. Réduisez votre impôt en versant sur votre PER.`;
    }

    return {
        rbg: rfr, rni, rfr, parts, qf: res.qf, finalTax, cehr: 0, totalTax: finalTax, tmi: res.highestRate,
        pas: { tauxFoyer: rfr > 0 ? (finalTax / rfr) * 100 : 0, tauxD1: 0, tauxD2: 0 },
        details: [`Calcul basé sur un RNI de ${Math.round(rni)}€`],
        bracketData: res.bracketData,
        pfqf: { isCapped: false, advantage: 0, cap: 1791, taxBase: finalTax, rcvReduction: 0, taxBeforeRCV: finalTax },
        decote: { amount: 0, taxBeforeDecote: finalTax },
        perWarning: { isPer1Capped: inputs.per1 > inputs.perCeiling1, isPer2Capped: false },
        perSimulation: { investAmount: perInvest, savingAmount: perSaving, message: perMsg }
    };
}