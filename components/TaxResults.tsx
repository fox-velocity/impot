import React from 'react';
import { SimulationResult, TaxInputs } from '../types';
import { Calculator, Info, AlertCircle, TrendingDown, ArrowDownCircle } from 'lucide-react';

interface TaxResultsProps {
  results: SimulationResult;
  inputs: TaxInputs;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
const formatPercent = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val);

export const TaxResults: React.FC<TaxResultsProps> = ({ results, inputs }) => {
  return (
    <div className="space-y-6">
      
      {/* KPI Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ResultCard label="RNI (Imposable)" value={formatCurrency(results.rni)} />
          <ResultCard label="Nombre de Parts" value={results.parts.toString().replace('.', ',')} />
          <ResultCard label="TMI (Tranche)" value={formatPercent(results.tmi)} color="text-red-600" />
          <ResultCard label="Net à Payer" value={formatCurrency(results.totalTax)} highlight color="text-indigo-600" />
      </div>

      {/* Détail Cascade de Calcul */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Calculator size={20} className="text-slate-400" />
                <h3 className="font-bold text-slate-800">Détail du calcul (Barème 2025)</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenus 2024</span>
        </div>
        
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center group">
                <span className="text-slate-500 font-medium">Impôt Brut (Droits simples)</span>
                <span className="font-bold text-slate-900">{formatCurrency(results.decote.taxBeforeDecote)}</span>
            </div>

            {results.decote.amount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 p-4 rounded-2xl border border-dashed border-emerald-200">
                    <div className="flex items-center space-x-2">
                        <ArrowDownCircle size={18} />
                        <span className="font-bold">Décote (Revenus modestes)</span>
                    </div>
                    <span className="font-black">- {formatCurrency(results.decote.amount)}</span>
                </div>
            )}

            {inputs.reduction > 0 && (
                <div className="flex justify-between items-center text-blue-600 p-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/30">
                    <span className="font-bold">Réductions & Crédits d'impôt</span>
                    <span className="font-black">- {formatCurrency(inputs.reduction)}</span>
                </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <div>
                    <span className="text-2xl font-black text-slate-900">Impôt Final</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Après mécanismes correcteurs</p>
                </div>
                <span className="text-4xl font-black text-indigo-600">{formatCurrency(results.totalTax)}</span>
            </div>
        </div>
      </div>

      {/* Informations complémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-600 text-white p-6 rounded-3xl flex items-center justify-between shadow-lg shadow-indigo-100">
              <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Taux de Prélèvement</p>
                  <p className="text-2xl font-black">{formatPercent(results.pas.tauxFoyer / 100)}</p>
              </div>
              <TrendingDown size={32} className="opacity-20" />
          </div>
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Info size={24} />
              </div>
              <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Seuil de Recouvrement</p>
                  <p className="text-sm font-medium text-slate-600 leading-tight">L'impôt est nul si le montant final est inférieur à 61 €.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

const ResultCard = ({ label, value, highlight, color = 'text-slate-900' }: any) => (
    <div className={`p-6 rounded-2xl border transition-all ${highlight ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'bg-white border-slate-200 shadow-sm'}`}>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
);