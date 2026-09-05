import type { FormSectionConfig } from "~/types";

export const roleFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "code",
        label: "Kode Role",
        type: "text",
        placeholder: "Contoh: OPERATOR_UNIT, SUPERVISOR_HARIAN",
        required: true,
        colSpan: 12,
      },
      {
        key: "name",
        label: "Nama Role",
        type: "text",
        placeholder: "Contoh: Operator Unit Pembangkit",
        required: true,
        colSpan: 12,
      },
      {
        key: "description",
        label: "Deskripsi",
        type: "textarea",
        placeholder: "Deskripsi role...",
        required: true,
        colSpan: 12,
        rows: 3,
      },
      {
        key: "levelRole",
        label: "Level Jabatan",
        type: "searchable-select",
        placeholder: "Pilih Level Jabatan",
        required: false,
        colSpan: 12,
        options: [
          { label: "Wilayah / Unit Induk", value: "Wilayah/Unit Induk" },
          { label: "UPK / Unit Pelaksana", value: "UPK/Unit Pelaksana" },
          { label: "ULP / Sentral Pembangkit", value: "ULP/Sentral Pembangkit" },
        ],
      },
    ],
  },
];
