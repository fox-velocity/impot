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
    <div className="space-y-8">
      
      {/* 1. Situation de Famille - Pleine Largeur */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Situation de Famille</h2>
            <p className="text-slate-500 text-sm font-medium">Déterminez votre quotient familial</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label htmlFor="situation" className="block text-sm font-bold text-slate-700 ml-1">Statut marital</label>
            <select 
              id="situation" 
              name="situation"
              value={inputs.situation}
              onChange={handleChange}
              className="w-full p-4 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 bg-slate-50/50 transition-all font-medium text-slate-800"
            >
              <option value="Couple">Couple (Marié / PACSé)</option>
              <option value="Célibataire">Célibataire / Divorcé</option>
              <option value="Veuf">Veuf ou Veuve</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="children" className="block text-sm font-bold text-slate-700 ml-1">Nombre d'enfants à charge</label>
            <input 
              type="number" 
              id="children" 
              name="children"
              min="0"
              value={inputs.children}
              onChange={handleChange}
              className="w-full p-4 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 bg-slate-50/50 transition-all font-medium text-slate-800"
            />
          </div>
        </div>
      </section>

      {/* 2. Revenus et Charges - Pleine Largeur */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
            <Euro size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Revenus et Charges</h2>
            <p className="text-slate-500 text-sm font-medium">Saisissez vos revenus nets imposables de l'année 2024</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b-2 border-blue-50 pb-2">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">D1</span>
                <h3 className="text-lg font-bold text-slate-800">Déclarant 1</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="salary1" className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Salaire Net Imposable (1AJ)</label>
                <input type="number" name="salary1" id="salary1" value={inputs.salary1} onChange={handleChange} className="w-full p-4 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label htmlFor="per1" className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Versement PER</label>
                   <input type="number" name="per1" id="per1" value={inputs.per1} onChange={handleChange} className="w-full p-4 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50" />
                </div>
                <div className="space-y-2">
                   <label htmlFor="perCeiling1" className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Plafond PER</label>
                   <input type="number" name="perCeiling1" id="perCeiling1" value={inputs.perCeiling1} onChange={handleChange} className="w-full p-4 border-2 border-yellow-100 rounded-xl bg-yellow-50/50 text-yellow-700 font-bold" />
                </div>
              </div>
            </div>
          </div>

          <div className={`space-y-6 transition-all duration-300 ${!isCouple ? 'opacity-20 pointer-events-none' : ''}`}>
            <div className="flex items-center space-x-2 border-b-2 border-blue-50 pb-2">
                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">D2</span>
                <h3 className="text-lg font-bold text-slate-800">Déclarant 2</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="salary2" className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Salaire Net Imposable (1BJ)</label>
                <input type="number" name="salary2" id="salary2" value={inputs.salary2} onChange={handleChange} disabled={!isCouple} className="w-full p-4 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label htmlFor="per2" className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Versement PER</label>
                   <input type="number" name="per2" id="per2" value={inputs.per2} onChange={handleChange} disabled={!isCouple} className="w-full p-4 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 bg-slate-50/50" />
                </div>
                <div className="space-y-2">
                   <label htmlFor="perCeiling2" className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Plafond PER</label>
                   <input type="number" name="perCeiling2" id="perCeiling2" value={inputs.perCeiling2} onChange={handleChange} disabled={!isCouple} className="w-full p-4 border-2 border-yellow-100 rounded-xl bg-yellow-50/50 text-yellow-700 font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-slate-50">
            <div className="space-y-2">
                <label htmlFor="commonCharges" className="block text-sm font-bold text-slate-700 ml-1">Charges Communes Déductibles</label>
                <input type="number" name="commonCharges" id="commonCharges" value={inputs.commonCharges} onChange={handleChange} className="w-full p-4 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 bg-slate-50/50" />
            </div>
            <div className="space-y-2">
                <label htmlFor="reduction" className="block text-sm font-bold text-emerald-700 ml-1">Réductions / Crédits d'Impôt</label>
                <input type="number" name="reduction" id="reduction" value={inputs.reduction} onChange={handleChange} className="w-full p-4 border-2 border-emerald-100 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 bg-emerald-50/30 text-emerald-900 font-bold" />
            </div>
        </div>
      </section>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onReset}
          className="flex items-center space-x-2 text-slate-400 hover:text-red-500 transition-all font-bold text-sm uppercase tracking-widest px-6 py-2 rounded-full hover:bg-red-50"
        >
          <RotateCcw size={16} />
          <span>Réinitialiser les données</span>
        </button>
      </div>
    </div>
  );
};