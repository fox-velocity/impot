import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Très important pour que les liens JS/CSS fonctionnent
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});