import type { FormSectionConfig } from "~/types";

export const uikFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "kode",
        label: "Kode",
        type: "text",
        placeholder: "Contoh: UIK-SUL",
        colSpan: 12,
        required: true,
      },
      {
        key: "nama",
        label: "Nama",
        type: "text",
        placeholder: "Contoh: UIK Sulawesi",
        colSpan: 12,
        required: true,
      },
    ],
  },
];
