import type { FormSectionConfig } from "~/types";

export const machineConditionFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "name",
        label: "Nama Kondisi",
        type: "text",
        placeholder: "Contoh: Beroperasi, Standby, Gangguan",
        required: true,
        colSpan: 12,
      },
      {
        key: "description",
        label: "Deskripsi",
        type: "textarea",
        placeholder: "Deskripsi kondisi...",
        required: false,
        colSpan: 12,
        rows: 3,
      },
      {
        key: "is_active",
        label: "Status Aktif?",
        type: "switch",
        helpText: "Nonaktifkan jika status ini sudah tidak digunakan dalam pelaporan.",
        required: false,
        colSpan: 12,
      },
    ],
  },
];
