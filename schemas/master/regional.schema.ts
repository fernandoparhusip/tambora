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
          key: "coordinates",
          label: "",
          type: "coordinate-picker",
          latKey: "latitude",
          lngKey: "longitude",
          required: false,
          colSpan: 12,
        },
      ],
    },
  ];
};

export const regionalFormSections: FormSectionConfig[] = getRegionalFormSections();

