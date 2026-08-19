# System Architecture — Tambora Web App

## 1. Tech Stack
- **Framework**: Nuxt 4 (Vue 3 Composition API + `<script setup>`)
- **State Management**: Pinia
- **UI Library & Icons**: Nuxt UI, PrimeVue (v5), Nuxt Lucide Icons
- **GIS / Mapping**: OpenLayers (`vue3-openlayers` + `ol`)
- **Data Visualization**: Apache ECharts (`echarts` + `vue-echarts`)
- **Form & Validation**: VeeValidate + Zod
- **Testing**: Vitest + @vue/test-utils + Happy-DOM (Coverage: @vitest/coverage-v8)
- **Code Quality**: ESLint + SonarQube Scanner

---

## 2. Layering Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Pages / Views                         │
│  (pages/home/dashboard, pages/home/master, pages/login)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│     Composables & Stores      │ │   Config Layer            │
│  (useOperasiPembangkit,       │ │  (config/forms,           │
│   useAuth, useTransaksi,      │ │   config/tables)          │
│   Pinia Stores)               │ └─────────────┬─────────────┘
└──────────────┬────────────────┘               │
               │                                │
               ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│               Base UI Components (Generic)                  │
│  (BaseCard, BaseTable, BaseChart, BaseMap, BaseFormModal)   │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│               Pure Utils & Data Fetching                    │
│  (utils/operasiPembangkitUtils, Nuxt useFetch / $fetch)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Architectural Principles
1. **Separation of Concerns**:
   - **`/components/base`**: Komponen murni generik, tidak boleh memiliki keterikatan bisnis (hanya menerima props/emits/slots).
   - **`/composables`**: State reaktif, business logic, dan orkestrasi data fetching (`useFetch` / `$fetch`).
   - **`/config`**: Definisi declarative untuk tabel (`TableColumn[]`) dan form (`FormFieldConfig[]`).
   - **`/utils`**: Pure functions tanpa side-effects (mudah di-unit test secara terisolasi).
2. **Data Fetching Standards**:
   - Wajib menggunakan bawaan Nuxt (`useFetch` / `$fetch`). Dilarang memakai `axios`.
   - Error handling terpusat di composable / global error handler.
3. **Quality & Maintainability**:
   - Code Duplication dijaga di bawah 3% sesuai aturan SonarQube.
   - Semua fungsi `utils` wajib memiliki unit test di folder `test/`.
