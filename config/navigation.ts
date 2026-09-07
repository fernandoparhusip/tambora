export interface LeafMenuItem {
  label: string;
  pageTitle?: string;
  path: string;
  permission?: string;
  menuCode?: string;
}

export interface SubMenuItem {
  key: string;
  label: string;
  pageTitle?: string;
  path?: string;
  permission?: string;
  menuCode?: string;
  children?: LeafMenuItem[];
}

export interface MenuItem {
  key: string;
  label: string;
  pageTitle?: string;
  path?: string;
  permission?: string;
  menuCode?: string;
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
        permission: "SCOPE.VIEW",
        menuCode: "MENU_SCOPES",
      },
      {
        key: "akses-grup",
        label: "Master Akses Grup",
        pageTitle: "Master Akses Grup",
        path: "/home/konfigurasi-aplikasi/akses-grup",
        permission: "ROLE.VIEW",
        menuCode: "MENU_ROLES",
      },
      {
        key: "menu-manajemen",
        label: "Master Menu",
        pageTitle: "Master Menu",
        path: "/home/konfigurasi-aplikasi/menu",
        permission: "MENU.VIEW",
        menuCode: "MENU_AUTH_ACCESS",
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
        pageTitle: "Master Pengguna",
        path: "/home/master/user",
        permission: "USER.VIEW",
        menuCode: "MENU_USERS",
      },
      {
        key: "permission",
        label: "Permission",
        pageTitle: "Master Permission",
        path: "/home/master/permission",
        permission: "PERMISSION.VIEW",
        menuCode: "MENU_PERMISSIONS",
      },
      {
        key: "regional",
        label: "Regional",
        pageTitle: "Master Regional",
        path: "/home/master/regional",
        permission: "REGIONAL.VIEW",
        menuCode: "MENU_REGIONAL",
      },
      {
        key: "cabang",
        label: "Cabang",
        pageTitle: "Master Cabang",
        path: "/home/master/cabang",
        permission: "CABANG.VIEW",
        menuCode: "MENU_CABANG",
      },
      {
        key: "ranting",
        label: "Ranting",
        pageTitle: "Master Ranting",
        path: "/home/master/ranting",
        permission: "RANTING.VIEW",
        menuCode: "MENU_RANTING",
      },
      {
        key: "uiw-uid",
        label: "UIW / UID",
        pageTitle: "Master UIW / UID",
        path: "/home/master/uiw-uid",
        permission: "UIW_UID.VIEW",
        menuCode: "MENU_UIW_UID",
      },
      {
        key: "uik",
        label: "UIK",
        pageTitle: "Master UIK",
        path: "/home/master/uik",
        permission: "UIK.VIEW",
        menuCode: "MENU_UIK",
      },
      {
        key: "up2d",
        label: "UP2D",
        pageTitle: "Master UP2D",
        path: "/home/master/up2d",
        permission: "UP2D.VIEW",
        menuCode: "MENU_UP2D",
      },
      {
        key: "upk",
        label: "UPK",
        pageTitle: "Master UPK",
        path: "/home/master/upk",
        permission: "UPK.VIEW",
        menuCode: "MENU_UPK",
      },
      {
        key: "unit-layanan",
        label: "Unit Layanan",
        pageTitle: "Master Unit Layanan",
        path: "/home/master/unit-layanan",
        permission: "UNIT_LAYANAN.VIEW",
        menuCode: "MENU_UNIT_LAYANAN",
      },
      {
        key: "sentral",
        label: "Sentral",
        pageTitle: "Master Sentral",
        path: "/home/master/sentral",
        permission: "SENTRAL.VIEW",
        menuCode: "MENU_SENTRAL",
      },
      {
        key: "system",
        label: "Sistem",
        pageTitle: "Master Sistem",
        path: "/home/master/system",
        permission: "SYSTEM.VIEW",
        menuCode: "MENU_SYSTEM",
      },
      {
        key: "asset",
        label: "Asset Mesin",
        pageTitle: "Master Asset Mesin",
        path: "/home/master/asset",
        permission: "ASSET.VIEW",
        menuCode: "MENU_ASSET",
      },
      {
        key: "machine-condition",
        label: "Kondisi Mesin",
        pageTitle: "Master Kondisi Mesin",
        path: "/home/master/machine-condition",
        permission: "MACHINE_CONDITION.VIEW",
        menuCode: "MENU_MACHINE_CONDITION",
      },
      {
        key: "pengemudi",
        label: "Pengemudi",
        pageTitle: "Master Pengemudi",
        path: "/home/master/driver",
        permission: "DRIVER.VIEW",
        menuCode: "MENU_DRIVER",
      },
      {
        key: "organization",
        label: "Organisasi",
        pageTitle: "Master Organisasi",
        path: "/home/master/organization",
        permission: "ORGANIZATION.VIEW",
        menuCode: "MENU_ORGANIZATION",
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
        permission: "OPERASI_HARIAN.VIEW",
        menuCode: "MENU_OPERASI_HARIAN",
      },
      {
        key: "pemakaian-bahan-bakar",
        label: "Pemakaian Bahan Bakar",
        pageTitle: "Pemakaian Bahan Bakar",
        path: "/home/transaksi/pemakaian-bahan-bakar",
        permission: "PEMAKAIAN_BAHAN_BAKAR.VIEW",
        menuCode: "MENU_PEMAKAIAN_BB",
      },
      {
        key: "pembebanan",
        label: "Pembebanan",
        pageTitle: "Pembebanan Generator",
        path: "/home/transaksi/pembebanan",
        permission: "PEMBEBANAN.VIEW",
        menuCode: "MENU_PEMBEBANAN",
      },
      {
        key: "pagu",
        label: "Pagu",
        pageTitle: "Pagu",
        path: "/home/transaksi/pagu",
        permission: "PAGU.VIEW",
        menuCode: "MENU_PAGU",
      },
      {
        key: "prognosa",
        label: "Prognosa Kinerja",
        pageTitle: "Prognosa Kinerja Pembangkit",
        path: "/home/transaksi/prognosa",
        permission: "PROGNOSA.VIEW",
        menuCode: "MENU_PROGNOSA_PLTU",
      },
      {
        key: "nko",
        label: "Perhitungan NKO",
        pageTitle: "Perhitungan NKO (Nilai Kinerja Organisasi)",
        path: "/home/transaksi/nko",
        permission: "NKO.VIEW",
        menuCode: "MENU_PERHITUNGAN_NKO",
      },
    ],
  },
];
