import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const plugins = [react()];

  // Add bundle analyzer only for production builds when ANALYZE=true
  if (mode === 'production' && process.env.ANALYZE) {
    plugins.push(visualizer({
      filename: './dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    }));
  }

  return {
    plugins,
    optimizeDeps: {
    include: ['socket.io-client']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Enable minification for smaller bundles
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // More granular code splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit', 'react-redux'],
          ui: ['framer-motion', 'react-icons', 'react-toastify', '@mui/material', '@emotion/react', '@emotion/styled'],
          utils: ['axios', 'socket.io-client'],
          fabric: ['fabric']
        },
        // Optimize asset filenames for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    // Enable source maps only in development
    sourcemap: false,
    // Minify CSS as well
    cssMinify: true,
    // Target modern browsers for smaller bundles
    target: 'es2018',
  },
  // Enable esbuild for faster dev builds
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  // Compress output with brotli
  brotliSize: true,
  // Enable module preload polyfill
  polyfillModulePreload: true,
  // Optimize imports between chunks
  rollupOptions: {
    output: {
      sanitizeFileName: (name) => {
        // Replace invalid characters in filenames
        return name.replace(/[^a-zA-Z0-9\-_~.]/g, '_');
      },
      hoistTransitiveImports: true
    }
  }
};
});
