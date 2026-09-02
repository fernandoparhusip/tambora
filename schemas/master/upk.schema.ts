import type { FormSectionConfig, SelectOption } from "~/types";

export const getUpkFormSections = (
  uikOptions: SelectOption[] = [],
): FormSectionConfig[] => [
  {
    fields: [
      {
        key: "kode",
        label: "Kode UPK",
        type: "text",
        placeholder: "Contoh: UPK-MNH",
        colSpan: 6,
        required: true,
      },
      {
        key: "nama",
        label: "Nama UPK",
        type: "text",
        placeholder: "Contoh: UPK Minahasa",
        colSpan: 6,
        required: true,
      },
      {
        key: "uik_id",
        label: "Induk UIK",
        type: "select",
        placeholder: "Pilih Unit Induk Pembangkitan",
        options: uikOptions,
        colSpan: 6,
        required: false,
      },
      {
        key: "is_active",
        label: "Status Aktif",
        type: "select",
        placeholder: "Pilih Status",
        options: [
          { label: "Aktif", value: true },
          { label: "Non-Aktif", value: false },
        ],
        colSpan: 6,
        required: false,
      },
    ],
  },
];
