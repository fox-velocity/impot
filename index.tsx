import React from 'react';
import ReactDOM from 'react-dom/client';
import { TaxSimulator } from './App'; // Import du composant renommé

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Impossible de trouver l'élément racine 'root'");
}

const root = ReactDOM.createRoot(rootElement);

// Simulation d'une page hôte (ex: Fox Velocity)
root.render(
  <React.StrictMode>
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        {/* C'est ici que vous intégrez le composant dans votre site */}
        <div className="max-w-7xl mx-auto">
            <TaxSimulator />
        </div>
    </div>
  </React.StrictMode>
);