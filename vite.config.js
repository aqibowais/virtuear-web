import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: true,
    proxy: {
      '/easyar-crs': {
        target: 'https://4c29f7119442e8f838b517918dbd00cf.na1.crs.easyar.com:8443',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/easyar-crs/, ''),
      },
    },
  },
  preview: {
    host: true,
    proxy: {
      '/easyar-crs': {
        target: 'https://4c29f7119442e8f838b517918dbd00cf.na1.crs.easyar.com:8443',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/easyar-crs/, ''),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2500,
  },
});
