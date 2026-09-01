import type { FormSectionConfig } from '~/types';

export const aksesGrupFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: 'code',
        label: 'Kode Akses Grup',
        type: 'text',
        placeholder: 'Contoh: ADMIN_OPERASIONAL, OPERATOR',
        required: true,
        colSpan: 12
      },
      {
        key: 'name',
        label: 'Nama Akses Grup',
        type: 'text',
        placeholder: 'Contoh: Admin Operasional Pembangkit',
        required: true,
        colSpan: 12
      },
      {
        key: 'description',
        label: 'Deskripsi',
        type: 'textarea',
        placeholder: 'Deskripsi peran dan kewenangan akses grup ini...',
        required: false,
        colSpan: 12,
        rows: 3
      }
    ]
  }
];
