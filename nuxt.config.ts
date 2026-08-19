import { defineNuxtConfig } from "nuxt/config";
import { useNuxt } from "@nuxt/kit";
import Aura from "@primeuix/themes/aura";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default (defineNuxtConfig as (config: any) => any)({
  compatibilityDate: "2026-07-21",
  devtools: { enabled: false },
  experimental: {
    appManifest: false,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: ''
    }
  },  
  modules: [
    "@nuxt/ui",
    "@primevue/nuxt-module",
    "@pinia/nuxt",
    "@nuxt/eslint",
    "vue3-carousel-nuxt",
    "nuxt-lucide-icons",
    "@nuxtjs/google-fonts",
  ],
  googleFonts: {
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      Montserrat: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      Lato: [100, 300, 400, 700, 900],
    },
    download: true,
    inject: true,
  },
  primevue: {
    components: {
      exclude: ["Carousel"],
    },
    options: {
      license: false,
      theme: {
        preset: Aura,
      },
    },
  },
  typescript: {
    strict: true,
  },
  css: [
    "vue-final-modal/style.css",
    "~/assets/css/primevue-overrides.css",
  ],
  tailwindcss: {
    config: {
      theme: {
        extend: {
          fontFamily: {
            sans: ["Inter", "sans-serif"],
            inter: ["Inter", "sans-serif"],
            montserrat: ["Montserrat", "sans-serif"],
            lato: ["Lato", "sans-serif"],
          },
        },
      },
    },
  },
  build: {
    transpile: [/echarts/, "vue-echarts", "resize-detector", "ol", "vue3-openlayers"],
  },
  vite: {
    optimizeDeps: {
      include: ["ol"],
    },
  },
  hooks: {
    "modules:done"() {
      const nuxt = useNuxt();
      nuxt.options.plugins = nuxt.options.plugins.filter((p) => {
        const src = typeof p === "string" ? p : p.src;
        return !src.includes("check-if-page-unused");
      });
    },
  },
});
