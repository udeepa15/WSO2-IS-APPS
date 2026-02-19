import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const IS_URL = 'https://masked-unprofitably-ardith.ngrok-free.dev'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /oauth2/* XHR calls (token, jwks, revoke) server-side to IS
      '/oauth2': {
        target: IS_URL,
        changeOrigin: true,
        secure: false,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      },
      // Forward /oidc/* calls (logout etc) server-side to IS
      '/oidc': {
        target: IS_URL,
        changeOrigin: true,
        secure: false,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      }
    }
  }
})
