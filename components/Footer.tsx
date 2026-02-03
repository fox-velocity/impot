import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-slate-500">
          Généré par votre Assistant React Senior. Prêt pour l'intégration de code.
        </p>
      </div>
    </footer>
  );
};