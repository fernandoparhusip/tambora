import type { FormSectionConfig } from "~/types";

export interface PaguBidangSchemaOptions {
  paguUnitOptions?: { label: string; value: string }[];
}

export const getPaguBidangFormSections = (options: PaguBidangSchemaOptions = {}): FormSectionConfig[] => [
  {
    title: "Informasi Alokasi Bidang",
    fields: [
      { key: "pagu_unit_id", label: "Pagu Unit Referensi", type: "searchable-select", colSpan: 8, required: true, options: options.paguUnitOptions || [] },
      { key: "periode", label: "Tahun Periode", type: "number", colSpan: 4, required: true },
    ],
  },
];
