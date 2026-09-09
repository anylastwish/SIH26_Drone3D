import react from '@vitejs/plugin-react'
import { createRequire } from 'module'
import { defineConfig, type Plugin } from 'vite'

// vite-plugin-cesium is a CJS package; use createRequire for nodenext compat
const require = createRequire(import.meta.url)
const { default: cesium } = require('vite-plugin-cesium') as { default: () => Plugin }

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cesium(), // Handles Cesium static assets, workers, and CESIUM_BASE_URL
  ],
  build: {
    // Increase chunk warning limit for Cesium (it's a large library)
    chunkSizeWarningLimit: 5000,
  },
})


