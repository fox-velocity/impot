import React, { useState, useEffect } from 'react';
import { TaxForm } from './components/TaxForm';
import { TaxResults } from './components/TaxResults';
import { TaxChart } from './components/TaxChart';
import { DEFAULT_VALUES, runSimulation } from './utils/taxEngine';
import { TaxInputs, SimulationResult } from './types';
import { FileText, Calculator } from 'lucide-react';

interface TaxSimulatorProps {
  className?: string;
}

export const TaxSimulator: React.FC<TaxSimulatorProps> = ({ className = '' }) => {
  const [inputs, setInputs] = useState<TaxInputs>(DEFAULT_VALUES);
  const [results, setResults] = useState<SimulationResult | null>(null);

  // Exécuter la simulation à chaque changement d'input
  useEffect(() => {
    const res = runSimulation(inputs);
    setResults(res);
  }, [inputs]);

  const handleInputChange = (field: keyof TaxInputs, value: any) => {
    setInputs(prev => {
      const newInputs = { ...prev, [field]: value };
      
      // Si on change la situation et que ce n'est pas "Couple", on remet à 0 les champs du conjoint
      if (field === 'situation' && value !== 'Couple') {
        newInputs.salary2 = 0;
        newInputs.realExpenses2 = 0;
        newInputs.per2 = 0;
        newInputs.perCeiling2 = 0;
      }
      
      return newInputs;
    });
  };

  const handleReset = () => {
    setInputs({ ...DEFAULT_VALUES });
  };

  return (
    <div className={`bg-slate-50 font-sans text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      {/* Header Interne du Composant */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 md:px-8">
        <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Calculator size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Simulateur Impôt 2025</h2>
        </div>
        <p className="text-slate-500 max-w-2xl">
            Estimez votre impôt sur le revenu (revenus 2024) avec la gestion précise du quotient familial, de la décote, du plafonnement et de la CEHR.
        </p>
      </div>

      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Colonne Gauche : Formulaire (5 cols) */}
            <div className="xl:col-span-5 space-y-6">
               <TaxForm 
                 inputs={inputs} 
                 onChange={handleInputChange} 
                 onReset={handleReset} 
               />
               
               {/* Details techniques */}
               {results && (
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4 text-slate-800">
                        <FileText size={20} />
                        <h3 className="font-bold">Détails du Calcul</h3>
                    </div>
                    <ul className="space-y-2 text-xs font-mono text-slate-600 bg-slate-50 p-4 rounded-lg overflow-y-auto max-h-64">
                        {results.details.map((line, idx) => (
                            <li key={idx} className="border-b border-slate-200 pb-1 last:border-0">{line}</li>
                        ))}
                    </ul>
                 </div>
               )}
            </div>

            {/* Colonne Droite : Résultats & Graphs (7 cols) */}
            <div className="xl:col-span-7 space-y-6">
                {results && (
                    <>
                        <TaxResults results={results} inputs={inputs} />
                        <TaxChart 
                            bracketData={results.bracketData} 
                            qf={results.qf} 
                            parts={results.parts}
                            perSimulation={results.perSimulation}
                        />
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// Export par défaut pour compatibilité si nécessaire, mais l'export nommé est préférable
export default TaxSimulator;