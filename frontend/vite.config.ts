import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://127.0.0.1:5174' } },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separăm biblioteca PDF (este foarte mare)
          if (id.includes('@react-pdf') || id.includes('pdfkit') || id.includes('fontkit') || id.includes('linebreak')) {
            return 'pdf-vendor';
          }
          // Separăm librăriile UI cu animații/grafice
          if (id.includes('framer-motion') || id.includes('recharts')) {
            return 'ui-vendor';
          }
          // Restul dependențelor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
