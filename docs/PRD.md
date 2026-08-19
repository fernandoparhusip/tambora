# Product Requirements Document (PRD) — Tambora Web App

## 1. Overview & Problem Statement
**Tambora Web App** adalah platform monitoring operasional dan analitik sistem pembangkit serta transaksi untuk lingkungan PLN (khususnya Sistem Tambora / Sumbawa). 
Tujuan aplikasi ini adalah memberikan visibilitas *real-time* dan historis terhadap kondisi pembangkit listrik, beban sistem, neraca daya, peta geografis sentral pembangkit, serta manajemen master data internal secara terpusat.

---

## 2. Target Users & Roles
1. **Dispatcher / Operator Pembangkit**: Memantau status operasi, kesiapan unit, beban puncak, dan status darurat (gangguan/pemeliharaan).
2. **Management / Supervisor**: Memantau KPI sistem, pertumbuhan keuntungan/beban, neraca energi, dan laporan eksekutif.
3. **Administrator Sistem**: Mengelola hak akses user, level role, UIW/wilayah kerja, dan konfigurasi master data.

---

## 3. Core Features & Scope

### 3.1. Dashboard Operasi Pembangkit
- **Header & Metric Summary**: Menampilkan status sistem (Normal/Siaga/Darurat), DMN (Daya Mampu Nyata), DMP (Daya Mampu Pasok), Beban Sistem, Unit Max, dan Cadangan Total.
- **GIS Map Monitoring (`BaseMap`)**: Visualisasi lokasi sentral pembangkit berbasis OpenLayers dengan marker status (Operasi, Gangguan, Pemeliharaan/Standby).
- **Tab & Filter**: Filter tanggal operasional, filter status pembangkit, serta tab navigasi (Operasi, Pemeliharaan, Neraca Daya, Gangguan).
- **Beban & Grafik (`BaseChart`)**: Visualisasi kurva beban real-time, perbandingan DMN/DMP, dan kontribusi energi per sentral.
- **Detail Sentral Modal**: Inspeksi detail unit pembangkit saat marker peta atau tabel baris diklik.

### 3.2. Manajemen Master Data
- **Master User**: Tabel pengguna, filter UIW/level, pagination, form create/edit modal terstandarisasi.
- **Master Role & Level Role**: Pengaturan hak akses granular untuk menu dan fitur aplikasi.

### 3.3. Modul Transaksi & Keuangan
- **Transaksi**: Riwayat transaksi, status (Pending, Selesai, Batal), pencarian cepat, dan ekspor data (Excel/PDF).
- **Analitik Keuntungan**: Perhitungan pertumbuhan margin, perbandingan pendapatan vs beban per wilayah.

---

## 4. Non-Functional Requirements (NFR)
- **Performance**: Initial load < 2 detik, interaksi peta responsif tanpa memory leak.
- **Reliability & Quality**: SonarQube code duplication threshold < 3%, unit test coverage memadai (Vitest).
- **Security**: Autentikasi berbasis token/session, input sanitization, proteksi XSS (no unescaped `v-html`).
- **Responsiveness**: Optimal di desktop workstation & tablet (min. breakpoint 1024px).
