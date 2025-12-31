import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Crucial pour GitHub Pages : génère des chemins relatifs
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});