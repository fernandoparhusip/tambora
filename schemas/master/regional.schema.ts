import type { FormSectionConfig } from "~/types";

export const regionalFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "kode_regional",
        label: "Kode Regional",
        type: "text",
        placeholder: "Contoh: 11333",
        colSpan: 6,
        required: true,
      },
      {
        key: "nama_regional",
        label: "Nama Regional",
        type: "text",
        placeholder: "Contoh: Sulawesi, Maluku, Papua & Nusra",
        colSpan: 6,
        required: true,
      },
      {
        key: "latitude",
        label: "Latitude",
        type: "number",
        placeholder: "Contoh: 1.487",
        colSpan: 6,
        required: false,
      },
      {
        key: "longitude",
        label: "Longitude",
        type: "number",
        placeholder: "Contoh: 124.8421",
        colSpan: 6,
        required: false,
      },
    ],
  },
];
