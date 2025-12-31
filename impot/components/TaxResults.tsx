import React from 'react';
import { SimulationResult, TaxInputs } from '../types';
import { Calculator, CheckCircle2 } from 'lucide-react';

interface TaxResultsProps {
  results: SimulationResult;
  inputs: TaxInputs;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
const formatPercent = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1 }).format(val);

export const TaxResults: React.FC<TaxResultsProps> = ({ results, inputs }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResultCard label="Revenu Net Imposable" value={formatCurrency(results.rni)} />
        <ResultCard label="Parts" value={results.parts.toString().replace('.', ',')} />
        <ResultCard label="TMI" value={formatPercent(results.tmi)} color="text-red-600" />
        <ResultCard label="Impôt Net" value={formatCurrency(results.finalTax)} highlight />
        <ResultCard label="NET À PAYER" value={formatCurrency(results.totalTax)} color="text-indigo-700" highlight />
      </section>

      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center space-x-2">
            <Calculator size={18} className="text-slate-500" />
            <h3 className="font-bold text-slate-800 text-sm">Décomposition fiscale</h3>
        </div>
        <div className="p-6 space-y-3 text-sm">
            <div className="flex justify-between">
                <span className="text-slate-600">Impôt Brut</span>
                <span className="font-semibold">{formatCurrency(results.pfqf.taxBase)}</span>
            </div>
            {results.decote.amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                    <span>Décote fiscale</span>
                    <span>- {formatCurrency(results.decote.amount)}</span>
                </div>
            )}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-lg font-bold">Total Final</span>
                <span className="text-2xl font-black text-indigo-700">{formatCurrency(results.totalTax)}</span>
            </div>
        </div>
      </section>
    </div>
  );
};

const ResultCard = ({ label, value, highlight, color = 'text-slate-900' }: any) => (
  <div className={`p-4 rounded-xl border ${highlight ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
  </div>
);