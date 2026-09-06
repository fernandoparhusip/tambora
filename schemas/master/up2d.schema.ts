import type { FormSectionConfig, SelectOption } from "~/types";

export const getUp2dFormSections = (
  uiwUidOptions: SelectOption[] = [],
): FormSectionConfig[] => [
  {
    fields: [
      {
        key: "uiw_uid_id",
        label: "UIW / UID",
        type: "select",
        placeholder: "Pilih UIW / UID",
        options: uiwUidOptions,
        colSpan: 12,
        required: true,
      },
      {
        key: "kode",
        label: "Kode",
        type: "text",
        placeholder: "Contoh: UP2D_JATIM",
        colSpan: 12,
        required: true,
      },
      {
        key: "nama",
        label: "Nama",
        type: "text",
        placeholder: "Contoh: UP2D Jawa Timur",
        colSpan: 12,
        required: true,
      },
      {
        key: "alamat",
        label: "Alamat",
        type: "textarea",
        placeholder: "Masukkan alamat",
        colSpan: 12,
        required: false,
      },
      {
        key: "keterangan",
        label: "Keterangan",
        type: "textarea",
        placeholder: "Tambahkan keterangan",
        colSpan: 12,
        required: false,
      },
    ],
  },
];
