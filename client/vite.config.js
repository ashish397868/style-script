import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import compressionPlugin from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compressionPlugin({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10KB
      deleteOriginFile: false, // Keep original files
      verbose: true, // Log compression stats
    }),
  ],
    server: {
    host: true, // or '0.0.0.0' - allows external connections
    port: 5173, // specify port (optional)
    open: true, // automatically open browser (optional)
  },
    preview: {
    host: true,
    port: 5173,  // yeah production build dekhne ke liye use hoti hai
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunks for better caching
          vendor: ['react', 'react-dom'],
          // Add more chunks as needed for other dependencies
        },
      },
    },
    // Optimize build for production
    minify: 'terser', // JavaScript ko compress karta hai for faster loading.
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
  },
})
