import type { FormSectionConfig } from "~/types";

export interface SystemSchemaOptions {
  orgOptions?: { label: string; value: any }[];
}

export const getSystemFormSections = (
  options: SystemSchemaOptions = {},
): FormSectionConfig[] => {
  const orgOptions = options.orgOptions || [];

  return [
    {
      fields: [
        {
          key: "code",
          label: "Kode",
          type: "text",
          placeholder: "Contoh: SYS-LBK, SYS-SBW, SYS-BIMA",
          required: true,
          colSpan: 6,
        },
        {
          key: "name",
          label: "Nama",
          type: "text",
          placeholder: "Contoh: Sistem Tambora - Sumbawa",
          required: true,
          colSpan: 6,
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
          colSpan: 6,
        },
        {
          key: "upk_id",
          label: "UPK",
          type: "searchable-select",
          placeholder: "Pilih UPK",
          options: orgOptions,
          required: false,
          colSpan: 6,
        },
        {
          key: "service_unit_ids",
          label: "Unit Layanan",
          type: "searchable-multi-select",
          placeholder: "Pilih Unit Layanan",
          options: orgOptions,
          required: false,
          colSpan: 12,
        },
        {
          key: "description",
          label: "Deskripsi",
          type: "textarea",
          placeholder: "Deskripsi sistem...",
          required: false,
          colSpan: 12,
          rows: 3,
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
