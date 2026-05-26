export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        credentials: true  // ← añadir esta línea
      }
    }
  }
})