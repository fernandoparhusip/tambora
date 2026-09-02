import type { FormSectionConfig, SelectOption } from "~/types";

export const getUp2dFormSections = (
  uiwUidOptions: SelectOption[] = [],
): FormSectionConfig[] => [
  {
    fields: [
      {
        key: "kode",
        label: "Kode UP2D",
        type: "text",
        placeholder: "Contoh: UP2D_JATIM",
        colSpan: 6,
        required: true,
      },
      {
        key: "nama",
        label: "Nama UP2D",
        type: "text",
        placeholder: "Contoh: UP2D Jawa Timur",
        colSpan: 6,
        required: true,
      },
      {
        key: "uiw_uid_id",
        label: "Induk UIW / UID",
        type: "select",
        placeholder: "Pilih Unit Induk Distribusi",
        options: uiwUidOptions,
        colSpan: 12,
        required: false,
      },
      {
        key: "alamat",
        label: "Alamat Kantor",
        type: "textarea",
        placeholder: "Masukkan alamat kantor UP2D",
        colSpan: 12,
        required: false,
      },
      {
        key: "keterangan",
        label: "Keterangan",
        type: "textarea",
        placeholder: "Tambahkan catatan keterangan",
        colSpan: 12,
        required: false,
      },
    ],
  },
];
