# Development Rules & Standards — Tambora Web App

> Dokumen ini adalah acuan resmi tim developer & AI pairing untuk memenuhi standar Quality Gate SonarQube & CI/CD DevOps PLN.

---

## 1. Anti-Duplication (Target SonarQube < 3%)
- **Cek Komponen Base Terlebih Dahulu**: Sebelum membuat UI baru, gunakan komponen `components/base` (`BaseCard`, `BaseTable`, `BaseChart`, `BaseFormModal`, `BaseMap`, `SplitLayout`).
- **Prinsip Extract**:
  - Logika murni / kalkulasi / formatter → `/utils`
  - Logika reaktif / fetching → `/composables`
  - Elemen visual berulang → `/components/base`
- Jika pola kode muncul 2x di tempat berbeda, **wajib langsung refactor**.

---

## 2. Struktur & Urutan File `.vue`
Setiap file `.vue` **WAJIB** mengikuti urutan: **`<script>` → `<template>` → `<style>`**.

### Urutan Internal `<script setup lang="ts">`:
1. **Imports** (Vue core, external libs, composables, utils, types)
2. **Props & Emits** (`defineProps`, `defineEmits`)
3. **State & Refs** (`ref`, `reactive`)
4. **Computed Properties** (`computed`)
5. **Composable Calls** (`useOperasiPembangkit`, `useAuth`, `useApi`, etc.)
6. **Methods & Event Handlers** (`handleClick`, `handleSubmit`)
7. **Lifecycle Hooks** (`onMounted`, `onUnmounted` — selalu di paling bawah)

---

## 3. Data Fetching, `useApi`, & Security (SAST)
- **Data Fetching**: Wajib menggunakan `useApi()` atau `$fetch` / `useFetch` bawaan Nuxt. Dilarang menggunakan `axios`.
- **Handling Promise**: Semua async function wajib memiliki error handling (`try-catch` terpusat).
- **Zero `console.log`**: Dilarang meninggalkan `console.log` di komponen production (terdeteksi sebagai Code Smell / Security Hotspot di SonarQube). Gunakan notifikasi UI Toast untuk feedback error.
- **Security Hotspot**: Dilarang menggunakan `v-html` (kecuali tersanitasi ketat), `eval()`, atau menyimpan hardcoded secret keys.
- **Clean Code**: Tidak boleh ada unused variables, unused imports, atau dead code. `npm run lint` harus berstatus **0 error, 0 warning**.

---

## 4. Testing, Coverage, & SonarQube Quality Gate
- **Target SonarQube**: Wajib mencapai **Grade A** untuk Security, Reliability, Maintainability, dan Duplications ($< 3\%$).
- Setiap fungsi murni baru di `/utils` **wajib** dibuatkan unit test dengan Vitest di folder `/test`.
- Jalankan test secara lokal sebelum commit: `npm run test` atau `npm run test:coverage`.
- Pastikan file `coverage/lcov.info` ter-generate saat build/test untuk dikonsumsi oleh scanner SonarQube.

---

## 5. Semantic Versioning & CHANGELOG.md
Setiap rilis versi dan penambahan fitur wajib mendokumentasikan perubahan di `CHANGELOG.md` dengan standar **Conventional Changelog / Vue Core style**:

### Skema Penomoran Versi:
- **MAJOR (`X.0.0`)**: Perubahan arsitektur besar / breaking change API lama.
- **MINOR (`0.X.0`)**: Penambahan fitur baru non-breaking (misal: integrasi API login, proxy CORS, global toast).
- **PATCH (`0.0.X`)**: Perbaikan bug kecil / typo.

### Format Entri CHANGELOG.md:
```markdown
# CHANGELOG

## [Versi] (YYYY-MM-DD)

### Features
* **[scope]:** deskripsi fitur baru

### Performance Improvements
* **[scope]:** deskripsi optimasi performa

### Bug Fixes
* **[scope]:** deskripsi perbaikan bug
```
