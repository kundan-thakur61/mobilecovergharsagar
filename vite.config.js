import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const plugins = [react()];

  if (mode === 'production' && process.env.ANALYZE) {
    plugins.push(
      visualizer({
        filename: './dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    );
  }

  return {
    plugins,

    optimizeDeps: {
      include: ['socket.io-client'],
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
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log'],
        },
      },

      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      sourcemap: false,
      cssMinify: true,
      target: 'es2018',

      rollupOptions: {
        output: {
         manualChunks: {
  ui: [
    'react',
    'react-dom',
    'framer-motion',
    'react-icons',
    'react-toastify',
    '@mui/material',
    '@emotion/react',
    '@emotion/styled',
  ],

  utils: ['axios', 'socket.io-client'],
  fabric: ['fabric'],
},


          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name.split('.').pop();
            if (/png|jpe?g|svg|gif|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },

          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
    },
  };
});
