import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/authenticate': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        secure: false
      },
      '/api/cliente': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        secure: false,
      },
      '/api/ventadetalle': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        secure: false,
      },
      '/api/venta': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        secure: false,
      },
      '/api/producto': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        secure: false,
      },
      '/api/login': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});