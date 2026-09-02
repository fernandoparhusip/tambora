import type { FormSectionConfig, SelectOption } from "~/types";

export const getUnitLayananFormSections = (
  upkOptions: SelectOption[] = [],
): FormSectionConfig[] => [
  {
    fields: [
      {
        key: "kode",
        label: "Kode Unit Layanan",
        type: "text",
        placeholder: "Contoh: UL-BITUNG",
        colSpan: 6,
        required: true,
      },
      {
        key: "nama",
        label: "Nama Unit Layanan",
        type: "text",
        placeholder: "Contoh: ULPL Bitung",
        colSpan: 6,
        required: true,
      },
      {
        key: "upk_id",
        label: "Induk UPK",
        type: "select",
        placeholder: "Pilih Unit Pelaksana Pembangkitan",
        options: upkOptions,
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
