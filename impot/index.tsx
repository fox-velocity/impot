import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("Démarrage du simulateur impôt...");

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Application montée avec succès sur #root");
  } else {
    console.error("Erreur fatale : l'élément #root n'a pas été trouvé dans le DOM.");
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}