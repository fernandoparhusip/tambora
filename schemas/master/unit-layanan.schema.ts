import type { FormSectionConfig, SelectOption } from "~/types";

export const getUnitLayananFormSections = (
  upkOptions: SelectOption[] = [],
): FormSectionConfig[] => [
  {
    fields: [
      {
        key: "upk_id",
        label: "UPK",
        type: "select",
        placeholder: "Pilih UPK",
        options: upkOptions,
        colSpan: 12,
        required: true,
      },
      {
        key: "kode",
        label: "Kode",
        type: "text",
        placeholder: "Contoh: UL-BITUNG",
        colSpan: 12,
        required: true,
      },
      {
        key: "nama",
        label: "Nama",
        type: "text",
        placeholder: "Contoh: ULPL Bitung",
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
