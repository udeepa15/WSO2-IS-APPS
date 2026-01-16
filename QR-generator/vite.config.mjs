import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 3000,
    allowedHosts: [
      'masked-unprofitably-ardith.ngrok-free.dev'
    ],
  },
  build: {
    outDir: 'dist',
  },
});