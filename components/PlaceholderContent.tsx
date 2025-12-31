import React from 'react';

export const PlaceholderContent: React.FC = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700">Aperçu de la Structure Cible</h3>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">PRÊT</span>
      </div>
      
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="p-4 space-y-3 font-mono text-sm">
          <div className="flex items-center text-slate-600">
            <span className="text-blue-500 mr-2">src/</span>
          </div>
          <div className="pl-4 flex flex-col space-y-2 border-l-2 border-slate-100 ml-1">
             <div className="flex items-center text-slate-600">
                <span className="text-yellow-500 mr-2">components/</span>
             </div>
             <div className="pl-6 text-slate-400 space-y-1">
                <p>HeroSection.tsx</p>
                <p>FeatureGrid.tsx</p>
                <p>ContactForm.tsx</p>
                <p>Navigation.tsx</p>
             </div>
             <div className="flex items-center text-slate-600 mt-2">
                <span className="text-cyan-500 mr-2">App.tsx</span>
             </div>
          </div>
        </div>
      </div>
      
      <p className="text-center text-sm text-slate-500 mt-4 italic">
        "Veuillez coller le code source maintenant..."
      </p>
    </div>
  );
};