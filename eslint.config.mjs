import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  {
    ignores: [
      'coverage/**',
      '.nuxt/**',
      'dist/**'
    ]
  },
  {
    rules: {
      'no-unused-vars': 'off', // Turn off base rule as TS rule handles it
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'off', // Necessary for generic dynamic components
      'vue/multi-word-component-names': 'off', // Common in Nuxt routing
      'no-console': 'warn'
    }
  }
])
