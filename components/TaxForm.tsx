import React from 'react';
import { TaxInputs } from '../types';
import { Users, Euro, RotateCcw } from 'lucide-react';

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
      
      {/* 1. Situation */}
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

      {/* 2. Revenus */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Euro size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Revenus et Charges</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Déclarant 1 */}
          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Déclarant 1 (D1)</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="salary1" className="block text-sm text-slate-700">Salaire Net Imposable <span className="text-xs font-bold text-blue-600">(1AJ)</span></label>
                <input type="number" name="salary1" id="salary1" value={inputs.salary1} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="space-y-1">
                <label htmlFor="realExpenses1" className="block text-sm text-slate-700">Frais Réels <span className="text-xs font-bold text-blue-600">(1AK)</span></label>
                <input type="number" name="realExpenses1" id="realExpenses1" value={inputs.realExpenses1} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="pt-2 border-t border-blue-100 space-y-4">
                <div className="space-y-1">
                   <label htmlFor="per1" className="block text-sm text-slate-700">Versement PER <span className="text-xs font-bold text-blue-600">(6NS)</span></label>
                   <input type="number" name="per1" id="per1" value={inputs.per1} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                   <label htmlFor="perCeiling1" className="block text-sm text-slate-700">Plafond de déduction PER</label>
                   <input type="number" name="perCeiling1" id="perCeiling1" value={inputs.perCeiling1} onChange={handleChange} className="w-full p-3 border border-yellow-300 bg-yellow-50 rounded-lg focus:ring-yellow-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Déclarant 2 */}
          <div className={`bg-blue-50/50 p-5 rounded-xl border border-blue-100 transition-opacity duration-200 ${!isCouple ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Déclarant 2 (D2)</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="salary2" className="block text-sm text-slate-700">Salaire Net Imposable <span className="text-xs font-bold text-blue-600">(1BJ)</span></label>
                <input type="number" name="salary2" id="salary2" value={inputs.salary2} onChange={handleChange} disabled={!isCouple} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="space-y-1">
                <label htmlFor="realExpenses2" className="block text-sm text-slate-700">Frais Réels <span className="text-xs font-bold text-blue-600">(1BK)</span></label>
                <input type="number" name="realExpenses2" id="realExpenses2" value={inputs.realExpenses2} onChange={handleChange} disabled={!isCouple} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="pt-2 border-t border-blue-100 space-y-4">
                <div className="space-y-1">
                   <label htmlFor="per2" className="block text-sm text-slate-700">Versement PER <span className="text-xs font-bold text-blue-600">(6NT)</span></label>
                   <input type="number" name="per2" id="per2" value={inputs.per2} onChange={handleChange} disabled={!isCouple} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                   <label htmlFor="perCeiling2" className="block text-sm text-slate-700">Plafond de déduction PER</label>
                   <input type="number" name="perCeiling2" id="perCeiling2" value={inputs.perCeiling2} onChange={handleChange} disabled={!isCouple} className="w-full p-3 border border-yellow-300 bg-yellow-50 rounded-lg focus:ring-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charges Communes & Reductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-1">
                <label htmlFor="commonCharges" className="block text-sm font-semibold text-slate-700">Autres charges déductibles</label>
                <input type="number" name="commonCharges" id="commonCharges" value={inputs.commonCharges} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-indigo-500" />
            </div>
            <div className="space-y-1">
                <label htmlFor="reduction" className="block text-sm font-semibold text-emerald-700">Réductions / Crédits d'Impôt</label>
                <input type="number" name="reduction" id="reduction" value={inputs.reduction} onChange={handleChange} className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-emerald-500 bg-emerald-50/30" />
            </div>
        </div>
      </section>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-100">
        <button 
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out"
        >
          <RotateCcw size={18} />
          <span>Réinitialiser aux données du PDF</span>
        </button>
      </div>
    </div>
  );
};