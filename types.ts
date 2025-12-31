import React from 'react';

// Types génériques UI
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Types métier Fiscalité

export interface TaxInputs {
  situation: 'Couple' | 'Célibataire' | 'Veuf';
  children: number;
  salary1: number;
  realExpenses1: number;
  treatAsRNI1: boolean;
  per1: number;
  perCeiling1: number;
  salary2: number;
  realExpenses2: number;
  treatAsRNI2: boolean;
  per2: number;
  perCeiling2: number;
  commonCharges: number;
  reduction: number;
}

export interface TaxBracketData {
  label: string;
  rate: number;
  amount: number;
  color: string;
}

export interface PasResult {
  tauxFoyer: number;
  tauxD1: number;
  tauxD2: number;
}

export interface CeilingDetail {
  label: string;
  amount: number;
}

export interface SimulationResult {
  rbg: number;
  rni: number;
  rfr: number;
  parts: number;
  qf: number;
  finalTax: number;
  cehr: number;
  totalTax: number;
  tmi: number;
  pas: PasResult;
  details: string[];
  bracketData: TaxBracketData[];
  pfqf: {
    isCapped: boolean;
    advantage: number;
    cap: number;
    taxBase: number;
    rcvReduction: number;
    taxBeforeRCV: number;
  };
  decote: {
    amount: number;
    taxBeforeDecote: number;
  };
  perWarning: {
    isPer1Capped: boolean;
    isPer2Capped: boolean;
  };
  perSimulation: {
    investAmount: number;
    savingAmount: number;
    message: string;
  };
}