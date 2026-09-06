# Product Requirements Document (PRD) — Tambora Web App

## 1. Overview & Problem Statement
**Tambora Web App** adalah platform monitoring operasional, analitik sistem ketenagalistrikan, neraca daya, dan tata kelola transaksi data terpadu untuk lingkungan **PT PLN (Persero)** (khususnya Sistem Tambora & Sumbawa). 

Tujuan platform ini adalah memberikan visibilitas *real-time* dan historis terhadap stabilitas pembangkit listrik, pemetaan spasial geografis sentral pembangkit (GIS), pencatatan produksi dan konsumsi bahan bakar, perencanaan anggaran pagu, serta evaluasi prognosa kesiapan mesin dan KPI kinerja (NKO).

---

## 2. Target Users & Roles
1. **Dispatcher / Operator Pembangkit**: Memantau status operasi, kesiapan unit pembangkit, pencatatan beban aktif, tegangan, frekuensi, dan pemakaian bahan bakar harian.
2. **Supervisor & Perencana Anggaran**: Mengelola alokasi pagu anggaran (AO/AKO, AI/AKI, POS 54), alokasi pagu bidang (Ophar, Adum, K3L), dan pengajuan revisi anggaran.
3. **Management / Eksekutif**: Memantau KPI sistem, prognosa kesiapan unit PLTU/Non-PLTU, perhitungan capaian NKO, dan laporan eksekutif.
4. **Administrator Sistem**: Mengelola hak akses user, level role, organisasi hierarki, dan konfigurasi master data.

---

## 3. Core Features & Scope

### 3.1. Dashboard Operasi Pembangkit
- **Header & Metric Summary**: Menampilkan status sistem (Normal/Siaga/Darurat), DMN, DMP, Beban Sistem, Unit Max, dan Cadangan Total/Putar.
- **GIS Map Monitoring (`BaseMap`)**: Visualisasi lokasi sentral pembangkit berbasis OpenLayers v10 + MapTiler Positron dengan marker status (Operasi, Gangguan, Pemeliharaan/Standby) dan popup detail.
- **Beban & Grafik (`BaseChart`)**: Visualisasi kurva beban real-time menggunakan Apache ECharts.

### 3.2. Tata Kelola Modul Konfigurasi Aplikasi & Master Data
- **Konfigurasi Aplikasi**:
  1. **Master Akses Level**: Manajemen batas cakupan operasional.
  2. **Master Akses Grup**: Pengaturan hak akses granular per modul menggunakan kartu interaktif dengan switch On/Off, master switch toggle, filter modul, dan pencarian cepat.
  3. **Master Menu**: Tata kelola rute dan struktur navigasi aplikasi dinamis.
- **Master Data (16 Modul)**:
  1. **Master Regional**: Manajemen entitas wilayah regional PLN lengkap dengan pemilih koordinat peta GIS.
  2. **Master Cabang**: Tata kelola kantor cabang wilayah PLN dengan status approval.
  3. **Master Ranting**: Tata kelola kantor ranting unit layanan dengan paritas status approval & status ranting.
  4. **Master UIW / UID**: Tata kelola Unit Induk Wilayah / Distribusi.
  5. **Master UIK**: Tata kelola Unit Induk Pembangkitan.
  6. **Master UP2D**: Tata kelola Unit Pelaksana Pengatur Distribusi.
  7. **Master UPK**: Tata kelola Unit Pelaksana Pembangkitan.
  8. **Master Unit Layanan**: Tata kelola Unit Layanan Pembangkitan (ULPL).
  9. **Master Sentral Pembangkit**: Profil lengkap unit pembangkit, lokasi, manajer, dan spesifikasi teknis.
  10. **Master User**: Manajemen akun pengguna 20-field payload dengan form drawer satu halaman tanpa tab, dukungan SSO/Non-SSO, dan hak akses khusus.
  11. **Master Permission**: Katalog permission dinamis berbasis resource & action.
  12. **Master Driver**: Data pengemudi kendaraan dinas operasional.
  13. **Master Organisasi**: Struktur hierarki unit (*parent-child*).
  14. **Master Sistem**: Manajemen sistem ketenagalistrikan dengan async detail view dan pemilih koordinat peta GIS.
  15. **Master Aset Mesin**: Inventarisasi generator dan rating unit mesin pembangkit.
  16. **Master Kondisi Mesin**: Kategori status kesiapan dan operasional mesin pembangkit.

### 3.3. 6 Modul Transaksi Pembangkitan
1. **Operasi Harian**: Pencatatan daya mampu netto/pasok/aktual, produksi kWh, dan konsumsi bahan bakar per jam/hari.
2. **Pemakaian Bahan Bakar**: Monitoring konsumsi bahan bakar (Batubara, HSD, B30, MFO, Biomassa, Gas) dan sisa stok.
3. **Pembebanan Generator**: Monitoring beban aktif (MW), tegangan (kV), frekuensi (Hz), dan faktor daya (Cos φ).
4. **Pagu Anggaran**: Pengelolaan pagu AO/AKO, AI/AKI, POS 54, alur revisi bertingkat, dan dedicated export endpoint backend (`/api/v1/pagu/export`).
5. **Prognosa Kinerja**: Parameter kesiapan mesin (DMN, DMP, PH, SH, RSH, POH, MOH, FOH, AH, OMC) untuk PLTU & Non-PLTU dengan export endpoint backend (`/api/v1/prognosa/export`).
6. **Perhitungan NKO**: Evaluasi pencapaian KPI bulanan terhadap target dan polaritas dengan export endpoint backend (`/api/v1/nko/export`).

### 3.4. Keamanan Sesi & Pemantau Inaktivasi
- **Inactivity Idle Monitor**: Deteksi inaktivitas berbasis selisih waktu sistem (`Date.now()`) selama 13 menit dengan dialog peringatan hitung mundur 2 menit, tersinkronisasi saat tab aktif kembali, serta hierarki modal di atas drawer formulir.
- **Silent Token Refresh**: Perpanjangan token otomatis di latar belakang saat 401 Unauthorized tanpa kehilangan input formulir.
- **Cross-Tab Synchronization**: Sinkronisasi logout antar seluruh tab browser via `BroadcastChannel`.
- **Return-To Navigation**: Pengembalian rute tujuan otomatis setelah sesi login diperbarui.

---

## 4. Non-Functional Requirements (NFR)
- **Performance**: Initial load < 2 detik, interaksi peta responsif tanpa memory leak.
- **Reliability & Quality**: SonarQube Grade A, test coverage > 85% (**122/122 Vitest tests passing 100% green**).
- **Security**: Autentikasi berbasis token JWT 24 jam / access token 15m, proteksi CSRF/XSS, dan proteksi idle timeout berbasis timestamp wall-clock.
- **Compatibility**: Responsive desktop & workstation tablet (min. breakpoint 1024px).
