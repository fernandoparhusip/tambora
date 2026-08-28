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
- **Beban & Grafik (`BaseChart`)**: Visualisasi kurva beban real-time bertenaga Apache ECharts.

### 3.2. Tata Kelola 8 Modul Master Data
1. **Master User**: Manajemen akun pegawai dan pengemudi.
2. **Master Role & Permission**: Pengaturan hak akses granular per menu.
3. **Master Scope**: Manajemen batas cakupan operasional.
4. **Master Driver**: Data pengemudi kendaraan dinas operasional.
5. **Master Organisasi**: Struktur hierarki unit/induk/wilayah (*parent-child*).
6. **Master Sistem Pembangkit**: Manajemen kode dan nama sistem pembangkit.
7. **Master Aset Mesin**: Inventarisasi generator dan unit mesin.
8. **Master Kondisi Mesin**: Kategori status kesiapan mesin pembangkit.

### 3.3. 7 Modul Transaksi Pembangkitan
1. **Operasi Harian**: Pencatatan daya mampu netto/pasok/aktual, produksi kWh, dan konsumsi bahan bakar per jam/hari.
2. **Pemakaian Bahan Bakar**: Monitoring konsumsi bahan bakar (Batubara, HSD, B30, MFO, Biomassa, Gas) dan sisa stok.
3. **Pembebanan Generator**: Monitoring beban aktif (MW), tegangan (kV), frekuensi (Hz), dan faktor daya (Cos φ).
4. **Pagu Anggaran**: Pengelolaan pagu AO/AKO, AI/AKI, POS 54, alur revisi bertingkat, dan ekspor data anggaran.
5. **Pagu Bidang**: Alokasi anggaran operasional ke bidang Ophar, Adum, dan K3L.
6. **Prognosa Kinerja**: Parameter kesiapan mesin (DMN, DMP, PH, SH, RSH, POH, MOH, FOH, AH, OMC) untuk PLTU & Non-PLTU.
7. **Perhitungan NKO**: Evaluasi pencapaian KPI bulanan terhadap target dan polaritas.

### 3.4. Keamanan Sesi Enterprise
- **Inactivity Idle Monitor**: Deteksi ketiadaan aktivitas operator selama 28 menit dengan modal hitung mundur 2 menit.
- **Silent Token Refresh**: Rotasi token otomatis via single-flight mutex saat 401 Unauthorized tanpa kehilangan data form input.
- **Cross-Tab Synchronization**: Sinkronisasi logout antar seluruh tab browser via `BroadcastChannel`.
- **Return-To Navigation**: Retensi rute tujuan otomatis setelah sesi login diperbarui.

---

## 4. Non-Functional Requirements (NFR)
- **Performance**: Initial load < 2 detik, interaksi peta responsif tanpa memory leak.
- **Reliability & Quality**: SonarQube Grade A, test coverage > 85% (**60/60 Vitest tests passing**).
- **Security**: Autentikasi berbasis token JWT 24 jam, proteksi CSRF/XSS, dan proteksi idle timeout.
- **Compatibility**: Responsive desktop & workstation tablet (min. breakpoint 1024px).
