import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/i18n',
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'],

  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English'
      }
    ],
    defaultLocale: 'en'
  },

  // Ensure proper TypeScript support
  typescript: {
    typeCheck: true
  }
})