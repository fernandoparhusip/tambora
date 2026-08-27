# CHANGELOG

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0] - 2026-08-27

### 🚀 Features & Architecture Modernization
* **form-engine:** Implement reactive conditional visibility (`hidden: (formData) => boolean`) and functional `disabled` state in `BaseFormModal.vue` and `FormFieldRenderer.vue` with automatic hidden field payload cleaning.
* **schemas:** Standardize all 8 Master modules (User, Driver, Organization, System, Role, Scope, Machine Condition, Asset) into dedicated `schemas/master/` configuration files.
* **table:** Add interactive Show/Hide Column Visibility Toggle popover with column locking for mandatory actions and localStorage preference persistence in `BaseTable.vue`.
* **dialog:** Add modern `BaseConfirmDialog.vue` component with smooth fade backdrop and danger badge, replacing all browser `window.confirm()` dialogs.
* **export:** Add `utils/exportExcel.ts` utility with UTF-8 BOM support for Microsoft Excel compatibility, replacing all dummy alerts on `BaseExportButton`.
* **types:** Modularize `types/` directory into isolated domain files (`form.types.ts`, `table.types.ts`, `auth.types.ts`, `master.types.ts`, `operasi.types.ts`) with seamless barrel export in `types/index.ts`.

### 🧪 Testing & Quality Gate
* **tests:** Add `test/utils/exportExcel.test.ts` unit tests, achieving **49/49 passed tests** across 8 test suites (100% green).
* **lint:** Enforce strict ESLint rules with **0 errors and 0 warnings**.
* **docs:** Update `docs/Schema.md` and `docs/Architecture.md` to reflect the new dynamic form schema and modular types architecture.

---

## [0.3.0] - 2026-08-27

### 🏛️ Features & Master Data Integration
* **master-organization:** Integrated `/api/v1/organization` CRUD with parent-child hierarchy, geographical coordinates (lat/lng), drawer form, and detail modal.
* **master-machine-condition:** Integrated `/api/v1/machine-conditions` CRUD with operational descriptions, active status switch, and centered modal.
* **master-system:** Integrated `/api/v1/systems` CRUD with system classification (`BESAR`/`KECIL`), UPK organization binding, and geographical coordinates.
* **master-asset:** Integrated `/api/v1/assets` CRUD with DMN, DMP, Daya Terpasang, generator & engine specs, transformer, fuel type, and ownership status.
* **master-driver:** Integrated `/api/v1/drivers` CRUD with strict 16-digit NIK validation, ISO RFC3339 date normalization, and 11-field drawer modal.
* **master-user:** Inlined User management with dynamic organization & role dropdowns directly fetched from backend.
* **master-role:** Inlined Role management with permission badges and system role protection.
* **master-permission:** Dynamic permission catalogue viewer with action badges and resource filtering.
* **sidebar:** Added 4 new Master navigation links and restructured Master menu items into a logical business hierarchy.

### 🎨 UI & Reusable Component System
* **base-select:** Created modern `BaseSelect` component featuring live search filtering, smooth transitions, active checkmarks, and `h-12` PLN design matching.
* **base-action-button:** Created `BaseActionButton` component standardizing View (Sky), Edit (Amber), and Delete (Red) buttons with micro-animations.
* **base-badge:** Created `BaseBadge` component standardizing multi-variant status badges (`success`, `danger`, `warning`, `info`, `primary`, `mono`, `system`).
* **dynamic-linkage:** Connected live backend organizations to User and System forms, removing all dummy fallback arrays.
* **home-welcome:** Created responsive centered welcome screen with dynamic 80% `LogoWelcome.png` scaling and realistic typewriter typing greeting in `pages/home/index.vue`.
* **login-typewriter:** Upgraded login welcome description animation to letter-by-letter typewriter typing effect in `components/login/LoginForm.vue`.
* **maptiler-integration:** Integrated MapTiler high-resolution tile service with API key support in `.env`, `.env.example`, `nuxt.config.ts`, and `components/base/BaseMap.vue`.

---

## [0.2.0] - 2026-08-26

### 🔐 Authentication & Network Proxy
* **auth:** Integrated real login API endpoint (`POST /auth/login`).
* **proxy:** Configured dynamic Nitro route proxy for automatic CORS bypass in dev & prod.
* **toast:** Added global API error parser (`apiError.ts`) and PrimeVue Toast integration in `app.vue`.
* **tests:** Added initial Vitest unit test suite with 28 passing tests and 98.19% utils coverage.
* **types:** Added `@types/node` dependency for server runtime process typing.
