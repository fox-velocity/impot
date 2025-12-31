import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TaxForm } from './components/TaxForm';
import { TaxResults } from './components/TaxResults';
import { TaxChart } from './components/TaxChart';
import { DEFAULT_VALUES, runSimulation } from './utils/taxEngine';
import { TaxInputs, SimulationResult } from './types';
import { FileText, Calculator, Landmark } from 'lucide-react';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<TaxInputs>(DEFAULT_VALUES);
  const [results, setResults] = useState<SimulationResult | null>(null);

  useEffect(() => {
    const res = runSimulation(inputs);
    setResults(res);
  }, [inputs]);

  const handleInputChange = (field: keyof TaxInputs, value: any) => {
    setInputs(prev => {
      const newInputs = { ...prev, [field]: value };
      if (field === 'situation' && value !== 'Couple') {
        newInputs.salary2 = 0;
        newInputs.realExpenses2 = 0;
      }
      return newInputs;
    });
  };

  const handleReset = () => {
    setInputs({ ...DEFAULT_VALUES });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 animate-in">
      <Header title="Fox Velocity" className="bg-white shadow-sm" />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-2">
                <Landmark size={32} />
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              Simulateur Impôt <span className="text-indigo-600">2025</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg italic max-w-2xl mx-auto">
                Calcul précis basé sur les revenus 2024, incluant le mécanisme de la décote pour les revenus modestes.
            </p>
          </div>

          <TaxForm 
            inputs={inputs} 
            onChange={handleInputChange} 
            onReset={handleReset} 
          />

          {results && (
            <div className="space-y-12 pt-8 border-t border-slate-200">
                <div className="flex items-center justify-center space-x-3 text-slate-400">
                    <div className="h-px w-16 bg-slate-300"></div>
                    <Calculator size={20} />
                    <span className="uppercase tracking-[0.3em] font-bold text-[10px]">Résultats de la simulation</span>
                    <div className="h-px w-16 bg-slate-300"></div>
                </div>

                <TaxResults results={results} inputs={inputs} />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7">
                        <TaxChart 
                            bracketData={results.bracketData} 
                            qf={results.qf} 
                            parts={results.parts}
                            perSimulation={results.perSimulation}
                        />
                    </div>
                    <div className="lg:col-span-5">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
                            <div className="flex items-center space-x-2 mb-6 text-slate-800">
                                <FileText size={20} className="text-indigo-600" />
                                <h3 className="font-bold text-xs uppercase tracking-wider">Log technique de calcul</h3>
                            </div>
                            <ul className="space-y-3 text-[11px] font-mono text-slate-500 bg-slate-50 p-6 rounded-2xl overflow-y-auto max-h-[400px] border border-slate-100">
                                {results.details.map((line, idx) => (
                                    <li key={idx} className="border-b border-slate-200/50 pb-2 last:border-0">{line}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;