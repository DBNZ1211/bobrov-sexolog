// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/tailwindcss',
  ],

  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Бобров Василий Тихонович — врач-уролог, Сергиев Посад',
      meta: [
        {
          name: 'description',
          content:
            'Врач-уролог Бобров В. Т., стаж 31 год. Доктор по сексуальному здоровью. Запись на приём в Сергиевом Посаде онлайн или по телефону +7 964 594-12-01.',
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,500;7..72,600;7..72,700&family=Manrope:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    adminUser: process.env.ADMIN_USER || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    sessionSecret: process.env.SESSION_SECRET || 'dev-change-me-session-secret',
    dataDir: process.env.DATA_DIR || './data',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://bobrov-sexolog.ru',
      phone: process.env.NUXT_PUBLIC_PHONE || '+7 964 594-12-01',
      phoneHref: process.env.NUXT_PUBLIC_PHONE_HREF || 'tel:+79645941201',
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: 'node22',
      },
    },
    rollupConfig: {
      external: ['node:sqlite'],
    },
  },
})
