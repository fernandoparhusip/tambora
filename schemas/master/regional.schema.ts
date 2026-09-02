import type { FormSectionConfig } from "~/types";

export interface RegionalSchemaOptions {}

export const getRegionalFormSections = (
  _options: RegionalSchemaOptions = {}
): FormSectionConfig[] => {
  return [
    {
      fields: [
        {
          key: "kode_regional",
          label: "Kode Regional",
          type: "text",
          placeholder: "Contoh: 11333",
          required: true,
          colSpan: 6,
        },
        {
          key: "nama_regional",
          label: "Nama Regional",
          type: "text",
          placeholder: "Contoh: Sulawesi, Maluku, Papua & Nusra",
          required: true,
          colSpan: 6,
        },
        {
          key: "latitude",
          label: "Latitude",
          type: "number",
          placeholder: "Contoh: 1.4870",
          required: false,
          colSpan: 6,
        },
        {
          key: "longitude",
          label: "Longitude",
          type: "number",
          placeholder: "Contoh: 124.8421",
          required: false,
          colSpan: 6,
        },
        {
          key: "keterangan",
          label: "Keterangan",
          type: "textarea",
          placeholder: "Catatan informasi regional...",
          required: false,
          colSpan: 12,
          rows: 2,
        },
      ],
    },
  ];
};

export const regionalFormSections: FormSectionConfig[] = getRegionalFormSections();

