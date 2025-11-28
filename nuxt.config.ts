// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    stripeSecretKey: '', // NUXT_STRIPE_SECRET_KEY
    public: {
      pocketbaseUrl: 'https://isamo.pockethost.io/',
      stripePublishableKey: '' // NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    }
  },
  app: {
    baseURL: '/ISAMO/'
  }
})
