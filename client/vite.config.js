import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['motion/react'],
          'vendor-particles': ['@tsparticles/react', '@tsparticles/slim'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-r3f-post': ['@react-three/postprocessing'],
          'vendor-gsap': ['gsap'],
        },
      },
    },
  },
})
