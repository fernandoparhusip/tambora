# System Architecture — Tambora Web App

## 1. Tech Stack
- **Framework**: Nuxt 4 (Vue 3 Composition API + `<script setup>`)
- **State Management**: Pinia
- **UI Library & Components**: Nuxt UI, PrimeVue (v4 Aura Theme), Nuxt Lucide Icons, Vue Final Modal
- **GIS / Mapping**: OpenLayers (`ol` v10) + MapTiler Positron Vector/Raster Tiles
- **Data Visualization**: Apache ECharts (`echarts` + `vue-echarts`)
- **Form & Validation**: Schema-Driven Declarative Form Engine (`schemas/master/` & `schemas/transaksi/`)
- **Testing**: Vitest + @vue/test-utils + Happy-DOM (Coverage: @vitest/coverage-v8) — **64/64 Tests Passing (100% Green)**
- **Code Quality**: Strict ESLint + SonarQube Quality Gate Grade A

---

## 2. Layering Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       Pages / Views                         │
│  (pages/home/dashboard, pages/home/master, pages/home/transaksi)
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│     Composables & Stores      │ │      Schemas Layer        │
│  (useOperasiHarian, usePagu,  │ │  (schemas/master/*.ts,    │
│   useIdleTimer, useAppToast,  │ │   schemas/transaksi/*.ts, │
│   useNetwork, useAuthStore,   │ │   types/*.types.ts)       │
│   Pinia Stores)               │ │                           │
└──────────────┬────────────────┘ └─────────────┬─────────────┘
               │                                │
               ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│               Base UI Components (Generic)                  │
│  (BaseTable, BaseFormModal, BaseMap, BaseToastContainer)    │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│               Pure Utils & Data Fetching                    │
│  (utils/exportExcel, utils/apiError, Nitro Proxy /api/v1)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Enterprise Session Security Architecture

```mermaid
flowchart TD
    subgraph IDLE_SYSTEM["1. Inactivity Monitor (useIdleTimer)"]
        ACTIVITY["User Event (Mouse / Key / Touch / Scroll)"] -->|Reset Timer| TIMER["Idle Countdown (28 Menit)"]
        TIMER -->|28 Menit Inaktif| WARNING_MODAL["BaseIdleWarningModal (Grace Period 2 Menit)"]
        WARNING_MODAL -->|Klik 'Lanjutkan Sesi'| KEEP_ALIVE["Reset Timer & Silent Refresh Token"]
        WARNING_MODAL -->|Countdown 0 / Klik 'Keluar'| LOGOUT_TRIGGER["Panggil authStore.logout()"]
    end

    subgraph API_SYSTEM["2. Silent Refresh Interceptor (useApi)"]
        API_REQ["API Request"] -->|Status 401 Unauthorized| REFRESH_QUEUE["Single-Flight Mutex /auth/refresh"]
        REFRESH_QUEUE -->|Sukses| RETRY["Update Token & Resume Requests"]
        REFRESH_QUEUE -->|Gagal / Refresh Expired| FORCE_LOGOUT["Hapus Session & Redirect Login"]
    end

    subgraph SYNC_SYSTEM["3. Cross-Tab Sync (BroadcastChannel)"]
        LOGOUT_TRIGGER --> BROADCAST["BroadcastChannel('tambora_auth_channel')"]
        BROADCAST --> ALL_TABS["Sinkronkan Logout di Seluruh Tab Aktif"]
    end
```

---

## 4. Modern UI/UX Animation & Notification Architecture

```mermaid
flowchart TD
    subgraph ANIM_SUITE["1. High-Impact Animations"]
        PAGES["Page Navigation"] -->|GPU Cubic-Bezier| PAGE_TRANS["Smooth Fade & Slide-Up 6px"]
        DATA_LOAD["API Data Arrived"] -->|GSAP gsap.fromTo()| STAGGER["Table Rows Cascade (20ms Stagger)"]
        LOADING["Table Loading"] -->|Tailwind Gradient Wave| SKELETON["5-Row Shimmer Skeleton Loader"]
        CLICKS["Button Click"] -->|Spring Active Scale| TACTILE["Tactile Feedback (active:scale-90)"]
    end

    subgraph SAFETY_FEEDBACK["2. Data Safety & Global Toast"]
        FORM_DIRTY["Form Input Modified"] -->|Close Attempt| GUARD["Unsaved Changes Guard Dialog"]
        CRUD_ACTION["API Success / Error"] -->|useAppToast()| TOAST["BaseToastContainer (Animated Progress Bar)"]
    end
```

---

## 5. Core Architectural Principles
1. **Separation of Concerns**:
   - **`/components/base`**: Komponen murni generik, tidak boleh memiliki keterikatan bisnis (hanya menerima props/emits/slots).
   - **`/composables`**: State reaktif, business logic, dan orkestrasi data fetching (`useApi`, `useIdleTimer`, `useAppToast`, composable CRUD).
   - **`/schemas`**: Definisi declarative schema untuk seluruh form master (`schemas/master/*.schema.ts`) dan transaksi (`schemas/transaksi/*.schema.ts`).
   - **`/config`**: Konfigurasi navigasi terisolasi (`config/navigation.ts`).
   - **`/utils`**: Pure functions tanpa side-effects (mudah di-unit test secara terisolasi).
2. **Data Fetching & Proxy Standards**:
   - Wajib menggunakan composable terpusat `useApi()` atau bawaan Nuxt (`$fetch` / `useFetch`). Dilarang memakai `axios`.
   - Menggunakan dynamic Nitro reverse proxy (`/api/v1/**`) di `nuxt.config.ts` untuk menangani routing backend dan bypass CORS.
   - Error handling terpusat otomatis memicu notifikasi Toast dan penanganan silent refresh / auto-logout saat 401 Unauthorized.
3. **Quality & Maintainability**:
   - Code Duplication dijaga di bawah 3% sesuai aturan SonarQube.
   - Semua fungsi `utils`, `composables`, dan `stores` wajib memiliki unit test di folder `test/` (Target Coverage > 80%).
4. **Performance & Bundling**:
   - Animasi wajib memanfaatkan **Hardware Acceleration (GPU)** lewat `transform` dan `opacity` dengan auto `clearProps` pada GSAP.
   - Library berat (OpenLayers GIS `ol/*` & Apache ECharts) di-prebundle melalui `vite.optimizeDeps` untuk menjamin navigasi instan.

