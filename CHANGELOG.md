# CHANGELOG

Semua perubahan penting pada proyek ini didokumentasikan di berkas ini.
Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan proyek ini mematuhi standar [Semantic Versioning](https://semver.org/lang/id/).

## [0.7.0] - 2026-09-05

### 🛡️ Pemantau Sesi Inaktivitas, Form Draft, Desain Kartu Hak Akses, Paritas Cabang/Ranting, Master Sistem & Pembersihan Copywriting

- **keselarasan-master-ranting-dan-cabang:** Memulihkan status approval (`approve_status`) pada Master Ranting ([`schemas/master/ranting.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/ranting.schema.ts), [`pages/home/master/ranting.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/ranting.vue)):
  - Memisahkan secara tegas antara "Status Ranting" (AKTIF / TIDAK AKTIF) dan "Status" approval (APPROVED / DRAFT / REJECTED).
  - Menyelaraskan pewarnaan badge status approval dengan Master Cabang (APPROVED: hijau, DRAFT: abu-abu, REJECTED: merah).
  - Memastikan konsistensi payload form, skema validasi, serta dialog konfirmasi aksi CRUD.
- **standarisasi-master-sistem:** Peningkatan arsitektur dan interaksi pada Master Sistem ([`composables/master/useSystem.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useSystem.ts), [`pages/home/master/system.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/system.vue)):
  - Integrasi composable asynchronous detail `useAsyncDetail<SystemItem>` untuk pemuatan detail record secara terisolasi.
  - Memisahkan state `detailLoading` agar tidak memblokir tabel utama saat membaca detail data.
  - Menghubungkan riwayat aktivitas dinamis langsung ke komponen `<BaseDetailModal />`.
  - Mengganti seluruh pemanggilan notifikasi native `alert()` browser dengan notifikasi toast elegan via `useAppToast()`.
  - Mengintegrasikan pemilih koordinat peta OpenLayers (`coordinate-picker` / `BaseMap`) dengan dukungan nilai desimal presisi (`step="any"`).
- **pembersihan-copywriting-dan-buzzwords:** Menghapus seluruh AI buzzwords (*enterprise*, *seamless*, *match sempurna*) dari kode dan berkas dokumentasi:
  - Menyeragamkan seluruh subtitle modal detail menjadi format bersih `"Informasi [Nama Modul]"` di 16 halaman.
  - Menyeragamkan seluruh subtitle form drawer menjadi `"Form Tambah [Modul]"` dan `"Form Ubah [Modul]"`.
  - Menyederhanakan label dan placeholder schema yang bertele-tele di seluruh berkas `schemas/master/`.

- **desain-kartu-hak-akses:** Pembaruan tampilan daftar hak akses pada modul Akses Grup ([`pages/home/konfigurasi-aplikasi/akses-grup.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/akses-grup.vue)):
  - Mengganti tampilan tabel matriks lama menjadi kartu interaktif dengan switch On/Off.
  - Menambahkan toggle "Aktifkan Semua Hak Akses" untuk memilih atau membatalkan seluruh izin sekaligus.
  - Menambahkan filter berdasarkan modul dan pencarian langsung pada daftar hak akses.
  - Menyelaraskan format label "Daftar Hak Akses" dengan field form lainnya serta menetapkan field Deskripsi sebagai wajib diisi (*required*).
- **perbaikan-tooltip:** Menyesuaikan ukuran font tooltip PrimeVue menjadi 12px dan memastikan teks tampil penuh dalam satu baris tanpa terpotong ([`assets/css/primevue-overrides.css`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/assets/css/primevue-overrides.css)).
- **pemantau-inaktivitas-sesi:** Pembaruan logika pengecekan inaktivitas sesi pada [`composables/useIdleTimer.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/useIdleTimer.ts) menggunakan selisih waktu sistem (`Date.now()`):
  - Hitung mundur tetap akurat dan tidak tereset otomatis saat pengguna berpindah tab atau layar terkunci.
  - Menampilkan dialog peringatan sesi 2 menit sebelum sesi otomatis dikeluarkan.
  - Menyediakan fungsi bantu pengujian cepat via konsol browser (`window.__testIdleWarning()` dan `window.__testIdleExpired()`).
- **urutan-tampilan-modal-z-index:** Penyesuaian urutan tumpukan modal (*stacking context*) agar dialog peringatan sesi ([`BaseIdleWarningModal.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseIdleWarningModal.vue)) dan konfirmasi ([`BaseConfirmDialog.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseConfirmDialog.vue)) selalu berada di lapisan teratas tanpa tertutup oleh drawer form.
- **penyimpanan-draf-otomatis-form:** Peningkatan mekanisme auto-save draf formulir pada [`BaseFormModal.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseFormModal.vue) dan [`composables/useFormDraft.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/useFormDraft.ts):
  - Deteksi otomatis primary key record data untuk mencegah tabrakan draf antar entitas yang berbeda.
  - Banner pemulihan draf hanya muncul jika data benar-benar berubah, lengkap dengan tombol pulihkan atau buang draf.
- **pemilih-koordinat-gis:** Integrasi dua arah antara klik peta OpenLayers pada [`BaseMap.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseMap.vue) dan input Latitude/Longitude pada formulir Master Regional via tipe field `coordinate-picker` di [`FormFieldRenderer.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/FormFieldRenderer.vue).
- **zona-waktu-lokal-modal-detail:** Menambahkan deteksi zona waktu wilayah Indonesia (`WIB`, `WITA`, `WIT`) pada [`utils/formatDate.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/utils/formatDate.ts) untuk format tanggal pembuatan dan riwayat log di modal detail.
- **penanganan-notifikasi-toast-api:** Memperbaiki pemanggilan toast saat terjadi kegagalan request API agar pesan error tampil normal tanpa memicu pesan peringatan di konsol.
- **manajer-tumpukan-modal-esc:** Menambahkan composable [`composables/useModalStack.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/useModalStack.ts) berbasis LIFO agar tombol `Escape` hanya menutup modal yang sedang aktif di tumpukan paling atas.
- **standarisasi-outline-fokus-tombol:** Menstandarisasi [`components/base/BaseActionButton.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseActionButton.vue) dan [`assets/css/primevue-overrides.css`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/assets/css/primevue-overrides.css) untuk menghilangkan outline hitam pekat saat tombol diklik mouse namun tetap mempertahankan navigasi keyboard (`focus-visible`).
- **scroll-riwayat-aktivitas-modal-detail:** Menambahkan scroll independen pada kartu status & log aktivitas di [`BaseDetailModal.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseDetailModal.vue) agar proporsi modal tetap rapi.
- **pengaman-rute-cold-start:** Menyempurnakan [`middleware/auth.global.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/middleware/auth.global.ts) saat reload halaman agar profil pengguna dimuat terlebih dahulu sebelum rute divalidasi.
- **penyempurnaan-modul-konfigurasi:** Penyelarasan skema dan composable pada modul Master Menu ([`menu.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/menu.vue)) dan Akses Level ([`akses-level.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/akses-level.vue)) sesuai endpoint API terbaru.


## [0.6.0] - 2026-09-02

### 🏢 8 Modul Baru Swagger OpenAPI, Standarisasi Form Pengguna, Matrix Hak Akses Tablet & Dynamic RBAC

- **standarisasi-form-pengguna:** Mentransformasi modul Master Pengguna ([`pages/home/master/user.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/user.vue)) menjadi single-page drawer `BaseFormModal` terpadu tanpa tab manual, tersusun rapi dalam 4 seksi logis:
  1. **Identitas Akun:** `tipe` (radio SSO/Non-SSO), `nama`, `email`, `nip`, `password` (otomatis disembunyikan jika SSO).
  2. **Penugasan & Organisasi:** `akunPengelola` (switch), `pengelola` (jika pengelola), `organisasi` (jika non-pengelola), `jabatan`, `statusKaryawan`.
  3. **Hak Akses & Kewenangan:** `aksesLevel` (Akses Grup / Role), `scopeLevel` (Scope Wilayah: Unit/Cabang/Regional/Sentral/Nasional), `permissions` (Multi-select Hak Akses Khusus).
  4. **Kontak & Domisili:** `noTelp`, `perNr`, `alamat`.
  - Membersihkan nilai inisial form create dengan panduan placeholder yang jelas.
  - Memetakan state form secara presisi ke 20-field backend OpenAPI schema (`CreateUserRequest` & `UpdateUserRequest`).
- **matriks-responsif-akses-grup-tablet:** Mengoptimalkan tabel matriks hak akses pada [`pages/home/konfigurasi-aplikasi/akses-grup.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/akses-grup.vue) untuk resolusi tablet, iPad, dan split-screen dengan mengunci lebar kolom Modul (`w-[220px] shrink-0`) dan horizontal scrolling (`overflow-x-auto min-w-[820px]`), mencegah teks terlipat.
- **teleport-dropdown-dan-resiliensi-backend:** Memperbarui `teleportTarget` pada [`components/base/FormFieldRenderer.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/FormFieldRenderer.vue) ke `"body"` agar popover tidak terpotong di dalam drawer, serta membuat parser `fetchRoles()` pada [`composables/master/useRole.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useRole.ts) fleksibel membaca respons array dari backend (`res.data || res.data.roles || res.data.items || res`).
- **independensi-menu-auth-frontend:** Memperbarui logika `hasMenuAccess` pada [`stores/auth.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/stores/auth.ts) agar validasi navigasi sidebar mencocokkan metadata rute frontend (`permission` dan `menuCode`) terhadap izin akses pengguna dari backend, mengabaikan perbedaan penamaan path rute backend.
- **modul-hierarki-unit-pln:** Mengimplementasikan 7 modul master hierarki unit organisasi dan pembangkit PLN di bawah `Master Data`:
  - **Master Regional:** [`pages/home/master/regional.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/regional.vue), [`composables/master/useRegional.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useRegional.ts), [`schemas/master/regional.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/regional.schema.ts) (`/api/v1/regional`).
  - **Master UIW / UID:** [`pages/home/master/uiw-uid.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/uiw-uid.vue), [`composables/master/useUiwUid.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUiwUid.ts), [`schemas/master/uiw-uid.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/uiw-uid.schema.ts) (`/api/v1/uiw-uid`).
  - **Master UIK:** [`pages/home/master/uik.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/uik.vue), [`composables/master/useUik.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUik.ts), [`schemas/master/uik.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/uik.schema.ts) (`/api/v1/uik`).
  - **Master UP2D:** [`pages/home/master/up2d.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/up2d.vue), [`composables/master/useUp2d.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUp2d.ts), [`schemas/master/up2d.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/up2d.schema.ts) (`/api/v1/up2d`).
  - **Master UPK:** [`pages/home/master/upk.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/upk.vue), [`composables/master/useUpk.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUpk.ts), [`schemas/master/upk.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/upk.schema.ts) (`/api/v1/upk`).
  - **Master Unit Layanan:** [`pages/home/master/unit-layanan.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/unit-layanan.vue), [`composables/master/useUnitLayanan.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUnitLayanan.ts), [`schemas/master/unit-layanan.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/unit-layanan.schema.ts) (`/api/v1/unit-layanan`).
  - **Master Sentral Pembangkit:** [`pages/home/master/sentral.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/sentral.vue), [`composables/master/useSentral.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useSentral.ts), [`schemas/master/sentral.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/sentral.schema.ts) (`/api/v1/sentral`).
- **modul-manajemen-menu:** Implementasi manajemen Master Menu di bawah `Konfigurasi Aplikasi`:
  - **Halaman & Skema:** [`pages/home/konfigurasi-aplikasi/menu.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/menu.vue), [`schemas/konfigurasi-aplikasi/menu.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/konfigurasi-aplikasi/menu.schema.ts).
  - **Composable:** [`composables/konfigurasi-aplikasi/useMenu.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/konfigurasi-aplikasi/useMenu.ts) dengan dukungan CRUD lengkap (`/api/v1/menu`).
- **tipe-dan-dto:** Menambahkan interface TypeScript komprehensif untuk seluruh 8 modul pada [`types/master.types.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/types/master.types.ts).
- **pembersihan-fitur-ekspor:** Menghapus tombol ekspor dari seluruh halaman master dan transaksi yang tidak memiliki endpoint ekspor dari backend. Fitur ekspor dipertahankan pada 3 endpoint resmi backend (`/api/v1/pagu/export`, `/api/v1/prognosa/export`, `/api/v1/nko/export`).
- **standarisasi-tombol-tambah-data:** Menstandarisasi [`components/base/BaseCreateButton.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseCreateButton.vue) dengan label permanen `"TAMBAH DATA"`, menghapus props label yang tidak perlu di seluruh 23 halaman (`<BaseCreateButton @click="openCreateModal" />`).
- **standarisasi-input-pencarian:** Menstandarisasi [`components/base/BaseSearchInput.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseSearchInput.vue) dengan placeholder permanen `placeholder="Cari Data"`, menghapus props placeholder yang tidak perlu di seluruh 23 halaman (`<BaseSearchInput v-model="searchQuery" />`).
- **penyempurnaan-sistem-animasi-motion:** Mengimplementasikan token motion standar Emil Kowalski, aksesibilitas reduced-motion, akordion sidebar 60 FPS `scrollHeight`, floating popover terpadu (`150ms ease-out`, `translate-y-1`), dan keamanan transisi GSAP.
- **gerbang-kualitas-dan-pengujian:** Menambahkan rangkaian unit test [`test/composables/masterUnitPLN.test.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/test/composables/masterUnitPLN.test.ts) dan [`test/composables/menu.test.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/test/composables/menu.test.ts). Mencapai **122 passed unit tests pada 20 test suites (100% hijau)** dan **0 peringatan/kesalahan ESLint**.

## [0.5.0] - 2026-09-01

### ⚙️ Modul Konfigurasi Aplikasi, User 20-Field Payload, Rich Permission Tooltip & BaseTable Sticky Fix

- **modul-konfigurasi-aplikasi:** Membangun modul khusus `konfigurasi-aplikasi` yang terpisah rapi dari Master Data:
  - **Halaman:** [`pages/home/konfigurasi-aplikasi/akses-level.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/akses-level.vue) (migrasi dari Scope) dan [`pages/home/konfigurasi-aplikasi/akses-grup.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/konfigurasi-aplikasi/akses-grup.vue) (migrasi dari Role).
  - **Composable:** [`composables/konfigurasi-aplikasi/useAksesLevel.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/konfigurasi-aplikasi/useAksesLevel.ts) dan [`composables/konfigurasi-aplikasi/useAksesGrup.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/konfigurasi-aplikasi/useAksesGrup.ts) mencakup seluruh 5 endpoint REST (`GET list`, `POST create`, `GET detail`, `POST update`, `POST delete`) dengan isolasi `detailLoading`.
  - **Skema:** [`schemas/konfigurasi-aplikasi/akses-level.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/konfigurasi-aplikasi/akses-level.schema.ts) dan [`schemas/konfigurasi-aplikasi/akses-grup.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/konfigurasi-aplikasi/akses-grup.schema.ts).
  - **Navigasi:** Menambahkan kategori menu `konfigurasi-aplikasi` pada [`config/navigation.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/config/navigation.ts) dengan ikon `KonfigurasiAplikasiIcon.svg` pada [`AppSidebar.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/AppSidebar.vue).
- **payload-20-field-pengguna:** Menyelaraskan form create dan update pengguna agar presisi dengan skema OpenAPI 20 kolom backend (`access_level`, `address`, `akses_grup`, `approval_code`, `description`, `email`, `full_name`, `is_pengelola`, `is_sso`, `jabatan`, `jenis_pengguna`, `main_application`, `nip`, `organization`, `organization_id`, `password`, `permission_overrides`, `pernr`, `phone_number`, `role_assignments`, `status_karyawan`) pada [`pages/home/master/user.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/user.vue) dan [`types/master.types.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/types/master.types.ts).
- **antarmuka-interaktif-detail-izin:** Meningkatkan modal detail pada `akses-grup.vue` dan `user.vue` dengan pencarian hak akses interaktif (`> 6 items`), badge counter, pemformatan tanggal Indonesia, log aktivitas dinamis, dan tooltip HTML interaktif (`v-tooltip.top`) untuk modul dan aksi.
- **perbaikan-border-sticky-basetable:** Menyelesaikan bug border collapse pada scrolling tabel dengan mengatur `BaseTable.vue` ke `border-separate border-spacing-0` dan border bawah eksplisit `border-b border-gray-200` pada elemen `th`. Menghapus bayangan kiri berlebih pada kolom `actions`.
- **auto-key-dan-payload-izin:** Memperbarui form Permission untuk mengirimkan struktur 4-field Go (`permission_key`, `resource_id`, `action_id`, `description`) dengan auto-generate disabled `permission_key` berdasarkan resource dan action yang dipilih.
- **pengujian-unit:** Memperluas cakupan pengujian Vitest menjadi **112 passed tests pada 18 test suites (100% hijau)**.

### 🔄 Muat Ulang Tabel Terpusat, Ikon Lucide & Penyelarasan Menu Navigasi

- **judul-navigasi:** Menyelaraskan judul item menu pada [`config/navigation.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/config/navigation.ts) (`Role & Hak Akses` -> `Role`, `Katalog Hak Akses (Permission)` -> `Akses Permission`) dengan pemformatan TypeScript standar.
- **muat-ulang-tabel-terpusat:** Menambahkan tombol interaktif `[ 🔄 Muat Ulang ]` pada empty state [`components/base/BaseTable.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseTable.vue) yang memancarkan event `@reload` ke seluruh 15 halaman Master Data dan Transaksi.
- **komponen-ikon-lucide:** Menstandarisasi empty state tabel menggunakan komponen resmi `<Database />` dan `<RotateCw />` dari `@lucide/vue`.
- **isolasi-loading-detail:** Memisahkan state `detailLoading` dari list `loading` pada [`composables/master/useUser.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/useUser.ts) dan [`composables/master/usePermission.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/master/usePermission.ts) agar tabel utama tidak berkedip saat modal detail dibuka.
- **pengambilan-detail-izin:** Mengintegrasikan `getPermissionById(row.id)` (`GET /api/v1/permissions/:id`) pada aksi lihat detail di [`pages/home/master/permission.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/permission.vue).
- **perbaikan-ikatan-tipe:** Memperbaiki binding prop `:items="tabOptions"` pada `<BaseTabFilter>` di [`pages/home/transaksi/pagu.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/transaksi/pagu.vue).
- **pengujian-unit:** Mempertahankan **105 passed tests (100% hijau)** pada 17 test suites Vitest.

### 👥 Multi-Select Izin Pengguna, Styling Kontrol Form & Fix Single-Root Nuxt

- **multi-select-izin-pengguna:** Mengganti `aksesGrup` lama dengan multi-select dinamis `permissions` pada [`schemas/master/user.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/user.schema.ts) dan [`pages/home/master/user.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/user.vue).
- **sinkronisasi-combo-izin:** Mengintegrasikan `fetchPermissionsCombo` pada `composables/master/usePermission.ts` (`POST /api/v1/permissions/combo`) dengan fallback ke `getUserById` (`GET /api/v1/users/:id`), menyinkronkan izin aktif pengguna saat edit.
- **tema-terang-kontrol-form:** Memperbaiki tampilan default browser Chromium pada `<input type="radio">` dan `<input type="checkbox">` yang gelap dengan menambahkan `color-scheme: light !important`, `accent-color: #2563eb !important`, dan latar belakang putih pada `assets/css/primevue-overrides.css` dan `components/base/FormFieldRenderer.vue`.
- **perbaikan-single-root-nuxt:** Menyelesaikan peringatan template `[NUXT_E4004]` pada `pages/home.vue` dengan membungkus komentar tingkat atas di dalam container utama `<div>`.
- **composable-state-tabel:** Membangun composable generik [`composables/useTableState.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/composables/useTableState.ts) untuk pencarian multi-kolom, pagination, dan reset halaman otomatis.
- **validasi-skema-ssot:** Menjadikan skema validasi Zod di [`schemas/master/user.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/user.schema.ts) sebagai Single Source of Truth (SSOT).
- **pengujian-unit:** Memperluas pengujian menjadi **105 passed tests (100% hijau)** pada 17 test suites termasuk `test/composables/tableState.test.ts`.

---

## [0.4.0] - 2026-08-31

### 🛡️ Keamanan Sistem, Metadata Perangkat, Pagu Bertab & Kebijakan Strict POST

- **metadata-perangkat:** Membangun utilitas [`utils/deviceMeta.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/utils/deviceMeta.ts) yang menghasilkan `X-Device-ID` persisten (UUID pada localStorage), `X-Device-Name`, `X-Browser`, dan `X-OS` yang diinjeksikan pada request login (`POST /api/v1/auth/login`) untuk kebutuhan audit trail backend dan kepatuhan SOC.
- **standarisasi-strict-post:** Mengganti seluruh metode HTTP `PUT` dan `DELETE` di semua composables (`useUser`, `useOrganization`, `useOperasiHarian`, `usePemakaianBahanBakar`, `usePermission`) menjadi `POST /{resource}/{id}` (Update) dan `POST /{resource}/{id}/delete` (Delete) sesuai kebijakan keamanan API backend.
- **unifikasi-tab-pagu:** Menyatukan halaman `Pagu (Unit)` dan `Pagu Bidang` ke dalam satu halaman terpadu (`/home/transaksi/pagu`) dengan tab switcher dinamis `[ Unit | Bidang ]`, kolom tabel khusus, ekspor, dan drawer form yang adaptif.
- **komponen-filter-tanggal:** Membangun komponen reusable [`components/base/BaseDateFilter.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseDateFilter.vue) dengan integrasi DatePicker PrimeVue berukuran `h-12` sesuai standar desain PLN.
- **crud-lengkap-izin:** Membangun skema [`schemas/master/permission.schema.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/master/permission.schema.ts) dan memperbarui [`pages/home/master/permission.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/pages/home/master/permission.vue) dengan operasi CRUD lengkap (`createPermission`, `updatePermission`, `deletePermission`) serta dialog konfirmasi.
- **perbaikan-buang-draf:** Meningkatkan `confirmDiscardChanges()` pada [`components/base/BaseFormModal.vue`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/components/base/BaseFormModal.vue) agar membersihkan draf dari penyimpanan dan membatalkan debounce aktif saat memilih "Buang & Tutup".
- **tumpukan-modal-z-index:** Memperbaiki penataan z-index pada `BaseIdleWarningModal.vue` dengan kontainer `z-[100]` dan backdrop `fixed inset-0 z-[99]` untuk menjamin penutupan penuh di atas header dan tabel sticky.

### 📶 Ketangguhan Jaringan & Optimasi Bandwidth Rendah (Edisi Sumbawa)

- **draf-otomatis-form:** Membangun composable `composables/useFormDraft.ts` dengan debounce simpan otomatis (500ms) ke penyimpanan browser, banner pemulihan draf dengan penanda waktu di `BaseFormModal.vue`, dan pembersihan otomatis setelah data berhasil disimpan.
- **draf-halaman-transaksi:** Mengintegrasikan `draft-key` unik pada seluruh 7 halaman Transaksi (`operasi-harian`, `pemakaian-bahan-bakar`, `pembebanan`, `pagu`, `pagu-bidang`, `prognosa`, `nko`).
- **swr-api-cache:** Membangun `composables/useApiCache.ts` yang menyediakan caching Stale-While-Revalidate (SWR) dengan TTL fleksibel, persistensi sessionStorage, deduplikasi request konkuren, dan pembatalan cache berbasis prefix.
- **retry-jaringan-cerdas:** Meningkatkan `composables/useApi.ts` dengan kebijakan retry otomatis (hingga 2 kali percobaan ulang dengan jeda 1000ms) untuk kendala jaringan dan gateway timeout (408, 429, 500, 502, 503, 504).
- **captcha-cdn-kecepatan-tinggi:** Memperbarui `SliderCaptcha.vue` menggunakan CDN pool Unsplash kecepatan tinggi dengan pengacakan acak, percepatan timeout pramuat 2000ms, dan fallback aset lokal.
- **panduan-pengembang:** Menerbitkan panduan komprehensif [`docs/DeveloperGuide.md`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/docs/DeveloperGuide.md) yang mendokumentasikan SOP 5 langkah penambahan modul Master & Transaksi baru.
- **perbaikan-ci-cd-platform:** Menghapus binary khusus Windows (`@oxc-parser/binding-win32-x64-msvc`, `@rolldown/binding-win32-x64-msvc`, `oxc-parser`) dari `package.json` devDependencies untuk menyelesaikan kendala build `EBADPLATFORM` pada GitLab CI/CD runner Linux Alpine dan container Docker.
- **pengujian-unit:** Menambahkan `test/composables/formDraft.test.ts` dan `test/composables/apiCache.test.ts`, mencapai **88/88 passed tests (100% hijau)** pada 15 test suites.

---

## [0.3.0] - 2026-08-28

### 📶 Ketahanan Jaringan & Deteksi Offline

- **status-jaringan:** Mengintegrasikan `composables/useNetworkStatus.ts` yang memantau event online/offline browser dan memberikan notifikasi Toast halus serta indikator header tanpa banner antarmuka yang mengganggu.

### 🎨 Antarmuka Modern & Rangkaian Animasi GSAP

- **ikon-menu-sidebar:** Pemuatan otomatis ikon menu SVG dinamis menggunakan `import.meta.glob('@/assets/icon/menu/*.svg')` pada `AppSidebar.vue`.
- **pemisah-baris-tabel:** Menambahkan garis pemisah bawah (`border-b border-gray-100`) antar baris data `tbody` pada `BaseTable.vue` untuk kenyamanan visual pembacaan data.
- **kepatuhan-lisensi-mit:** Menstandarisasi PrimeVue ke versi `4.5.5` (Lisensi Murni MIT) dan `@primeuix/themes` `1.2.3` demi kepatuhan legalitas PT PLN (Persero).
- **transisi-halaman:** Menambahkan transisi halaman dan layout berakselerasi GPU pada `nuxt.config.ts` dan `assets/css/primevue-overrides.css` dengan kurva kehalusan `cubic-bezier(0.16, 1, 0.3, 1)`.
- **stagger-baris-tabel:** Mengintegrasikan animasi bertingkat GSAP `gsap.fromTo()` pada baris data `BaseTable.vue` dengan pembersihan otomatis `clearProps: 'transform,opacity'` guna menjaga integritas posisi kolom sticky.
- **skeleton-shimmer-loader:** Menambahkan animasi skeleton shimmer 5 baris dengan lebar kolom dinamis pada `BaseTable.vue` menggantikan spinner bundar konvensional.
- **tombol-taktil:** Menambahkan umpan balik penekanan pegas elastis (`active:scale-[0.90]` & `active:scale-[0.96]`) pada `BaseActionButton.vue` dan `BaseExportButton.vue`.
- **animasi-modal:** Menambahkan efek `backdrop-blur-xs` dan transisi spring zoom-in pada `BaseFormModal.vue`, `BaseDetailModal.vue`, dan `BaseConfirmDialog.vue`.

### 🧭 Kompresi Modular AppSidebar & Navigasi Terpusat

- **konfigurasi-navigasi:** Mengekstraksi struktur pohon navigasi 16 modul ke dalam file terpusat berorientasi tipe [`config/navigation.ts`](file:///c:/Users/USER/Documents/GitHub/tambora-frontend/config/navigation.ts), memperkecil ukuran `AppSidebar.vue` hingga ~40% dengan tetap mendukung akordion Level 3.
- **judul-halaman-dinamis:** Memusatkan resolusi judul halaman dan breadcrumb di seluruh 16 halaman ke dalam `config/navigation.ts`, memungkinkan penggunaan `<BasePageHeader />` secara otomatis dan tersinkronisasi.
- **pembersihan-impor-otomatis:** Menghapus seluruh impor manual komponen pada 16 halaman dan komponen dasar untuk memanfaatkan kapabilitas auto-import Nuxt 4 secara optimal.
- **garis-pandu-menu-aktif:** Menghubungkan indikator aktif dan hover antar menu menjadi satu garis biru solid yang berkesinambungan sesuai desain Figma.
- **animasi-masuk-submenu:** Menambahkan animasi masuk bertahap (*cascade*) saat submenu diperluas.
- **auto-scroll-navigasi:** Menambahkan fitur gulir otomatis halus ke posisi menu yang sedang aktif (misalnya NKO / Prognosa).

### 🛡️ Perlindungan Formulir, Standarisasi & Sistem Toast

- **keselarasan-swagger:** Menyelesaikan 100% audit Swagger OpenAPI (58 endpoints). Mengintegrasikan tombol aksi CRUD lengkap (`view`, `edit`, `delete`) dan `BaseDetailModal` pada `role.vue`, `scope.vue`, `machine-condition.vue`, dan `permission.vue`.
- **penjaga-formulir:** Mengintegrasikan Unsaved Changes Guard pada `BaseFormModal.vue` dengan tata letak kartu dan backdrop layar penuh `<Teleport to="body">` untuk mencegah kehilangan data melalui dialog konfirmasi ("Lanjut Mengisi" vs "Buang & Tutup").
- **standarisasi-modal:** Menstandarisasi 100% modal formulir Master dan Transaksi menjadi Right Drawer seragam (`variant="drawer"`), meniadakan popup dialog yang tidak seragam.
- **sistem-toast:** Membangun composable global `composables/useAppToast.ts` dan kontainer `components/base/BaseToastContainer.vue` dengan bilah kemajuan waktu hitung mundur animasi.

### 🔒 Modernisasi Autentikasi & Keamanan Sesi

- **store-autentikasi:** Merefaktor Pinia store dengan siklus hidup cookie shift kerja 24 jam, `refreshSession()`, mutex single-flight pada error 401, dan sinkronisasi lintas-tab `BroadcastChannel('tambora_auth_channel')` pada `stores/auth.ts`.
- **guard-autentikasi:** Memperbarui `middleware/auth.global.ts` dengan dukungan pelestarian query parameter `redirect` dan navigasi otomatis ke rute tujuan setelah login berhasil.
- **batas-waktu-inaktif:** Menyediakan `components/base/BaseIdleWarningModal.vue` dan `composables/useIdleTimer.ts` untuk deteksi inaktivasi 28 menit disertai modal hitung mundur 2 menit.
- **interseptor-api:** Meningkatkan `composables/useApi.ts` dengan antrean refresh mutex tunggal untuk mencegah race condition pada respons 401 secara bersamaan.

### ⚡ Integrasi Transaksi (7 Modul Aktif)

- **skema-transaksi:** Menstandarisasi mesin skema form khusus untuk seluruh 7 modul Transaksi di `schemas/transaksi/` dengan barrel export pada `schemas/index.ts`.
- **transaksi-operasi-harian:** Mengintegrasikan CRUD `/api/v1/operasi-harian` mencakup parameter daya (DMN, DMP, Terpasang, Aktual), produksi energi, pemakaian bahan bakar, dan ekspor Excel di `pages/home/transaksi/operasi-harian.vue`.
- **transaksi-pemakaian-bahan-bakar:** Mengintegrasikan CRUD `/api/v1/pemakaian-bahan-bakar` mencakup pencatatan konsumsi bahan bakar (Batubara, HSD, B30, MFO, Biomassa, Gas), pemantauan stok, dan ekspor Excel di `pages/home/transaksi/pemakaian-bahan-bakar.vue`.
- **transaksi-pembebanan:** Mengintegrasikan CRUD `/api/v1/pembebanan` mencakup beban aktif listrik (MW), tegangan operasi (kV), badge status frekuensi sistem (Hz), dan faktor daya di `pages/home/transaksi/pembebanan.vue`.
- **transaksi-pagu:** Mengintegrasikan CRUD `/api/v1/pagu` mencakup Pagu AO & AKO, AI & AKI, POS 54, alur kerja revisi bertingkat (`/revise`), dan ekspor Excel (`/export`) di `pages/home/transaksi/pagu.vue`.
- **transaksi-pagu-bidang:** Mengintegrasikan CRUD `/api/v1/pagu-bidang` dengan relasi ke induk Pagu Unit, alokasi multi-bidang (Ophar, Adum, K3L), validasi persentase, dan ekspor Excel di `pages/home/transaksi/pagu-bidang.vue`.
- **transaksi-prognosa:** Mengintegrasikan CRUD `/api/v1/prognosa` mencakup parameter kesiapan mesin pembangkit (DMN, DMP, PH, SH, RSH, POH, MOH, FOH, AH, OMC) untuk unit PLTU maupun Non-PLTU serta ekspor Excel di `pages/home/transaksi/prognosa.vue`.
- **transaksi-nko:** Mengintegrasikan CRUD `/api/v1/nko` mencakup entri batch KPI, status polaritas, target bulanan vs realisasi aktual, dan ekspor Excel di `pages/home/transaksi/nko.vue`.
- **menu-sidebar:** Menata ulang urutan menu Master dan menambahkan dropdown navigasi `Transaksi` untuk seluruh 7 submenu pada `components/base/AppSidebar.vue`.
- **integrasi-peta:** Mengintegrasikan API Key MapTiler (`VITE_MAPTILER_KEY` / `NUXT_PUBLIC_MAPTILER_KEY`) dengan tile layer Positron bersih pada `components/base/BaseMap.vue`.
- **animasi-typewriter:** Menambahkan animasi pengetikan typewriter realistis untuk sapaan di `/home` dan deskripsi di `/login`.
- **tipe-transaksi:** Menambahkan DTO dan payload komprehensif untuk seluruh 7 modul transaksi di `types/transaksi.types.ts`.
- **pengujian-unit:** Menambahkan unit test hingga mencapai **64/64 tests passed (100% hijau)** pada 12 test suites.

---

## [0.2.0] - 2026-08-27

### 🚀 Fitur & Modernisasi Arsitektur

- **mesin-formulir:** Mengimplementasikan visibilitas kondisional reaktif (`hidden: (formData) => boolean`) dan status fungsional `disabled` pada `BaseFormModal.vue` dan `FormFieldRenderer.vue` dengan pembersihan otomatis payload field yang disembunyikan.
- **skema-data:** Menstandarisasi seluruh 8 modul Master (User, Driver, Organization, System, Role, Scope, Machine Condition, Asset) ke dalam berkas konfigurasi `schemas/master/`.
- **tabel-data:** Menambahkan popover interaktif Show/Hide Column Visibility Toggle dengan penguncian kolom aksi mandatori dan persistensi preferensi di localStorage pada `BaseTable.vue`.
- **dialog-konfirmasi:** Membangun komponen modern `BaseConfirmDialog.vue` dengan transisi fade halus dan badge bahaya, menggantikan fungsi native `window.confirm()`.
- **ekspor-data:** Membangun utilitas `utils/exportExcel.ts` dengan dukungan UTF-8 BOM untuk kompatibilitas Microsoft Excel menggantikan alert dummy pada `BaseExportButton`.
- **modularisasi-tipe:** Memecah direktori `types/` ke dalam berkas domain yang terisolasi (`form.types.ts`, `table.types.ts`, `auth.types.ts`, `master.types.ts`, `operasi.types.ts`) dengan re-export terpadu pada `types/index.ts`.

### 🏛️ Integrasi Master Data

- **master-organisasi:** Integrasi CRUD `/api/v1/organization` dengan hierarki induk-anak, koordinat geografis (lat/lng), drawer form, dan modal detail.
- **master-kondisi-mesin:** Integrasi CRUD `/api/v1/machine-conditions` dengan deskripsi operasional, switch status aktif, dan modal terpusat.
- **master-sistem:** Integrasi CRUD `/api/v1/systems` dengan klasifikasi sistem (`BESAR`/`KECIL`), pengikatan organisasi UPK, dan koordinat geografis.
- **master-aset:** Integrasi CRUD `/api/v1/assets` mencakup DMN, DMP, Daya Terpasang, spesifikasi generator & mesin, trafo, jenis bahan bakar, dan status kepemilikan.
- **master-driver:** Integrasi CRUD `/api/v1/drivers` dengan validasi ketat 16 digit NIK, normalisasi tanggal ISO RFC3339, dan drawer form 11 field.
- **master-pengguna:** Integrasi manajemen pengguna dengan dropdown dinamis organisasi dan role yang diambil langsung dari backend.
- **master-role:** Integrasi manajemen role dengan badge hak akses dan perlindungan role sistem.
- **master-izin:** Tampilan katalog hak akses dinamis dengan badge aksi dan penyaringan resource.
- **menu-sidebar:** Menambahkan 4 tautan navigasi Master baru dan menstrukturkan menu ke dalam hierarki bisnis yang logis.

### 🎨 Antarmuka & Sistem Komponen Reusable

- **base-select:** Membangun komponen `BaseSelect` modern dengan filter pencarian real-time, transisi halus, tanda centang aktif, dan tinggi `h-12` khas desain PLN.
- **base-action-button:** Membangun komponen `BaseActionButton` yang menstandarisasi tombol Lihat (Sky), Edit (Amber), dan Hapus (Red) dengan animasi mikro.
- **base-badge:** Membangun komponen `BaseBadge` yang menstandarisasi varian status (`success`, `danger`, `warning`, `info`, `primary`, `mono`, `system`).
- **relasi-dinamis:** Menghubungkan organisasi backend langsung ke form Pengguna dan Sistem, menghapus seluruh array dummy cadangan.
- **layar-sapaan-home:** Membangun layar selamat datang responsif terpusat dengan penskalaan `LogoWelcome.png` dinamis 80% dan animasi pengetikan sapaan di `pages/home/index.vue`.
- **animasi-login:** Meningkatkan animasi deskripsi form login dengan efek pengetikan typewriter huruf demi huruf pada `components/login/LoginForm.vue`.
- **integrasi-maptiler:** Mengintegrasikan layanan peta beresolusi tinggi MapTiler dengan dukungan konfigurasi API Key di `.env`, `.env.example`, `nuxt.config.ts`, dan `components/base/BaseMap.vue`.
- **pengujian-unit:** Menambahkan pengujian unit `test/utils/exportExcel.test.ts`, mencapai **49/49 passed tests** pada 8 test suites (100% hijau).

---

## [0.1.0] - 2026-08-26

### 🔐 Autentikasi & Proxy Jaringan

- **autentikasi:** Integrasi endpoint API login riil (`POST /auth/login`).
- **reverse-proxy:** Mengonfigurasi Nitro route proxy dinamis untuk bypass CORS otomatis pada lingkungan dev maupun production.
- **toast:** Menambahkan parser error API global (`apiError.ts`) dan integrasi PrimeVue Toast pada `app.vue`.
- **pengujian-unit:** Menambahkan rangkaian pengujian Vitest awal dengan 28 passed tests dan 98.19% cakupan kode pada utilitas.
- **tipe:** Menambahkan dependensi `@types/node` untuk pengetikan runtime proses server.
