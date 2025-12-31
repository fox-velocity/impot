import React from 'react';
import { TaxInputs } from '../types';
import { Users, Euro, Calculator, RotateCcw } from 'lucide-react';

interface TaxFormProps {
  inputs: TaxInputs;
  onChange: (field: keyof TaxInputs, value: any) => void;
  onReset: () => void;
}

export const TaxForm: React.FC<TaxFormProps> = ({ inputs, onChange, onReset }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (parseFloat(value) || 0) : value;
    onChange(name as keyof TaxInputs, val);
  };

  const isCouple = inputs.situation === 'Couple';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
      
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Users size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Situation de Famille</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="situation" className="block text-sm font-semibold text-slate-700">Statut</label>
            <select 
              id="situation" 
              name="situation"
              value={inputs.situation}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="Couple">Couple (Marié / PACSé)</option>
              <option value="Célibataire">Célibataire / Divorcé</option>
              <option value="Veuf">Veuf ou Veuve</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="children" className="block text-sm font-semibold text-slate-700">Enfants à charge</label>
            <input 
              type="number" 
              id="children" 
              name="children"
              min="0"
              value={inputs.children}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Euro size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Revenus et Charges</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Déclarant 1 (D1)</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="salary1" className="block text-sm text-slate-700">Salaire Net Imposable (1AJ)</label>
                <input type="number" name="salary1" id="salary1" value={inputs.salary1} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <label htmlFor="per1" className="block text-sm text-slate-700">PER</label>
                   <input type="number" name="per1" id="per1" value={inputs.per1} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg" />
                </div>
                <div className="space-y-1">
                   <label htmlFor="perCeiling1" className="block text-sm text-slate-700">Plafond</label>
                   <input type="number" name="perCeiling1" id="perCeiling1" value={inputs.perCeiling1} onChange={handleChange} className="w-full p-3 border border-yellow-200 bg-yellow-50 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border border-slate-100 transition-opacity duration-200 ${!isCouple ? 'opacity-50 pointer-events-none grayscale' : 'bg-blue-50/50 border-blue-100'}`}>
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Déclarant 2 (D2)</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="salary2" className="block text-sm text-slate-700">Salaire Net Imposable (1BJ)</label>
                <input type="number" name="salary2" id="salary2" value={inputs.salary2} onChange={handleChange} disabled={!isCouple} className="w-full p-3 border border-slate-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                   <label htmlFor="per2" className="block text-sm text-slate-700">PER</label>
                   <input type="number" name="per2" id="per2" value={inputs.per2} onChange={handleChange} disabled={!isCouple} className="w-full p-3 border border-slate-300 rounded-lg" />
                </div>
                <div className="space-y-1">
                   <label htmlFor="perCeiling2" className="block text-sm text-slate-700">Plafond</label>
                   <input type="number" name="perCeiling2" id="perCeiling2" value={inputs.perCeiling2} onChange={handleChange} disabled={!isCouple} className="w-full p-3 border border-yellow-200 bg-yellow-50 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-1">
                <label htmlFor="commonCharges" className="block text-sm font-semibold text-slate-700">Charges Communes</label>
                <input type="number" name="commonCharges" id="commonCharges" value={inputs.commonCharges} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg" />
            </div>
            <div className="space-y-1">
                <label htmlFor="reduction" className="block text-sm font-semibold text-emerald-700">Réductions / Crédits</label>
                <input type="number" name="reduction" id="reduction" value={inputs.reduction} onChange={handleChange} className="w-full p-3 border border-emerald-300 bg-emerald-50 rounded-lg" />
            </div>
        </div>
      </section>

      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button 
          onClick={onReset}
          className="flex items-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <RotateCcw size={16} />
          <span className="text-sm font-semibold">Réinitialiser</span>
        </button>
      </div>
    </div>
  );
};