import type { FormSectionConfig } from "~/types";

export const roleFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "code",
        label: "Kode",
        type: "text",
        placeholder: "Contoh: OPERATOR_UNIT, SUPERVISOR_HARIAN",
        required: true,
        colSpan: 12,
      },
      {
        key: "name",
        label: "Nama",
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
          { label: "Regional", value: "Regional" },
          { label: "UPK", value: "UPK" },
          { label: "ULP", value: "ULP" },
        ],
      },
    ],
  },
];
