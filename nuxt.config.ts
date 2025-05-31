import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/ui',
    '@nuxtjs/color-mode'
  ],

  css: ['~/assets/css/main.css'],

  // Color mode configuration
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '', // Remove the suffix so it works with standard Tailwind dark: prefix
    storageKey: 'nuxt-color-mode'
  },

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