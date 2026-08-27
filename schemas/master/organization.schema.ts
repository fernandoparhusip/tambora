import type { FormSectionConfig } from "~/types";

export interface OrganizationSchemaOptions {
  parentOptions?: { label: string; value: any }[];
}

export const getOrganizationFormSections = (
  options: OrganizationSchemaOptions = {}
): FormSectionConfig[] => {
  const parentOptions = options.parentOptions || [];

  return [
    {
      fields: [
        {
          key: "kode",
          label: "Kode Organisasi",
          type: "text",
          placeholder: "Contoh: ORG-PLANT-C, UIW-NTB",
          required: true,
          colSpan: 6,
        },
        {
          key: "nama",
          label: "Nama Organisasi",
          type: "text",
          placeholder: "Contoh: Plant C Tambora",
          required: true,
          colSpan: 6,
        },
        {
          key: "parent_id",
          label: "Parent Organisasi (Hierarki)",
          type: "searchable-select",
          placeholder: "Pilih Induk Organisasi",
          options: parentOptions,
          required: false,
          colSpan: 12,
        },
        {
          key: "alamat",
          label: "Alamat / Lokasi Wilayah",
          type: "textarea",
          placeholder: "Masukkan alamat lengkap kantor atau sentral...",
          required: false,
          colSpan: 12,
          rows: 3,
        },
        {
          key: "latitude",
          label: "Latitude",
          type: "number",
          placeholder: "Contoh: -8.4526",
          required: false,
          colSpan: 6,
        },
        {
          key: "longitude",
          label: "Longitude",
          type: "number",
          placeholder: "Contoh: 117.4285",
          required: false,
          colSpan: 6,
        },
        {
          key: "keterangan",
          label: "Keterangan Tambahan",
          type: "textarea",
          placeholder: "Catatan khusus mengenai unit organisasi ini...",
          required: false,
          colSpan: 12,
          rows: 2,
        },
      ],
    },
  ];
};
