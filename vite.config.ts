import { defineConfig } from 'vite'

export default defineConfig({
    base: '/money_clicker_game/',
    optimizeDeps: {
        exclude: ['@electric-sql/pglite'],
    },
})