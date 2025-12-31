import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
          Fox Velocity Engineering
        </p>
        <p className="text-xs text-slate-400">
          &copy; 2025 Expertise Fiscale Indépendante. Les résultats sont fournis à titre indicatif.
        </p>
      </div>
    </footer>
  );
};