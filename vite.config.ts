import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: '/', // Root path for https://georamicnew.vercel.app/
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
      outDir: 'dist',
      target: 'esnext',
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      emptyOutDir: true, // Ensures dist is cleared before each build
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
  };
});