# Development Rules & Standards — Tambora Web App

> Dokumen ini adalah acuan resmi tim developer & AI pairing, bersinkronisasi dengan rules di `.agents/rules/rulesnumber1.md`.

---

## 1. Anti-Duplication (Target SonarQube < 3%)
- **Cek Komponen Base Terlebih Dahulu**: Sebelum membuat file baru, gunakan `BaseCard`, `BaseTable`, `BaseChart`, `BaseFormModal`, atau `SplitLayout` via props/config.
- **Prinsip Extract**:
  - Logika murni / kalkulasi -> `/utils`
  - Logika reaktif / fetching -> `/composables`
  - Elemen visual berulang -> `/components/base`
- Jika pola kode muncul 2x di tempat berbeda, **wajib langsung refactor**.

---

## 2. Struktur & Urutan File `.vue`
Setiap file `.vue` **WAJIB** mengikuti urutan: **`<script>` -> `<template>` -> `<style>`**.

### Urutan Internal `<script setup lang="ts">`:
1. **Imports** (Vue core, external libs, composables, utils, types)
2. **Props & Emits** (`defineProps`, `defineEmits`)
3. **State & Refs** (`ref`, `reactive`)
4. **Computed Properties** (`computed`)
5. **Composable Calls** (`useOperasiPembangkit`, `useAuth`, etc.)
6. **Methods & Event Handlers** (`handleClick`, `handleSubmit`)
7. **Lifecycle Hooks** (`onMounted`, `onUnmounted` — selalu di paling bawah)

---

## 3. Data Fetching & Security
- **Data Fetching**: Wajib menggunakan `useFetch` / `$fetch` bawaan Nuxt. Dilarang menggunakan `axios`.
- **Handling Promise**: Semua async function wajib memiliki error handling (`try-catch` atau `.catch()`).
- **Security Hotspot**: Dilarang menggunakan `v-html` (kecuali tersanitasi ketat), `eval()`, atau menyimpan hardcoded secret keys.
- **Clean Code**: Tidak boleh ada unused variables, unused imports, atau dead code.

---

## 4. Testing & Coverage
- Setiap fungsi murni baru di `/utils` **wajib** dibuatkan unit test dengan Vitest di folder `/test`.
- Jalankan test secara lokal sebelum commit: `npm run test` atau `npm run test:coverage`.
