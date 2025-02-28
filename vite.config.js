import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  publicDir: '/public',
  build: {
    rollupOptions: {
      input: 'public/index.html',
    },
  },
});