# CHANGELOG

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2026-08-31

### 🛡️ Enterprise Security, Device Metadata, Tabbed Pagu & Strict POST Policy

- **device-metadata:** Created [`utils/deviceMeta.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/utils/deviceMeta.ts) generating persistent `X-Device-ID` (UUID in localStorage), `X-Device-Name`, `X-Browser`, and `X-OS` injected into login requests (`POST /api/v1/auth/login`) for backend audit trail & SOC compliance.
- **strict-post-standard:** Replaced all HTTP `PUT` and `DELETE` methods across all composables (`useUser`, `useOrganization`, `useOperasiHarian`, `usePemakaianBahanBakar`, `usePermission`) with standard `POST /{resource}/{id}` (Update) and `POST /{resource}/{id}/delete` (Delete) to match enterprise backend API security policy.
- **pagu-tab-unification:** Unified `Pagu (Unit)` and `Pagu Bidang` into a single page (`/home/transaksi/pagu`) with dynamic `[ Unit | Bidang ]` tab switcher, dedicated table columns, export, and dynamic form drawers for Unit vs Bidang.
- **base-date-filter:** Created reusable [`components/base/BaseDateFilter.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseDateFilter.vue) component with PrimeVue DatePicker integration, `h-12` PLN theme styling, and fixed input sizing.
- **permission-crud:** Created [`schemas/master/permission.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/permission.schema.ts) and upgraded [`pages/home/master/permission.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/permission.vue) with full CRUD operations (`createPermission`, `updatePermission`, `deletePermission`) and confirmation dialog.
- **form-draft-discard-fix:** Enhanced `confirmDiscardChanges()` in [`components/base/BaseFormModal.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseFormModal.vue) to cleanly purge draft from storage and cancel pending debounces when choosing "Buang & Tutup".
- **modal-layering:** Fixed `BaseIdleWarningModal.vue` z-index layering with `z-[100]` container and `fixed inset-0 z-[99]` backdrop overlay to guarantee complete full-screen coverage over sticky headers and tables.
- **tests:** Expanded Vitest test suites to **88 passing tests (100% green)** across 15 test suites including `test/utils/deviceMeta.test.ts`.

---

## [0.7.0] - 2026-08-31

### 📶 Remote Resilience & Low-Bandwidth Optimization (Sumbawa Edition)

- **form-draft:** Created `composables/useFormDraft.ts` with debounced (500ms) automatic draft saving to browser storage, recovery banner with timestamp in `BaseFormModal.vue`, and auto-cleanup on successful submit.
- **transaksi-drafts:** Integrated unique `draft-key` across all 7 Transaksi pages (`operasi-harian`, `pemakaian-bahan-bakar`, `pembebanan`, `pagu`, `pagu-bidang`, `prognosa`, `nko`).
- **swr-api-cache:** Created `composables/useApiCache.ts` providing Stale-While-Revalidate (SWR) caching with configurable TTL, sessionStorage persistence, concurrent request deduplication, and prefix-based cache invalidation.
- **smart-network-retry:** Upgraded `composables/useApi.ts` with automated retry policy (up to 2 retries with 1000ms backoff) for network errors and gateway timeouts (408, 429, 500, 502, 503, 504).
- **captcha-cdn:** Upgraded `SliderCaptcha.vue` to use high-speed Unsplash CDN image pool with randomized shuffling, accelerated 2000ms preload timeout, and local asset fallback.
- **developer-guide:** Published comprehensive [`docs/DeveloperGuide.md`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/docs/DeveloperGuide.md) documenting the 5-step SOP for adding new Master & Transaksi modules.
- **ci-cd-fix:** Purged platform-specific Windows binaries (`@oxc-parser/binding-win32-x64-msvc`, `@rolldown/binding-win32-x64-msvc`, `oxc-parser`) from `package.json` devDependencies to resolve `EBADPLATFORM` failure on Linux Alpine GitLab CI/CD runners and Docker container builds.
- **tests:** Added `test/composables/formDraft.test.ts` and `test/composables/apiCache.test.ts` achieving **72/72 tests passed (100% green)** across 14 test suites.

---

## [0.6.0] - 2026-08-28

### 📶 Network Resilience & Offline Detection

- **network-status:** Integrated `composables/useNetworkStatus.ts` listening to browser online/offline events, notifying user seamlessly via floating Toast notifications and subtle top header pill indicator without obtrusive UI banners.
- **tests:** Added `test/composables/network.test.ts` achieving **64/64 tests passed (100% green)** across 12 test suites.

### 🎨 Modern UI/UX & GSAP Animation Suite

- **sidebar-icons:** Dynamic SVG menu icon auto-loader using `import.meta.glob('@/assets/icon/menu/*.svg')` in `AppSidebar.vue`.
- **table-separator:** Added distinct bottom border separators (`border-b border-gray-100`) between `tbody` data rows in `BaseTable.vue` for crisp row readability.
- **license-compliance:** Standardized on PrimeVue `4.5.5` (Pure MIT License) and `@primeuix/themes` `1.2.3` for 100% enterprise & PLN legal compliance, permanently purging all license warnings.
- **page-transitions:** Added GPU-accelerated page and layout transitions in `nuxt.config.ts` and `assets/css/primevue-overrides.css` with `cubic-bezier(0.16, 1, 0.3, 1)` easing.
- **table-stagger:** Integrated GSAP `gsap.fromTo()` stagger animation on `BaseTable.vue` data rows with automatic `clearProps: 'transform,opacity'` to maintain sticky column integrity.
- **skeleton-loader:** Added 5-row Shimmer Skeleton table loader with dynamic column widths in `BaseTable.vue`, replacing standard circular spinners.
- **tactile-buttons:** Added spring active scale feedback (`active:scale-[0.90]` & `active:scale-[0.96]`) across `BaseActionButton.vue` and `BaseExportButton.vue`.
- **modal-animations:** Added `backdrop-blur-xs` and spring zoom-in transitions to `BaseFormModal.vue`, `BaseDetailModal.vue`, and `BaseConfirmDialog.vue`.

### 🧭 AppSidebar Modular Compression & Navigation SSOT

- **nav-config:** Extracted 16-item navigation tree into typed [`config/navigation.ts`](file:///c:/Users/USER/Documents/GitHub/tambora-frontend/config/navigation.ts), reducing `AppSidebar.vue` file size by ~40% while preserving Level 3 recursive accordion support.
- **dynamic-page-headers:** Centralized page title and breadcrumb resolution across all 16 pages into `config/navigation.ts`, allowing zero-boilerplate `<BasePageHeader />` and instant synchronized renaming across sidebar, breadcrumbs, and page headers.
- **auto-import-cleanup:** Fully purged all manual component imports across 16 views and base components, maximizing Nuxt 4 native automatic component registration.
- **seamless-guideline:** Connected adjacent active/hover indicators into a single continuous solid blue line matching Figma design.
- **submenu-stagger:** Added cascade entrance animation for submenu items upon accordion expansion.
- **auto-scroll:** Added smooth auto-scroll into view when active route navigates to lower items (e.g. NKO / Prognosa).

### 🛡️ Form Protection, Standardization & Toast System

- **swagger-alignment:** Completed 100% Swagger OpenAPI audit (58 endpoints). Integrated full CRUD action buttons (`view`, `edit`, `delete`) and `BaseDetailModal` across `role.vue`, `scope.vue`, `machine-condition.vue`, and `permission.vue`.
- **form-guard:** Integrated Unsaved Changes Guard in `BaseFormModal.vue` with left-aligned enterprise card layout and `<Teleport to="body">` full-screen backdrop to prevent accidental data loss with prompt dialog ("Lanjut Mengisi" vs "Buang & Tutup").
- **modal-standardization:** Standardized 100% of Master and Transaksi form modals to unified Right Drawer (`variant="drawer"`), eliminating inconsistent centered popup dialogs across `role.vue`, `scope.vue`, and `machine-condition.vue`.
- **toast-system:** Created global `composables/useAppToast.ts` and `components/base/BaseToastContainer.vue` with animated timer countdown progress bars.
- **tests:** Added `test/composables/toast.test.ts` achieving **63/63 tests passed (100% green)** across 11 test suites.

---

## [0.5.0] - 2026-08-28

### 🔒 Features & Authentication Modernization

- **auth-store:** Refactored Pinia store with 24h work-shift cookie lifecycle, `refreshSession()`, single-flight mutex on 401, and `BroadcastChannel('tambora_auth_channel')` cross-tab sync in `stores/auth.ts`.
- **auth-guard:** Updated `middleware/auth.global.ts` with preserve `redirect` query parameter support and automatic redirection to intended route upon login.
- **idle-timeout:** Added `components/base/BaseIdleWarningModal.vue` and `composables/useIdleTimer.ts` providing 28-minute inactivity detection with a 2-minute grace countdown modal.
- **api-interceptor:** Upgraded `composables/useApi.ts` with single-flight mutex refresh queue to prevent race conditions during concurrent 401 responses.
- **tests:** Added `test/composables/idleTimer.test.ts` and `test/composables/transaksi.test.ts` unit tests, achieving **60/60 tests passed (100% green)** across 10 test suites.

### ⚡ Features & Transaksi Integration (7 Live Modules)

- **transaksi-schemas:** Standardized dedicated form schema engine for all 7 Transaksi modules in `schemas/transaksi/` with root barrel export in `schemas/index.ts`.
- **transaksi-operasi-harian:** Integrated `/api/v1/operasi-harian` CRUD with power parameters (DMN, DMP, Terpasang, Aktual), energy production, fuel consumption, and Excel export in `pages/home/transaksi/operasi-harian.vue`.
- **transaksi-pemakaian-bahan-bakar:** Integrated `/api/v1/pemakaian-bahan-bakar` CRUD with fuel consumption tracking (Batubara, HSD, B30, MFO, Biomassa, Gas), stock monitoring, and Excel export in `pages/home/transaksi/pemakaian-bahan-bakar.vue`.
- **transaksi-pembebanan:** Integrated `/api/v1/pembebanan` CRUD with active electrical load (MW), operating voltage (kV), system frequency status badge (Hz), and power factor in `pages/home/transaksi/pembebanan.vue`.
- **transaksi-pagu:** Integrated `/api/v1/pagu` CRUD with Pagu AO & AKO, AI & AKI, POS 54, multi-level revision workflow (`/revise`), and native Excel export (`/export`) in `pages/home/transaksi/pagu.vue`.
- **transaksi-pagu-bidang:** Integrated `/api/v1/pagu-bidang` CRUD with parent Pagu Unit linkage, multi-bidang allocation (Ophar, Adum, K3L), percentage validation, and Excel export in `pages/home/transaksi/pagu-bidang.vue`.
- **transaksi-prognosa:** Integrated `/api/v1/prognosa` CRUD with machine readiness parameters (DMN, DMP, PH, SH, RSH, POH, MOH, FOH, AH, OMC) for PLTU & Non-PLTU and native Excel export in `pages/home/transaksi/prognosa.vue`.
- **transaksi-nko:** Integrated `/api/v1/nko` CRUD with batch KPI entry, polarity status, monthly targets vs actual realization, and native Excel export in `pages/home/transaksi/nko.vue`.
- **sidebar:** Restructured Master menu order (Option 1) and added `Transaksi` navigation dropdown menu with all 7 submenus in `components/base/AppSidebar.vue`.
- **map:** Resolved MapTiler API Key integration (`VITE_MAPTILER_KEY` / `NUXT_PUBLIC_MAPTILER_KEY`) and configured clean Positron tile layer in `components/base/BaseMap.vue`.
- **animations:** Added realistic typewriter text animation for greeting on `/home` and description on `/login` with clean static state after finish.
- **types:** Added comprehensive DTOs and payloads for all 7 transaction modules in `types/transaksi.types.ts`.

---

## [0.4.0] - 2026-08-27

### 🚀 Features & Architecture Modernization

- **form-engine:** Implement reactive conditional visibility (`hidden: (formData) => boolean`) and functional `disabled` state in `BaseFormModal.vue` and `FormFieldRenderer.vue` with automatic hidden field payload cleaning.
- **schemas:** Standardize all 8 Master modules (User, Driver, Organization, System, Role, Scope, Machine Condition, Asset) into dedicated `schemas/master/` configuration files.
- **table:** Add interactive Show/Hide Column Visibility Toggle popover with column locking for mandatory actions and localStorage preference persistence in `BaseTable.vue`.
- **dialog:** Add modern `BaseConfirmDialog.vue` component with smooth fade backdrop and danger badge, replacing all browser `window.confirm()` dialogs.
- **export:** Add `utils/exportExcel.ts` utility with UTF-8 BOM support for Microsoft Excel compatibility, replacing all dummy alerts on `BaseExportButton`.
- **types:** Modularize `types/` directory into isolated domain files (`form.types.ts`, `table.types.ts`, `auth.types.ts`, `master.types.ts`, `operasi.types.ts`) with seamless barrel export in `types/index.ts`.

### 🧪 Testing & Quality Gate

- **tests:** Add `test/utils/exportExcel.test.ts` unit tests, achieving **49/49 passed tests** across 8 test suites (100% green).
- **lint:** Enforce strict ESLint rules with **0 errors and 0 warnings**.
- **docs:** Update `docs/Schema.md` and `docs/Architecture.md` to reflect the new dynamic form schema and modular types architecture.

---

## [0.3.0] - 2026-08-27

### 🏛️ Features & Master Data Integration

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

---

## [0.2.0] - 2026-08-26

### 🔐 Authentication & Network Proxy

- **auth:** Integrated real login API endpoint (`POST /auth/login`).
- **proxy:** Configured dynamic Nitro route proxy for automatic CORS bypass in dev & prod.
- **toast:** Added global API error parser (`apiError.ts`) and PrimeVue Toast integration in `app.vue`.
- **tests:** Added initial Vitest unit test suite with 28 passing tests and 98.19% utils coverage.
- **types:** Added `@types/node` dependency for server runtime process typing.
