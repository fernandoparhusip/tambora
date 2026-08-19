import type { FormSectionConfig } from '~/types'

export const masterRoleFormConfig: FormSectionConfig[] = [
  {
    fields: [
      {
        key: 'roleName',
        label: 'Nama Role',
        type: 'text',
        placeholder: 'Masukkan Nama Role',
        required: true,
        colSpan: 12,
      },
      {
        key: 'levelRole',
        label: 'Level Role',
        type: 'searchable-select',
        placeholder: 'Pilih Level Role',
        required: true,
        colSpan: 12,
        options: [
          { label: 'Wilayah/Unit Induk', value: 'Wilayah/Unit Induk' },
          { label: 'Cabang', value: 'Cabang' },
          { label: 'Ranting', value: 'Ranting' },
          { label: 'Sentral', value: 'Sentral' },
          { label: 'Pengatur Beban', value: 'Pengatur Beban' },
          { label: 'Pengelola (SH/AP)', value: 'Pengelola (SH/AP)' },
        ],
      },
    ],
  },
]
