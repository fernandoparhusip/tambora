# CHANGELOG

## [Unreleased]

### Features

- **auth:** integrate real login API endpoint (`POST /auth/login`)
- **proxy:** configure dynamic Nitro route proxy for automatic CORS bypass in dev & prod
- **toast:** add global API error parser (`apiError.ts`) and PrimeVue Toast integration in `app.vue`
- **tests:** add Vitest unit test suite with 28 passing tests and 98.19% utils coverage
- **types:** add `@types/node` dependency for server runtime process typing

### Performance Improvements

- **vite:** pre-bundle OpenLayers (`ol/*`) and Apache ECharts in `vite.optimizeDeps`
- **sidebar:** enable instant page prefetch for dashboard navigation on `<NuxtLink>`

### Bug Fixes

- **header:** cache user profile state on logout to prevent blank UI flicker during transition delay
- **eslint:** auto-fix Vue SFC attributes order and remove console debug statements

### UI Enhancements

- **header:** display 2-letter uppercase username initials in avatar circle and `full_name` in dropdown
- **session:** map and persist user session properties (`full_name`, `username`, `organization`, `nip`, `prnr`, and JWT tokens)
