import type { FormSectionConfig } from "~/types";

export interface SystemSchemaOptions {}

export const getSystemFormSections = (
  _options: SystemSchemaOptions = {},
): FormSectionConfig[] => {
  return [
    {
      fields: [
        {
          key: "code",
          label: "Kode",
          type: "text",
          placeholder: "Contoh: SYS-LBK, SYS-SBW, SYS-BIMA",
          required: true,
          colSpan: 12,
        },
        {
          key: "name",
          label: "Nama",
          type: "text",
          placeholder: "Contoh: Sistem Tambora - Sumbawa",
          required: true,
          colSpan: 12,
        },
        {
          key: "system_type",
          label: "Tipe",
          type: "select",
          placeholder: "Pilih Tipe",
          options: [
            { label: "SISTEM BESAR (Interkoneksi)", value: "BESAR" },
            { label: "SISTEM KECIL (Isolated / Kepulauan)", value: "KECIL" },
          ],
          required: true,
          colSpan: 12,
        },
        {
          key: "description",
          label: "Deskripsi",
          type: "textarea",
          placeholder: "Deskripsi sistem...",
          required: true,
          colSpan: 12,
          rows: 3,
        },
        {
          key: "coordinates",
          label: "",
          type: "coordinate-picker",
          latKey: "latitude",
          lngKey: "longitude",
          required: true,
          colSpan: 12,
        },
      ],
    },
  ];
};
