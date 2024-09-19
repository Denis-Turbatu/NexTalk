// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.scss'],
  modules: [
    '@nuxt/icon',
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        prependPath: true,
      }
    }
  },
  plugins: [
    '~/plugins/axios'
  ],
})