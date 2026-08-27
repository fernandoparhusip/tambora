import type { FormSectionConfig } from "~/types";

export const scopeFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "code",
        label: "Kode Scope",
        type: "text",
        placeholder: "Contoh: ORG-PLANT-C, REGIONAL-NTB",
        required: true,
        colSpan: 12,
      },
      {
        key: "name",
        label: "Nama Scope",
        type: "text",
        placeholder: "Contoh: Plant C Tambora",
        required: true,
        colSpan: 12,
      },
      {
        key: "description",
        label: "Deskripsi",
        type: "textarea",
        placeholder: "Masukkan deskripsi cakupan wilayah scope ini...",
        required: true,
        colSpan: 12,
        rows: 3,
      },
    ],
  },
];
