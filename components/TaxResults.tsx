import React from 'react';
import { SimulationResult, TaxInputs } from '../types';
import { AlertTriangle, Info, Calculator, CheckCircle2 } from 'lucide-react';

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
             <ResultCard label="Revenu Net Imposable" value={formatCurrency(results.rni)} />
             <ResultCard label="Nombre de Parts" value={results.parts.toString().replace('.', ',')} />
             <ResultCard label="Quotient Familial (Base)" value={formatCurrency(results.qf)} />
             <ResultCard label="TMI (Taux Marginal)" value={formatPercent(results.tmi)} color="text-red-600" />
             <ResultCard label="Droits Simples" value={formatCurrency(results.pfqf.taxBase)} />
             <ResultCard label="Impôt Net (Hors CEHR)" value={formatCurrency(results.finalTax)} highlight />
             <ResultCard label="Total à Payer" value={formatCurrency(results.totalTax)} color="text-indigo-900" highlight />
         </div>
      </section>

      {/* Détail du Calcul (Breakdown) */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center space-x-2">
            <Calculator size={20} className="text-slate-500" />
            <h3 className="font-bold text-slate-800">Détail du calcul de l'impôt</h3>
        </div>
        <div className="p-6 space-y-4 text-sm">
            
            {/* Droits Simples */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex flex-col">
                    <span className="text-slate-700 font-medium text-base">Droits Simples</span>
                    {inputs.situation === 'Veuf' && (
                        <span className="text-xs text-slate-500">Impôt Brut calculé sur base Célibataire</span>
                    )}
                </div>
                <span className="font-semibold text-lg">{formatCurrency(results.pfqf.taxBase)}</span>
            </div>

            {/* Réduction Complémentaire (Veuf) Spécifique */}
            {inputs.situation === 'Veuf' && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-emerald-800 flex items-center text-base">
                            <CheckCircle2 size={18} className="mr-2" />
                            Réduction Complémentaire Veuf
                        </span>
                        <span className="font-bold text-emerald-700 text-lg">- {formatCurrency(results.pfqf.rcvReduction)}</span>
                    </div>
                    
                    <div className="text-xs text-emerald-700 mt-2 space-y-1">
                         <div className="flex justify-between border-b border-emerald-200/50 pb-1">
                            <span>Impôt Brut (Base Célibataire) :</span>
                            <span className="font-medium">{formatCurrency(results.pfqf.taxBase)}</span>
                         </div>
                         <div className="flex justify-between border-b border-emerald-200/50 pb-1">
                            <span>Montant référence (Base Couple) :</span>
                            <span className="font-medium">{formatCurrency(results.pfqf.taxBase - (results.pfqf.isCapped ? results.pfqf.cap : results.pfqf.rcvReduction))}</span>
                         </div>
                         <div className="flex justify-between pt-1">
                             <span>Différence :</span>
                             <span className="font-bold">{formatCurrency(results.pfqf.isCapped ? results.pfqf.cap + 1000 : results.pfqf.rcvReduction)} (Plafonnée à 1 993 €)</span>
                         </div>
                    </div>
                </div>
            )}

            {/* Autres mécanismes (Décote, etc.) */}
            <div className="space-y-2 pt-2">
                {/* Décote */}
                {results.decote.amount > 0 && (
                    <div className="flex justify-between items-center text-slate-600 px-3">
                        <span className="flex items-center"><span className="mr-2">↳</span> Décote</span>
                        <span>- {formatCurrency(results.decote.amount)}</span>
                    </div>
                )}

                {/* Réductions saisies */}
                {inputs.reduction > 0 && (
                    <div className="flex justify-between items-center text-slate-600 px-3">
                        <span className="flex items-center"><span className="mr-2">↳</span> Réductions / Crédits d'impôt saisies</span>
                        <span>- {formatCurrency(inputs.reduction)}</span>
                    </div>
                )}
            </div>

            {/* Sous-total Impôt Revenu */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2 bg-slate-50/50 p-3 rounded-lg">
                <span className="font-semibold text-slate-800">Impôt sur le Revenu Net</span>
                <span className="font-bold text-slate-900 text-lg">{formatCurrency(results.finalTax)}</span>
            </div>

            {/* CEHR */}
            {results.cehr > 0 && (
                <div className="flex justify-between items-center text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                     <span className="font-bold flex items-center">
                        <span className="mr-2">+</span> Contribution Hauts Revenus
                     </span>
                     <span className="font-bold text-base">+ {formatCurrency(results.cehr)}</span>
                </div>
            )}
            
            {/* Total Final */}
            <div className="flex justify-between items-center pt-4 mt-2">
                <span className="text-xl font-bold text-slate-900">MONTANT TOTAL À PAYER</span>
                <span className="text-2xl font-black text-indigo-700">{formatCurrency(results.totalTax)}</span>
            </div>
        </div>
      </section>

      {/* Prélèvement à la Source */}
      <section className="bg-blue-50/50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-4">Prélèvement à la Source (PAS)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PasCard label="Taux Déclarant 1" value={formatPercent(results.pas.tauxD1/100)} />
            <PasCard label="Taux Déclarant 2" value={formatPercent(results.pas.tauxD2/100)} />
            <PasCard label="Taux Foyer" value={formatPercent(results.pas.tauxFoyer/100)} isMain />
        </div>
        <p className="text-xs text-blue-600 mt-2 italic flex items-center">
            <Info size={14} className="mr-1"/>
            Estimation basée sur l'individualisation des taux (méthode BOFiP).
        </p>
      </section>

      {/* Warnings */}
      <div className="space-y-3">
        {results.pfqf.isCapped && inputs.situation !== 'Veuf' && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start space-x-3">
                <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                <div>
                    <p className="font-bold text-amber-800">Plafonnement du Quotient Familial Appliqué</p>
                    <p className="text-sm text-amber-700 mt-1">
                        L'avantage fiscal est plafonné à <strong>{formatCurrency(results.pfqf.cap)}</strong>. 
                        Sans ce plafond, l'avantage serait de {formatCurrency(results.pfqf.advantage)}.
                    </p>
                </div>
            </div>
        )}
        {(results.perWarning.isPer1Capped || results.perWarning.isPer2Capped) && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start space-x-3">
                 <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                 <div>
                    <p className="font-bold text-red-800">Plafond PER Dépassé</p>
                    <p className="text-sm text-red-700 mt-1">Certains versements PER dépassent le plafond déductible saisi. L'excédent n'est pas déduit.</p>
                 </div>
            </div>
        )}
      </div>

    </div>
  );
};

const ResultCard: React.FC<{ label: string; value: string; highlight?: boolean; color?: string }> = ({ label, value, highlight, color = 'text-slate-900' }) => (
    <div className={`p-4 rounded-lg border flex flex-col justify-between h-full ${highlight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
        <p className="text-xs text-slate-500 font-medium uppercase mb-1 leading-tight" title={label}>{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
);

const PasCard: React.FC<{ label: string; value: string; isMain?: boolean }> = ({ label, value, isMain }) => (
    <div className={`p-4 rounded-lg text-center ${isMain ? 'bg-white border border-blue-300 shadow-sm' : 'bg-blue-100/50'}`}>
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-blue-900">{value}</p>
    </div>
);