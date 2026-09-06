import type { FormSectionConfig, SelectOption } from "~/types";

export const getUpkFormSections = (
  uikOptions: SelectOption[] = [],
): FormSectionConfig[] => [
  {
    fields: [
      {
        key: "uik_id",
        label: "UIK",
        type: "select",
        placeholder: "Pilih UIK",
        options: uikOptions,
        colSpan: 12,
        required: true,
      },
      {
        key: "kode",
        label: "Kode",
        type: "text",
        placeholder: "Contoh: UPK-MNH",
        colSpan: 12,
        required: true,
      },
      {
        key: "nama",
        label: "Nama",
        type: "text",
        placeholder: "Contoh: UPK Minahasa",
        colSpan: 12,
        required: true,
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
        colSpan: 12,
        required: true,
      },
    ],
  },
];
