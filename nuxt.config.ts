import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'
console.log(pkg.version)
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'FEIRA'
    }
  },
  runtimeConfig: {
    public: {
      appVersion: pkg.version
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/supabase', 'shadcn-nuxt'],
  css: ['~/assets/css/tailwind.css'],
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: []
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  }
})
