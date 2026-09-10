import type { FormSectionConfig } from "~/types";

export const getPaguFormSections = (): FormSectionConfig[] => [
  {
    title: "Informasi Pagu Unit",
    fields: [
      { 
        key: "jenis_pagu", 
        label: "Jenis Pagu", 
        type: "select", 
        colSpan: 6, 
        required: true, 
        options: [
          { label: "AO & AKO", value: "AO_AKO" },
          { label: "AI & AKI", value: "AI_AKI" },
          { label: "POS 54", value: "POS_54" }
        ]
      },
      { key: "periode", label: "Tahun Periode", type: "number", colSpan: 6, required: true },
      { key: "scope", label: "Scope", type: "select", colSpan: 6, required: true, options: [{ label: "Unit", value: "Unit" }] },
      { key: "tanggal_input", label: "Tanggal Input", type: "date", colSpan: 6, required: true },
    ],
  },
];
