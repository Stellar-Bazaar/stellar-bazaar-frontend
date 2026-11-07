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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@stellar/stellar-sdk') || id.includes('@stellar/freighter-api')) {
              return 'vendor-stellar';
            }
            if (id.includes('react') || id.includes('lucide-react')) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
});
