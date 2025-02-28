import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  publicDir: '/public',
  build: {
    rollupOptions: {
      input: 'public/index.html', // Point d'entrée pour le build
    },
  },
  plugins: [
    EnvironmentPlugin([
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
        'FIREBASE_TYPE',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_CLIENT_ID',
        'FIREBASE_AUTH_URI',
        'FIREBASE_TOKEN_URI',
        'FIREBASE_AUTH_PROVIDER_CERT_URL',
        'FIREBASE_CLIENT_CERT_URL',
        'UNIVERSE_DOMAIN'
    ])
  ]
});