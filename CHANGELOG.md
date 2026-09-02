# CHANGELOG

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-09-02

### 🏢 8 Modul Baru Swagger OpenAPI, Standarisasi Form Pengguna, Matrix Hak Akses Tablet & Dynamic RBAC

- **master-user-form-standardization:** Transformed Master Pengguna ([`pages/home/master/user.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/user.vue)) to unified `BaseFormModal` single-page drawer without tabs, organized logically in 4 distinct sections:
  1. **Identitas Akun:** `tipe` (SSO/Non-SSO radio), `nama`, `email`, `nip`, `password` (auto-hidden if SSO).
  2. **Penugasan & Organisasi:** `akunPengelola` (switch), `pengelola` (if pengelola), `organisasi` (if non-pengelola), `jabatan`, `statusKaryawan`.
  3. **Hak Akses & Kewenangan:** `aksesLevel` (Akses Grup / Role), `scopeLevel` (Scope Wilayah: Unit/Cabang/Regional/Sentral/Nasional), `permissions` (Multi-select Hak Akses Khusus).
  4. **Kontak & Domisili:** `noTelp`, `perNr`, `alamat`.
  - Cleaned initial form create state with empty values and explicit placeholder guides.
  - Seamlessly mapped form state to 20-field backend OpenAPI schema (`CreateUserRequest` & `UpdateUserRequest`).
- **akses-grup-tablet-responsive-matrix:** Optimized permission matrix table in [`pages/home/konfigurasi-aplikasi/akses-grup.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/akses-grup.vue) for tablet, iPad, and split-screen resolutions by locking Module column width (`w-[220px] shrink-0`) and enabling horizontal scrolling (`overflow-x-auto min-w-[820px]`), preventing character wrapping.
- **dropdown-teleport-and-backend-resilience:** Updated `teleportTarget` in [`components/base/FormFieldRenderer.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/FormFieldRenderer.vue) to `"body"` to prevent popup clipping inside drawer modals, and made `fetchRoles()` parser in [`composables/master/useRole.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useRole.ts) flexibly handle array responses from backend (`res.data || res.data.roles || res.data.items || res`).
- **frontend-menu-auth-independence:** Refined `hasMenuAccess` in [`stores/auth.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/stores/auth.ts) to strictly validate sidebar navigation routes by comparing frontend route metadata (`permission` and `menuCode`) against backend user access grants, ignoring backend route path mismatches.
- **pln-unit-hierarchy-modules:** Implemented 7 granular PLN organizational unit & power plant master modules under `Master Data`:
  - **Master Regional:** [`pages/home/master/regional.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/regional.vue), [`composables/master/useRegional.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useRegional.ts), [`schemas/master/regional.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/regional.schema.ts) (`/api/v1/regional`).
  - **Master UIW / UID:** [`pages/home/master/uiw-uid.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/uiw-uid.vue), [`composables/master/useUiwUid.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUiwUid.ts), [`schemas/master/uiw-uid.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/uiw-uid.schema.ts) (`/api/v1/uiw-uid`).
  - **Master UIK:** [`pages/home/master/uik.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/uik.vue), [`composables/master/useUik.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUik.ts), [`schemas/master/uik.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/uik.schema.ts) (`/api/v1/uik`).
  - **Master UP2D:** [`pages/home/master/up2d.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/up2d.vue), [`composables/master/useUp2d.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUp2d.ts), [`schemas/master/up2d.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/up2d.schema.ts) (`/api/v1/up2d`).
  - **Master UPK:** [`pages/home/master/upk.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/upk.vue), [`composables/master/useUpk.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUpk.ts), [`schemas/master/upk.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/upk.schema.ts) (`/api/v1/upk`).
  - **Master Unit Layanan:** [`pages/home/master/unit-layanan.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/unit-layanan.vue), [`composables/master/useUnitLayanan.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUnitLayanan.ts), [`schemas/master/unit-layanan.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/unit-layanan.schema.ts) (`/api/v1/unit-layanan`).
  - **Master Sentral Pembangkit:** [`pages/home/master/sentral.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/sentral.vue), [`composables/master/useSentral.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useSentral.ts), [`schemas/master/sentral.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/sentral.schema.ts) (`/api/v1/sentral`).
- **menu-management-module:** Implemented Master Menu management under `Konfigurasi Aplikasi`:
  - **Page & Schema:** [`pages/home/konfigurasi-aplikasi/menu.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/menu.vue), [`schemas/konfigurasi-aplikasi/menu.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/konfigurasi-aplikasi/menu.schema.ts).
  - **Composable:** [`composables/konfigurasi-aplikasi/useMenu.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/konfigurasi-aplikasi/useMenu.ts) with full CRUD support (`/api/v1/menu`).
- **types-and-dto:** Added comprehensive TypeScript interfaces for all 8 modules in [`types/master.types.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/types/master.types.ts).
- **backend-export-cleanup:** Removed client-side export functionality from all master and transaction pages where backend has no dedicated export endpoint. Retained export only on the 3 officially supported endpoints (`/api/v1/pagu/export`, `/api/v1/prognosa/export`, `/api/v1/nko/export`).
- **base-create-button-globalization:** Standardized [`components/base/BaseCreateButton.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseCreateButton.vue) with hardcoded `"TAMBAH DATA"` label, removing unnecessary label props across all 23 views (`<BaseCreateButton @click="openCreateModal" />`).
- **base-search-input-globalization:** Standardized [`components/base/BaseSearchInput.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseSearchInput.vue) with hardcoded `placeholder="Cari Data"`, removing redundant placeholder props across all 23 views (`<BaseSearchInput v-model="searchQuery" />`).
- **motion-system-polish:** Implemented Emil Kowalski design engineering motion tokens, reduced-motion accessibility, 60 FPS runtime `scrollHeight` sidebar accordion, unified floating popovers (`150ms ease-out`, `translate-y-1`), and GSAP tween safety.
- **quality-gate-and-tests:** Added unit test suites [`test/composables/masterUnitPLN.test.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/test/composables/masterUnitPLN.test.ts) and [`test/composables/menu.test.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/test/composables/menu.test.ts). Reached **122 passed unit tests across 20 test suites (100% green)** and **0 ESLint errors/warnings**.

## [0.5.0] - 2026-09-01

### ⚙️ Modul Konfigurasi Aplikasi, User 20-Field Payload, Rich Permission Tooltip & BaseTable Sticky Fix

- **konfigurasi-aplikasi-module:** Created dedicated `konfigurasi-aplikasi` module with clean separation from master data:
  - **Pages:** [`pages/home/konfigurasi-aplikasi/akses-level.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/akses-level.vue) (migrated from Scope) and [`pages/home/konfigurasi-aplikasi/akses-grup.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/akses-grup.vue) (migrated from Role).
  - **Composables:** [`composables/konfigurasi-aplikasi/useAksesLevel.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/konfigurasi-aplikasi/useAksesLevel.ts) and [`composables/konfigurasi-aplikasi/useAksesGrup.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/konfigurasi-aplikasi/useAksesGrup.ts) covering all 5 REST endpoints each (`GET list`, `POST create`, `GET detail`, `POST update`, `POST delete`) with isolated `detailLoading`.
  - **Schemas:** [`schemas/konfigurasi-aplikasi/akses-level.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/konfigurasi-aplikasi/akses-level.schema.ts) and [`schemas/konfigurasi-aplikasi/akses-grup.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/konfigurasi-aplikasi/akses-grup.schema.ts).
  - **Navigation:** Added `konfigurasi-aplikasi` menu category in [`config/navigation.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/config/navigation.ts) with `KonfigurasiAplikasiIcon.svg` mapped in [`AppSidebar.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/AppSidebar.vue).
- **user-create-update-payload:** Aligned user create and update requests to strictly match the 20-field backend OpenAPI schema (`access_level`, `address`, `akses_grup`, `approval_code`, `description`, `email`, `full_name`, `is_pengelola`, `is_sso`, `jabatan`, `jenis_pengguna`, `main_application`, `nip`, `organization`, `organization_id`, `password`, `permission_overrides`, `pernr`, `phone_number`, `role_assignments`, `status_karyawan`) in [`pages/home/master/user.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/user.vue) and [`types/master.types.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/types/master.types.ts).
- **permission-detail-interactive-ui:** Enhanced detail modal in `akses-grup.vue` and `user.vue` with real-time permission search filter (`> 6 items`), badge counters, Indonesian timestamp formatting, dynamic activity logs, and rich HTML tooltips (`v-tooltip.top`) breaking down module and action.
- **base-table-sticky-border:** Resolved browser table border collapse bug on scrolling by switching `BaseTable.vue` to `border-separate border-spacing-0` and adding explicit `border-b border-gray-200` to `th` elements. Removed hardcoded left shadow on `actions` column for a clean seamless UI.
- **permission-auto-key-and-payload:** Updated Permission form to strictly send 4-field Go struct (`permission_key`, `resource_id`, `action_id`, `description`) with auto-generated disabled `permission_key` from selected resource and action code.
- **tests:** Expanded Vitest suite to **112 passing tests across 18 test suites (100% green)**.

### 🔄 Centralized Table Reload, Lucide Icons & Navigation Menu Alignment

- **navigation-titles:** Aligned menu item titles in [`config/navigation.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/config/navigation.ts) (`Role & Hak Akses` -> `Role`, `Katalog Hak Akses (Permission)` -> `Akses Permission`) with standardized TypeScript formatting.
- **centralized-table-reload:** Added interactive `[ 🔄 Muat Ulang ]` button in empty state inside [`components/base/BaseTable.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseTable.vue) that emits `@reload`. Wired `@reload` across all 15 Master Data and Transaksi pages for on-demand asynchronous table re-fetching.
- **lucide-icon-components:** Standardized table empty state with official `<Database />` and `<RotateCw />` components from `@lucide/vue` replacing inline manual SVGs.
- **detail-loading-isolation:** Separated `detailLoading` from list `loading` in [`composables/master/useUser.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUser.ts) and [`composables/master/usePermission.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/usePermission.ts) to prevent main table reloading/flicker when opening detail modals.
- **permission-detail-fetch:** Wired `getPermissionById(row.id)` (`GET /api/v1/permissions/:id`) on view action in [`pages/home/master/permission.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/permission.vue).
- **type-safety-fix:** Fixed prop binding `:items="tabOptions"` on `<BaseTabFilter>` in [`pages/home/transaksi/pagu.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/transaksi/pagu.vue).
- **tests:** Maintained **105 passing tests (100% green)** across 17 Vitest test suites.

### 👥 User Permissions Multi-Select, Form Control Styling & Nuxt Single-Root Fix

- **user-permissions-multiselect:** Replaced legacy `aksesGrup` with dynamic `permissions` searchable multi-select in [`schemas/master/user.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/user.schema.ts) and [`pages/home/master/user.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/user.vue).
- **permissions-combo-sync:** Integrated `fetchPermissionsCombo` in `composables/master/usePermission.ts` (`POST /api/v1/permissions/combo`) with graceful fallback to `getUserById` (`GET /api/v1/users/:id`), synchronizing active user permissions on edit.
- **form-controls-light-theme:** Fixed native `<input type="radio">` and `<input type="checkbox">` rendering with dark/black filled appearance in Chromium by adding `color-scheme: light !important`, `accent-color: #2563eb !important`, and white background overrides in `assets/css/primevue-overrides.css` and `components/base/FormFieldRenderer.vue`.
- **single-root-fix:** Resolved `[NUXT_E4004]` template warning in `pages/home.vue` by encapsulating top-level comments inside the main container `<div>`.
- **table-state-composable:** Created generic [`composables/useTableState.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/useTableState.ts) for reusable multi-field searching, pagination slicing, and automatic page reset, reducing boilerplate across views.
- **schema-validation-ssot:** Centralized Zod validation schema inside [`schemas/master/user.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/user.schema.ts) as Single Source of Truth (SSOT).
- **tests:** Expanded Vitest suite to **105 passing tests (100% green)** across 17 test suites including `test/composables/tableState.test.ts`.

---

## [0.4.0] - 2026-08-31

### 🛡️ Enterprise Security, Device Metadata, Tabbed Pagu & Strict POST Policy

- **device-metadata:** Created [`utils/deviceMeta.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/utils/deviceMeta.ts) generating persistent `X-Device-ID` (UUID in localStorage), `X-Device-Name`, `X-Browser`, and `X-OS` injected into login requests (`POST /api/v1/auth/login`) for backend audit trail & SOC compliance.
- **strict-post-standard:** Replaced all HTTP `PUT` and `DELETE` methods across all composables (`useUser`, `useOrganization`, `useOperasiHarian`, `usePemakaianBahanBakar`, `usePermission`) with standard `POST /{resource}/{id}` (Update) and `POST /{resource}/{id}/delete` (Delete) to match enterprise backend API security policy.
- **pagu-tab-unification:** Unified `Pagu (Unit)` and `Pagu Bidang` into a single page (`/home/transaksi/pagu`) with dynamic `[ Unit | Bidang ]` tab switcher, dedicated table columns, export, and dynamic form drawers for Unit vs Bidang.
- **base-date-filter:** Created reusable [`components/base/BaseDateFilter.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseDateFilter.vue) component with PrimeVue DatePicker integration, `h-12` PLN theme styling, and fixed input sizing.
- **permission-crud:** Created [`schemas/master/permission.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/permission.schema.ts) and upgraded [`pages/home/master/permission.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/permission.vue) with full CRUD operations (`createPermission`, `updatePermission`, `deletePermission`) and confirmation dialog.
- **form-draft-discard-fix:** Enhanced `confirmDiscardChanges()` in [`components/base/BaseFormModal.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseFormModal.vue) to cleanly purge draft from storage and cancel pending debounces when choosing "Buang & Tutup".
- **modal-layering:** Fixed `BaseIdleWarningModal.vue` z-index layering with `z-[100]` container and `fixed inset-0 z-[99]` backdrop overlay to guarantee complete full-screen coverage over sticky headers and tables.

### 📶 Remote Resilience & Low-Bandwidth Optimization (Sumbawa Edition)

- **form-draft:** Created `composables/useFormDraft.ts` with debounced (500ms) automatic draft saving to browser storage, recovery banner with timestamp in `BaseFormModal.vue`, and auto-cleanup on successful submit.
- **transaksi-drafts:** Integrated unique `draft-key` across all 7 Transaksi pages (`operasi-harian`, `pemakaian-bahan-bakar`, `pembebanan`, `pagu`, `pagu-bidang`, `prognosa`, `nko`).
- **swr-api-cache:** Created `composables/useApiCache.ts` providing Stale-While-Revalidate (SWR) caching with configurable TTL, sessionStorage persistence, concurrent request deduplication, and prefix-based cache invalidation.
- **smart-network-retry:** Upgraded `composables/useApi.ts` with automated retry policy (up to 2 retries with 1000ms backoff) for network errors and gateway timeouts (408, 429, 500, 502, 503, 504).
- **captcha-cdn:** Upgraded `SliderCaptcha.vue` to use high-speed Unsplash CDN image pool with randomized shuffling, accelerated 2000ms preload timeout, and local asset fallback.
- **developer-guide:** Published comprehensive [`docs/DeveloperGuide.md`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/docs/DeveloperGuide.md) documenting the 5-step SOP for adding new Master & Transaksi modules.
- **ci-cd-fix:** Purged platform-specific Windows binaries (`@oxc-parser/binding-win32-x64-msvc`, `@rolldown/binding-win32-x64-msvc`, `oxc-parser`) from `package.json` devDependencies to resolve `EBADPLATFORM` failure on Linux Alpine GitLab CI/CD runners and Docker container builds.
- **tests:** Added `test/composables/formDraft.test.ts` and `test/composables/apiCache.test.ts` achieving **88/88 tests passed (100% green)** across 15 test suites.

---

## [0.3.0] - 2026-08-28

### 📶 Network Resilience & Offline Detection

- **network-status:** Integrated `composables/useNetworkStatus.ts` listening to browser online/offline events, notifying user seamlessly via floating Toast notifications and subtle top header pill indicator without obtrusive UI banners.

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

### 🔒 Authentication Modernization & Session Security

- **auth-store:** Refactored Pinia store with 24h work-shift cookie lifecycle, `refreshSession()`, single-flight mutex on 401, and `BroadcastChannel('tambora_auth_channel')` cross-tab sync in `stores/auth.ts`.
- **auth-guard:** Updated `middleware/auth.global.ts` with preserve `redirect` query parameter support and automatic redirection to intended route upon login.
- **idle-timeout:** Added `components/base/BaseIdleWarningModal.vue` and `composables/useIdleTimer.ts` providing 28-minute inactivity detection with a 2-minute grace countdown modal.
- **api-interceptor:** Upgraded `composables/useApi.ts` with single-flight mutex refresh queue to prevent race conditions during concurrent 401 responses.

### ⚡ Transaksi Integration (7 Live Modules)

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
- **tests:** Added unit tests achieving **64/64 tests passed (100% green)** across 12 test suites.

---

## [0.2.0] - 2026-08-27

### 🚀 Features & Architecture Modernization

- **form-engine:** Implement reactive conditional visibility (`hidden: (formData) => boolean`) and functional `disabled` state in `BaseFormModal.vue` and `FormFieldRenderer.vue` with automatic hidden field payload cleaning.
- **schemas:** Standardize all 8 Master modules (User, Driver, Organization, System, Role, Scope, Machine Condition, Asset) into dedicated `schemas/master/` configuration files.
- **table:** Add interactive Show/Hide Column Visibility Toggle popover with column locking for mandatory actions and localStorage preference persistence in `BaseTable.vue`.
- **dialog:** Add modern `BaseConfirmDialog.vue` component with smooth fade backdrop and danger badge, replacing all browser `window.confirm()` dialogs.
- **export:** Add `utils/exportExcel.ts` utility with UTF-8 BOM support for Microsoft Excel compatibility, replacing all dummy alerts on `BaseExportButton`.
- **types:** Modularize `types/` directory into isolated domain files (`form.types.ts`, `table.types.ts`, `auth.types.ts`, `master.types.ts`, `operasi.types.ts`) with seamless barrel export in `types/index.ts`.

### 🏛️ Master Data Integration

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
- **tests:** Added `test/utils/exportExcel.test.ts` unit tests, achieving **49/49 passed tests** across 8 test suites (100% green).

---

## [0.1.0] - 2026-08-26

### 🔐 Authentication & Network Proxy

- **auth:** Integrated real login API endpoint (`POST /auth/login`).
- **proxy:** Configured dynamic Nitro route proxy for automatic CORS bypass in dev & prod.
- **toast:** Added global API error parser (`apiError.ts`) and PrimeVue Toast integration in `app.vue`.
- **tests:** Added initial Vitest unit test suite with 28 passing tests and 98.19% utils coverage.
- **types:** Added `@types/node` dependency for server runtime process typing.
