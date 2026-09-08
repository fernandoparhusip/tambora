import type { FormSectionConfig } from "~/types";

export interface SystemSchemaOptions {
  upkOptions?: { label: string; value: any }[];
  unitLayananOptions?: { label: string; value: any }[];
}

export const getSystemFormSections = (
  options: SystemSchemaOptions = {},
): FormSectionConfig[] => {
  const upkOptions = options.upkOptions || [];
  const unitLayananOptions = options.unitLayananOptions || [];

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
          key: "upk_id",
          label: "UPK",
          type: "searchable-select",
          placeholder: "Pilih UPK",
          options: upkOptions,
          required: true,
          colSpan: 6,
        },
        {
          key: "service_unit_ids",
          label: "Unit Layanan",
          type: "searchable-multi-select",
          placeholder: "Pilih Unit Layanan",
          options: unitLayananOptions,
          required: true,
          colSpan: 6,
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
