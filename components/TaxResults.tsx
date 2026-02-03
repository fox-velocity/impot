import React from 'react';
import { SimulationResult, TaxInputs } from '../types';
import { AlertTriangle, Info, Calculator } from 'lucide-react';

interface TaxResultsProps {
  results: SimulationResult;
  inputs: TaxInputs;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
const formatPercent = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val);

export const TaxResults: React.FC<TaxResultsProps> = ({ results, inputs }) => {
  return (
    <div className="space-y-8">
      
      {/* KPI Cards */}
      <section>
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Résultats Clés</h2>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             <ResultCard label="Revenu fiscal de référence" value={formatCurrency(results.rfr)} />
             <ResultCard label="Nombre de Parts" value={results.parts.toString().replace('.', ',')} />
             <ResultCard label="Revenu Net Imposable" value={formatCurrency(results.rni)} color="text-indigo-600" />
             <ResultCard label="Taux marginal (TMI)" value={formatPercent(results.tmi)} color="text-red-600" />
             <ResultCard label="Impôt avant crédits" value={formatCurrency(results.finalTax)} highlight />
             <ResultCard label="Total à payer" value={formatCurrency(results.totalTax)} color="text-indigo-900" highlight />
         </div>
      </section>

      {/* Détail du Calcul (Breakdown) */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center space-x-2">
            <Calculator size={20} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Impôt sur le revenu</h3>
        </div>
        <div className="p-6 space-y-4 text-sm">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium text-base flex items-center">
                    Droits simples {results.pfqf.isCapped && <span className="ml-2 text-amber-600 font-bold" title="Plafonnement appliqué">*</span>}
                </span>
                <span className="font-semibold text-lg">{formatCurrency(results.totalTax)}</span>
            </div>

            {results.pfqf.isCapped && (
                <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800 border border-amber-100">
                    <p className="font-bold mb-1 flex items-center">
                        <AlertTriangle size={14} className="mr-1" /> Plafonnement du quotient familial appliqué
                    </p>
                    <p>L'avantage fiscal de vos parts supplémentaires est limité à {formatCurrency(results.pfqf.cap)} (plafond de 1 791 € par demi-part).</p>
                </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2 bg-slate-50/50 p-3 rounded-lg">
                <span className="font-semibold text-slate-800">Impôt Net</span>
                <span className="font-bold text-slate-900 text-lg">{formatCurrency(results.finalTax)}</span>
            </div>
        </div>
      </section>

      {/* Prélèvement à la Source */}
      <section className="bg-blue-50/50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-blue-800">Prélèvement à la source</h3>
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">INDIVIDUALISÉ</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PasCard label="Taux Déclarant 1" value={formatPercent(results.pas.tauxD1/100)} />
            <PasCard label="Taux Déclarant 2" value={formatPercent(results.pas.tauxD2/100)} />
            <PasCard label="Taux du Foyer" value={formatPercent(results.pas.tauxFoyer/100)} isMain />
        </div>
        <p className="text-xs text-blue-600 mt-6 italic flex items-center bg-white p-3 rounded-lg border border-blue-100">
            <Info size={16} className="mr-2 flex-shrink-0"/>
            Ces taux sont calculés selon la méthode BOFiP : chaque conjoint bénéficie de la moitié des parts du foyer (soit {(results.parts/2).toString().replace('.', ',')} parts chacun).
        </p>
      </section>
    </div>
  );
};

const ResultCard: React.FC<{ label: string; value: string; highlight?: boolean; color?: string }> = ({ label, value, highlight, color = 'text-slate-900' }) => (
    <div className={`p-4 rounded-lg border flex flex-col justify-between h-full ${highlight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
        <p className="text-xs text-slate-500 font-medium uppercase mb-1 leading-tight">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
);

const PasCard: React.FC<{ label: string; value: string; isMain?: boolean }> = ({ label, value, isMain }) => (
    <div className={`p-4 rounded-lg text-center ${isMain ? 'bg-white border border-blue-300 shadow-sm' : 'bg-blue-100/50'}`}>
        <p className="text-xs text-slate-600 mb-1 font-semibold">{label}</p>
        <p className="text-2xl font-bold text-blue-900">{value}</p>
    </div>
);