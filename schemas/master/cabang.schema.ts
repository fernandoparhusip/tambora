import type { FormSectionConfig } from "~/types";

export interface CabangSchemaOptions {
  regionalOptions?: { label: string; value: any }[];
}

export const getCabangFormSections = (
  options: CabangSchemaOptions = {},
): FormSectionConfig[] => {
  const regionalOptions = options.regionalOptions || [];

  return [
    {
      fields: [
        {
          key: "kode_wilayah",
          label: "Regional",
          type: "searchable-select",
          placeholder: "Pilih Regional",
          options: regionalOptions,
          required: true,
          colSpan: 12,
        },
        {
          key: "kode_cabang",
          label: "Kode",
          type: "text",
          placeholder: "Contoh: CBG-MND",
          required: true,
          colSpan: 12,
        },
        {
          key: "nama_cabang",
          label: "Nama",
          type: "text",
          placeholder: "Contoh: PLN Cabang Manado",
          required: true,
          colSpan: 12,
        },
      ],
    },
  ];
};
