import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000, // Adjust as necessary
  },
  base: 'Turistea-project-frontend-copia', // Ensure this matches your repository name
});
