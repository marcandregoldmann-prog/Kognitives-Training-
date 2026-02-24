import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  base: './', // Use relative base for flexible hosting (e.g. GitHub Pages)
  plugins: [
    react(),
    tailwindcss(),
    // Legacy plugin removed to simplify build and avoid conflicts on modern devices
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    target: 'es2022', // Modern Android/iOS target
    outDir: 'dist',
    minify: 'esbuild',
    // sourcemap: true, // Enable if debugging production build is needed
  }
});
