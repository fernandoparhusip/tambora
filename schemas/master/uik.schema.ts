import type { FormSectionConfig } from "~/types";

export const uikFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "kode",
        label: "Kode UIK",
        type: "text",
        placeholder: "Contoh: UIK-SUL",
        colSpan: 6,
        required: true,
      },
      {
        key: "nama",
        label: "Nama Unit Induk Pembangkitan",
        type: "text",
        placeholder: "Contoh: UIK Sulawesi",
        colSpan: 6,
        required: true,
      },
    ],
  },
];
