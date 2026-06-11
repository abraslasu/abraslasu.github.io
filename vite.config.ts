import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/abraslasu.gihtub.io/', 
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});