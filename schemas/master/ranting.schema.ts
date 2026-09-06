import type { FormSectionConfig } from "~/types";

export interface RantingSchemaOptions {
  cabangOptions?: { label: string; value: any }[];
}

export const getRantingFormSections = (
  options: RantingSchemaOptions = {},
): FormSectionConfig[] => {
  const cabangOptions = options.cabangOptions || [];

  return [
    {
      fields: [
        {
          key: "kode_cabang",
          label: "Cabang",
          type: "searchable-select",
          placeholder: "Pilih Cabang",
          options: cabangOptions,
          required: true,
          colSpan: 12,
        },
        {
          key: "kode_ranting",
          label: "Kode",
          type: "text",
          placeholder: "Contoh: RNT-TMH",
          required: true,
          colSpan: 12,
        },
        {
          key: "nama_ranting",
          label: "Nama",
          type: "text",
          placeholder: "Contoh: Ranting Tomohon",
          required: true,
          colSpan: 12,
        },
      ],
    },
  ];
};
