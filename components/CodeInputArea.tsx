import React from 'react';
import { Code2, ArrowRight } from 'lucide-react';

interface CodeInputAreaProps {
  onAnalyze: () => void;
}

export const CodeInputArea: React.FC<CodeInputAreaProps> = ({ onAnalyze }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
        <Code2 size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">En attente de votre code</h3>
      <p className="text-slate-500 max-w-md mb-8">
        J'ai préparé l'architecture du projet. Une fois que vous m'aurez fourni le HTML, je le découperai en composants React modulaires ici.
      </p>
      
      {/* Simulation d'un bouton d'action */}
      <button 
        onClick={onAnalyze}
        className="group flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
      >
        <span>Simuler l'intégration</span>
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};