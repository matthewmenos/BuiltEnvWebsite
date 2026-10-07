import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      shared: path.resolve(__dirname, '../../shared'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
