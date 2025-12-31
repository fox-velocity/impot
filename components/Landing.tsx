import React from 'react';
import { Zap, ArrowRight, ShieldCheck, TrendingUp, Landmark } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-gradient-portal animate-in">
      <div className="max-w-4xl w-full text-center space-y-12">
        
        <div className="space-y-4">
          <div className="inline-flex p-5 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-200 mb-6 rotate-3 hover:rotate-0 transition-all duration-500 cursor-pointer">
            <Landmark size={48} className="text-white" />
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter italic">
            FOX <span className="text-indigo-600">VELOCITY</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            L'excellence de l'ingénierie fiscale au service de votre patrimoine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <LandingCard 
            icon={<ShieldCheck className="text-indigo-600" size={24} />}
            title="Barème 2025"
            description="Calculs certifiés conformes à la loi de finances pour les revenus 2024."
          />
          <LandingCard 
            icon={<TrendingUp className="text-indigo-600" size={24} />}
            title="Stratégie PER"
            description="Simulez l'impact de vos versements sur votre TMI en temps réel."
          />
          <LandingCard 
            icon={<Zap className="text-indigo-600" size={24} />}
            title="Haute Précision"
            description="Gestion du quotient conjugal, de la décote et des hauts revenus (CEHR)."
          />
        </div>

        <div className="pt-8">
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-12 py-6 font-bold text-white transition-all duration-300 bg-indigo-600 rounded-3xl hover:bg-indigo-700 shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              Accéder au Simulateur 2025
              <ArrowRight size={22} className="ml-3 group-hover:translate-x-2 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        <div className="pt-12 flex flex-col items-center space-y-4 opacity-50">
          <div className="h-px w-24 bg-slate-300"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Division Ingénierie Financière</p>
        </div>
      </div>
    </div>
  );
};

const LandingCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
    <div className="mb-4 bg-slate-50 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:bg-indigo-50 transition-colors">
      {icon}
    </div>
    <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </div>
);