import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: '/georamic/', // Ensure this matches your Vercel deployment path
    server: {
      proxy: mode === 'development' ? {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      } : undefined,
    },
    build: {
      target: 'esnext', // Ensure modern JS is supported
      assetsInlineLimit: 0, // Prevent inlining assets that might cause MIME issues
      rollupOptions: {
        output: {
          manualChunks: undefined, // Avoid custom chunking that might confuse Vercel
        },
      },
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }, // Suppress potential ESBuild warnings
    },
  };
});