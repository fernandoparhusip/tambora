export interface LeafMenuItem {
  label: string
  pageTitle?: string
  path: string
}

export interface SubMenuItem {
  key: string
  label: string
  pageTitle?: string
  path?: string
  children?: LeafMenuItem[]
}

export interface MenuItem {
  key: string
  label: string
  pageTitle?: string
  path?: string
  children?: SubMenuItem[]
}

export const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    children: [
      {
        key: 'operasi-pembangkit',
        label: 'Operasi Pembangkit',
        pageTitle: 'Operasi Pembangkit Sistem Tambora',
        path: '/home/dashboard/operasiPembangkit',
      },
    ],
  },
  {
    key: 'master',
    label: 'Master',
    children: [
      {
        key: 'pengguna',
        label: 'Pengguna',
        pageTitle: 'Pengguna',
        path: '/home/master/user',
      },
      {
        key: 'role',
        label: 'Role',
        pageTitle: 'Role & Hak Akses',
        path: '/home/master/role',
      },
      {
        key: 'permission',
        label: 'Permission',
        pageTitle: 'Katalog Hak Akses (Permission)',
        path: '/home/master/permission',
      },
      {
        key: 'scope',
        label: 'Scope',
        pageTitle: 'Master Scope (Wilayah / Unit)',
        path: '/home/master/scope',
      },
      {
        key: 'pengemudi',
        label: 'Pengemudi',
        pageTitle: 'Master Pengemudi',
        path: '/home/master/driver',
      },
      {
        key: 'organization',
        label: 'Organisasi',
        pageTitle: 'Master Organisasi',
        path: '/home/master/organization',
      },
      {
        key: 'system',
        label: 'Sistem',
        pageTitle: 'Master Sistem Pembangkit',
        path: '/home/master/system',
      },
      {
        key: 'asset',
        label: 'Aset Mesin',
        pageTitle: 'Master Aset Mesin Pembangkit',
        path: '/home/master/asset',
      },
      {
        key: 'machine-condition',
        label: 'Kondisi Mesin',
        pageTitle: 'Master Kondisi Mesin',
        path: '/home/master/machine-condition',
      },
    ],
  },
  {
    key: 'transaksi',
    label: 'Transaksi',
    children: [
      {
        key: 'operasi-harian',
        label: 'Operasi Harian',
        pageTitle: 'Operasi Harian Pembangkit',
        path: '/home/transaksi/operasi-harian',
      },
      {
        key: 'pemakaian-bahan-bakar',
        label: 'Pemakaian Bahan Bakar',
        pageTitle: 'Pemakaian Bahan Bakar',
        path: '/home/transaksi/pemakaian-bahan-bakar',
      },
      {
        key: 'pembebanan',
        label: 'Pembebanan',
        pageTitle: 'Pembebanan Generator',
        path: '/home/transaksi/pembebanan',
      },
      {
        key: 'pagu',
        label: 'Pagu',
        pageTitle: 'Pagu',
        path: '/home/transaksi/pagu',
      },
      {
        key: 'prognosa',
        label: 'Prognosa Kinerja',
        pageTitle: 'Prognosa Kinerja Pembangkit',
        path: '/home/transaksi/prognosa',
      },
      {
        key: 'nko',
        label: 'Perhitungan NKO',
        pageTitle: 'Perhitungan NKO (Nilai Kinerja Organisasi)',
        path: '/home/transaksi/nko',
      },
    ],
  },
]
