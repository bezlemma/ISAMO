export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: '.',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      communityUrl: 'http://127.0.0.1:8787',
      communityKey: 'local-development-only'
    }
  },
  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'ISAMO | International Society for Avian Model Organisms',
      meta: [
        { name: 'description', content: 'Avian research, meetings, and resources for the chicken and quail research community.' },
        { name: 'robots', content: 'noindex, nofollow, noarchive' }
      ]
    }
  }
})
