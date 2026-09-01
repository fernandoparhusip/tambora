import type { FormSectionConfig } from '~/types';

export const aksesLevelFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: 'code',
        label: 'Kode Akses Level',
        type: 'text',
        placeholder: 'Contoh: REG-01, UNIT-PLN-01',
        required: true,
        colSpan: 12
      },
      {
        key: 'name',
        label: 'Nama Akses Level',
        type: 'text',
        placeholder: 'Contoh: Regional Jawa-Bali, Unit Pembangkit',
        required: true,
        colSpan: 12
      },
      {
        key: 'description',
        label: 'Deskripsi',
        type: 'textarea',
        placeholder: 'Deskripsi detail cakupan wilayah / unit akses level...',
        required: false,
        colSpan: 12,
        rows: 3
      }
    ]
  }
];
