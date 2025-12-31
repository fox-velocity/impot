import { TaxInputs, SimulationResult, TaxBracketData } from '../types';

export const DEFAULT_VALUES: TaxInputs = {
    situation: 'Couple',
    children: 1, 
    salary1: 45000,
    realExpenses1: 0,
    treatAsRNI1: false,
    per1: 0,
    perCeiling1: 35000, 
    salary2: 35000,
    realExpenses2: 0,
    treatAsRNI2: false,
    per2: 0,
    perCeiling2: 35000, 
    commonCharges: 0,
    reduction: 0
};

const TAX_BRACKETS = [
    { limit: 11497, rate: 0.00, label: '0%', color: '#94a3b8' },
    { limit: 29315, rate: 0.11, label: '11%', color: '#60a5fa' },
    { limit: 83823, rate: 0.30, label: '30%', color: '#818cf8' },
    { limit: 180294, rate: 0.41, label: '41%', color: '#6366f1' },
    { limit: Infinity, rate: 0.45, label: '45%', color: '#4338ca' }
];

export function runSimulation(inputs: TaxInputs): SimulationResult {
    const parts = (inputs.situation === 'Couple' || (inputs.situation === 'Veuf' && inputs.children > 0)) ? 2 : 1;
    const childrenParts = inputs.children <= 2 ? inputs.children * 0.5 : 1 + (inputs.children - 2);
    const totalParts = parts + childrenParts;

    const rni = (inputs.salary1 + inputs.salary2) * 0.9 - inputs.per1 - inputs.per2;
    const qf = rni / totalParts;

    let tax = 0;
    let prevLimit = 0;
    TAX_BRACKETS.forEach(b => {
        const taxable = Math.max(0, Math.min(qf, b.limit) - prevLimit);
        tax += taxable * b.rate;
        prevLimit = b.limit;
    });

    const finalTax = Math.floor(tax * totalParts);

    return {
        rbg: inputs.salary1 + inputs.salary2,
        rni,
        rfr: rni,
        parts: totalParts,
        qf,
        finalTax,
        cehr: 0,
        totalTax: finalTax,
        tmi: 0.3,
        pas: { tauxFoyer: 10, tauxD1: 10, tauxD2: 10 },
        details: ["Calcul simplifié basé sur barème 2025", `Quotient familial : ${qf.toFixed(0)}€`],
        bracketData: [],
        pfqf: { isCapped: false, advantage: 0, cap: 0, taxBase: finalTax, rcvReduction: 0, taxBeforeRCV: finalTax },
        decote: { amount: 0, taxBeforeDecote: finalTax },
        perWarning: { isPer1Capped: false, isPer2Capped: false },
        perSimulation: { investAmount: 0, savingAmount: 0, message: "" }
    };
}