import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  define: {
    'process.env': {},
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-stellar': ['@stellar/stellar-sdk', '@stellar/freighter-api'],
          'vendor-react': ['react', 'react-dom', 'lucide-react'],
        },
      },
    },
  },
});
