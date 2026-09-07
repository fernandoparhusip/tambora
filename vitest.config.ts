import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import vue from '@vitejs/plugin-vue'

function nuxtAutoImportPlugin() {
  const autoImports: Record<string, string> = {
    useAppToast: '~/composables/useAppToast',
    useCrudState: '~/composables/useCrudState',
    useAsyncDetail: '~/composables/useAsyncDetail',
    useTableState: '~/composables/useTableState',
    useModalStack: '~/composables/useModalStack',
    useModalEsc: '~/composables/useModalStack',
    useAuth: '~/composables/useAuth',
    useRbac: '~/composables/useRbac',
    useApi: '~/composables/useApi',
    useApiCache: '~/composables/useApiCache',
    useFormDraft: '~/composables/useFormDraft',
    useIdleTimer: '~/composables/useIdleTimer',
    useNetworkStatus: '~/composables/useNetworkStatus',
    useOperasiPembangkit: '~/composables/useOperasiPembangkit',
    useAsset: '~/composables/master/useAsset',
    useCabang: '~/composables/master/useCabang',
    useDriver: '~/composables/master/useDriver',
    useMachineCondition: '~/composables/master/useMachineCondition',
    useOrganization: '~/composables/master/useOrganization',
    usePermission: '~/composables/master/usePermission',
    useRanting: '~/composables/master/useRanting',
    useRegional: '~/composables/master/useRegional',
    useRole: '~/composables/master/useRole',
    useScope: '~/composables/master/useScope',
    useSentral: '~/composables/master/useSentral',
    useSystem: '~/composables/master/useSystem',
    useUik: '~/composables/master/useUik',
    useUiwUid: '~/composables/master/useUiwUid',
    useUnitLayanan: '~/composables/master/useUnitLayanan',
    useUp2d: '~/composables/master/useUp2d',
    useUpk: '~/composables/master/useUpk',
    useUser: '~/composables/master/useUser',
    useAksesGrup: '~/composables/konfigurasi-aplikasi/useAksesGrup',
    useAksesLevel: '~/composables/konfigurasi-aplikasi/useAksesLevel',
    useMenu: '~/composables/konfigurasi-aplikasi/useMenu',
    useNKO: '~/composables/transaksi/useNKO',
    useOperasiHarian: '~/composables/transaksi/useOperasiHarian',
    usePagu: '~/composables/transaksi/usePagu',
    usePaguBidang: '~/composables/transaksi/usePaguBidang',
    usePemakaianBahanBakar: '~/composables/transaksi/usePemakaianBahanBakar',
    usePembebanan: '~/composables/transaksi/usePembebanan',
    usePrognosa: '~/composables/transaksi/usePrognosa',
    useAuthStore: '~/stores/auth',
    getSecureRandom: '~/utils/cryptoRandom',
    computed: 'vue',
    ref: 'vue',
    reactive: 'vue',
    watch: 'vue',
    watchEffect: 'vue',
    nextTick: 'vue',
    onMounted: 'vue',
    onUnmounted: 'vue',
  }

  return {
    name: 'nuxt-auto-import-plugin',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      const cleanId = id.split('?')[0] || ''
      let newCode = code
      if (newCode.includes('import.meta.client')) {
        newCode = newCode.replace(/\bimport\.meta\.client\b/g, 'true')
      }
      if (!cleanId.endsWith('.vue')) {
        return newCode !== code ? { code: newCode, map: null } : undefined
      }
      const importsToAdd: string[] = []
      for (const [name, path] of Object.entries(autoImports)) {
        const usedRegex = new RegExp(`\\b${name}\\b`)
        const importedRegex = new RegExp(`import\\s+(?:\\{[^}]*\\b${name}\\b[^}]*\\}|\\b${name}\\b|\\*\\s+as\\s+\\b${name}\\b)\\s+from`)
        if (usedRegex.test(code) && !importedRegex.test(code)) {
          importsToAdd.push(`import { ${name} } from '${path}';`)
        }
      }
      if (importsToAdd.length > 0) {
        return {
          code: code.replace(/(<script\b(?:[^>"']|"[^"]*"|'[^']*')*>)/i, `$1\n${importsToAdd.join('\n')}\n`),
          map: null
        }
      }
    }
  }
}

export default defineConfig({
  define: {
    'import.meta.client': JSON.stringify(true),
  },
  plugins: [nuxtAutoImportPlugin() as any, vue() as any],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      'assets': fileURLToPath(new URL('./assets', import.meta.url)),
      '#app': fileURLToPath(new URL('./test/mocks/app.ts', import.meta.url))
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      exclude: [
        'node_modules/**',
        '.nuxt/**',
        '**/.cache/**',
        '**/.output/**',
        '**/virtual:*',
        'dist/**',
        'coverage/**',
        'nuxt.config.ts',
        'vitest.config.ts',
        'eslint.config.mjs',
        'types/**',
        'test/**',
        'server/**',
        'app.vue',
        '**/transaksi/**'
      ]
    }
  }
})
