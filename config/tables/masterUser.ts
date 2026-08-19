import type { TableColumn } from '~/types'

export const userTableColumns: TableColumn[] = [
  { key: 'nama', label: 'Nama', sortable: true, type: 'text' },
  { key: 'aksesLevel', label: 'Akses Level', sortable: true, type: 'text' },
  { key: 'organisasi', label: 'Organisasi', sortable: true, type: 'text' },
  { key: 'aksesGrup', label: 'Akses Grup', sortable: true, type: 'text' },
  { key: 'statusKaryawan', label: 'Status Karyawan', sortable: true, type: 'custom' },
  { key: 'actions', label: 'Aksi', sortable: false, type: 'custom' }
]

export const userStatusTabs = [
  { label: 'Semua Data', key: 'all' },
  { label: 'Pegawai', key: 'Pegawai' },
  { label: 'Pengemudi', key: 'Pengemudi' }
]
