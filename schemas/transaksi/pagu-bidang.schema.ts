import type { FormSectionConfig } from "~/types";

export interface PaguBidangSchemaOptions {
  paguUnitOptions?: { label: string; value: any }[];
}

export const getPaguBidangFormSections = (
  options: PaguBidangSchemaOptions = {}
): FormSectionConfig[] => {
  const paguUnitOptions = options.paguUnitOptions || [];

  return [
    {
      title: "Informasi Pagu Unit & Periode",
      fields: [
        {
          key: "pagu_unit_id",
          label: "Pagu Unit Induk / Referensi",
          type: "searchable-select",
          options: paguUnitOptions,
          placeholder: "Pilih pagu unit",
          required: true,
          colSpan: 6
        },
        {
          key: "periode",
          label: "Tahun Anggaran",
          type: "number",
          placeholder: "Contoh: 2026",
          required: true,
          colSpan: 6
        }
      ]
    }
  ];
};
