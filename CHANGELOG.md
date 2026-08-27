# CHANGELOG

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - 2026-08-27

### 🚀 Features & Master Data Integration
- **master-organization:** Integrated `/api/v1/organization` CRUD with parent-child hierarchy, geographical coordinates (lat/lng), drawer form, and detail modal.
- **master-machine-condition:** Integrated `/api/v1/machine-conditions` CRUD with operational descriptions, active status switch, and centered modal.
- **master-system:** Integrated `/api/v1/systems` CRUD with system classification (`BESAR`/`KECIL`), UPK organization binding, and geographical coordinates.
- **master-asset:** Integrated `/api/v1/assets` CRUD with DMN, DMP, Daya Terpasang, generator & engine specs, transformer, fuel type, and ownership status.
- **master-driver:** Integrated `/api/v1/drivers` CRUD with strict 16-digit NIK validation, ISO RFC3339 date normalization, and 11-field drawer modal.
- **master-user:** Inlined User management with dynamic organization & role dropdowns directly fetched from backend.
- **master-role:** Inlined Role management with permission badges and system role protection.
- **master-permission:** Dynamic permission catalogue viewer with action badges and resource filtering.
- **sidebar:** Added 4 new Master navigation links and restructured Master menu items into a logical business hierarchy.

### 🎨 UI & Reusable Component System
- **base-select:** Created modern `BaseSelect` component featuring live search filtering, smooth transitions, active checkmarks, and `h-12` PLN design matching.
- **base-action-button:** Created `BaseActionButton` component standardizing View (Sky), Edit (Amber), and Delete (Red) buttons with micro-animations.
- **base-badge:** Created `BaseBadge` component standardizing multi-variant status badges (`success`, `danger`, `warning`, `info`, `primary`, `mono`, `system`).
- **dynamic-linkage:** Connected live backend organizations to User and System forms, removing all dummy fallback arrays.
- **home-welcome:** Created responsive centered welcome screen with dynamic 80% `LogoWelcome.png` scaling and realistic typewriter typing greeting in `pages/home/index.vue`.
- **login-typewriter:** Upgraded login welcome description animation to letter-by-letter typewriter typing effect in `components/login/LoginForm.vue`.
- **maptiler-integration:** Integrated MapTiler high-resolution tile service with API key support in `.env`, `.env.example`, `nuxt.config.ts`, and `components/base/BaseMap.vue`.

### 🛠️ Refactoring & Code Quality
- **vue-sfc:** Enforced strict Single File Component block ordering across all pages: `<script setup>` (Top) -> `<template>` (Middle) -> `<style>` (Bottom).
- **inlining-architecture:** Inlined table columns and form configs into SFCs, removing obsolete `config/` directory.
- **cleanup:** Deleted dead legacy files (`composables/useMasterUser.ts`, `composables/useKeuntungan.ts`, `stores/keuntungan.ts`, `pages/home/master/level-role.vue`).
- **types:** Added comprehensive TypeScript DTO interfaces in `types/index.ts` for all 9 Master modules and removed obsolete dummy types.
- **transaksi:** Fixed TypeScript `useFetch` overload type definition in `composables/useTransaksi.ts`.

### 🧪 Testing & Verification
- **tests:** Added `test/composables/master.test.ts` and `test/composables/master_phase3.test.ts` bringing total Vitest test suite to **48/48 passed tests** (100% green).
- **lint:** Verified clean code adhering to ESLint standards with **0 errors and 0 warnings**.

---

## [Unreleased] - 2026-08-26

### Features
- **auth:** Integrated real login API endpoint (`POST /auth/login`).
- **proxy:** Configured dynamic Nitro route proxy for automatic CORS bypass in dev & prod.
- **toast:** Added global API error parser (`apiError.ts`) and PrimeVue Toast integration in `app.vue`.
- **tests:** Added initial Vitest unit test suite with 28 passing tests and 98.19% utils coverage.
- **types:** Added `@types/node` dependency for server runtime process typing.

### Performance Improvements
- **vite:** Pre-bundled OpenLayers (`ol/*`) and Apache ECharts in `vite.optimizeDeps`.
- **sidebar:** Enabled instant page prefetch for dashboard navigation on `<NuxtLink>`.

### Bug Fixes
- **header:** Cached user profile state on logout to prevent blank UI flicker during transition delay.
- **eslint:** Auto-fixed Vue SFC attributes order and removed console debug statements.

### UI Enhancements
- **header:** Displayed 2-letter uppercase username initials in avatar circle and `full_name` in dropdown.
- **session:** Mapped and persisted user session properties (`full_name`, `username`, `organization`, `nip`, `prnr`, and JWT tokens).
