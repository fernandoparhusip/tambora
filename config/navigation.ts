export interface LeafMenuItem {
  label: string;
  pageTitle?: string;
  path: string;
}

export interface SubMenuItem {
  key: string;
  label: string;
  pageTitle?: string;
  path?: string;
  children?: LeafMenuItem[];
}

export interface MenuItem {
  key: string;
  label: string;
  pageTitle?: string;
  path?: string;
  children?: SubMenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    children: [
      {
        key: "operasi-pembangkit",
        label: "Operasi Pembangkit",
        pageTitle: "Operasi Pembangkit Sistem Tambora",
        path: "/home/dashboard/operasiPembangkit",
      },
    ],
  },
  {
    key: "konfigurasi-aplikasi",
    label: "Konfigurasi Aplikasi",
    children: [
      {
        key: "akses-level",
        label: "Master Akses Level",
        pageTitle: "Master Akses Level",
        path: "/home/konfigurasi-aplikasi/akses-level",
      },
      {
        key: "akses-grup",
        label: "Master Akses Grup",
        pageTitle: "Master Akses Grup",
        path: "/home/konfigurasi-aplikasi/akses-grup",
      },
      {
        key: "menu-manajemen",
        label: "Master Menu",
        pageTitle: "Master Menu Aplikasi",
        path: "/home/konfigurasi-aplikasi/menu",
      },
    ],
  },
  {
    key: "master",
    label: "Master",
    children: [
      {
        key: "pengguna",
        label: "Pengguna",
        pageTitle: "Pengguna",
        path: "/home/master/user",
      },
      {
        key: "permission",
        label: "Permission",
        pageTitle: "Akses Permission",
        path: "/home/master/permission",
      },
      {
        key: "regional",
        label: "Regional",
        pageTitle: "Master Regional",
        path: "/home/master/regional",
      },
      {
        key: "cabang",
        label: "Cabang",
        pageTitle: "Master Cabang",
        path: "/home/master/cabang",
      },
      {
        key: "ranting",
        label: "Ranting",
        pageTitle: "Master Ranting",
        path: "/home/master/ranting",
      },
      {
        key: "uiw-uid",
        label: "UIW / UID",
        pageTitle: "Master UIW / UID",
        path: "/home/master/uiw-uid",
      },
      {
        key: "uik",
        label: "UIK",
        pageTitle: "Master UIK",
        path: "/home/master/uik",
      },
      {
        key: "up2d",
        label: "UP2D",
        pageTitle: "Master UP2D",
        path: "/home/master/up2d",
      },
      {
        key: "upk",
        label: "UPK",
        pageTitle: "Master UPK",
        path: "/home/master/upk",
      },
      {
        key: "unit-layanan",
        label: "Unit Layanan",
        pageTitle: "Master Unit Layanan",
        path: "/home/master/unit-layanan",
      },
      {
        key: "sentral",
        label: "Sentral Pembangkit",
        pageTitle: "Master Sentral Pembangkit",
        path: "/home/master/sentral",
      },
      {
        key: "system",
        label: "Sistem",
        pageTitle: "Master Sistem Pembangkit",
        path: "/home/master/system",
      },
      {
        key: "asset",
        label: "Aset Mesin",
        pageTitle: "Master Aset Mesin Pembangkit",
        path: "/home/master/asset",
      },
      {
        key: "machine-condition",
        label: "Kondisi Mesin",
        pageTitle: "Master Kondisi Mesin",
        path: "/home/master/machine-condition",
      },
      {
        key: "pengemudi",
        label: "Pengemudi",
        pageTitle: "Master Pengemudi",
        path: "/home/master/driver",
      },
      {
        key: "organization",
        label: "Organisasi (Legacy)",
        pageTitle: "Master Organisasi",
        path: "/home/master/organization",
      },
    ],
  },
  {
    key: "transaksi",
    label: "Transaksi",
    children: [
      {
        key: "operasi-harian",
        label: "Operasi Harian",
        pageTitle: "Operasi Harian Pembangkit",
        path: "/home/transaksi/operasi-harian",
      },
      {
        key: "pemakaian-bahan-bakar",
        label: "Pemakaian Bahan Bakar",
        pageTitle: "Pemakaian Bahan Bakar",
        path: "/home/transaksi/pemakaian-bahan-bakar",
      },
      {
        key: "pembebanan",
        label: "Pembebanan",
        pageTitle: "Pembebanan Generator",
        path: "/home/transaksi/pembebanan",
      },
      {
        key: "pagu",
        label: "Pagu",
        pageTitle: "Pagu",
        path: "/home/transaksi/pagu",
      },
      {
        key: "prognosa",
        label: "Prognosa Kinerja",
        pageTitle: "Prognosa Kinerja Pembangkit",
        path: "/home/transaksi/prognosa",
      },
      {
        key: "nko",
        label: "Perhitungan NKO",
        pageTitle: "Perhitungan NKO (Nilai Kinerja Organisasi)",
        path: "/home/transaksi/nko",
      },
    ],
  },
];
