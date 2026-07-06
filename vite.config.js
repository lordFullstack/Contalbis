import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages sirve el sitio en tu-usuario.github.io/NOMBRE-DEL-REPO/
  // Cambia 'NOMBRE-DEL-REPO' por el nombre exacto de tu repositorio.
  base: process.env.GITHUB_ACTIONS ? '/Contalbis/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Control Financiero',
        short_name: 'ControlFin',
        description: 'Sistema contable de un solo usuario',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
