import type { FormSectionConfig } from "~/types";

export interface OrganizationSchemaOptions {
  parentOptions?: { label: string; value: any }[];
}

export const getOrganizationFormSections = (
  options: OrganizationSchemaOptions = {},
): FormSectionConfig[] => {
  const parentOptions = options.parentOptions || [];

  return [
    {
      fields: [
        {
          key: "parent_id",
          label: "Parent Organisasi",
          type: "searchable-select",
          placeholder: "Pilih Parent Organisasi",
          options: parentOptions,
          required: false,
          colSpan: 12,
        },
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
          key: "alamat",
          label: "Alamat",
          type: "textarea",
          placeholder: "Alamat...",
          required: true,
          colSpan: 12,
          rows: 3,
        },
        {
          key: "keterangan",
          label: "Keterangan",
          type: "textarea",
          placeholder: "Keterangan...",
          required: true,
          colSpan: 12,
          rows: 2,
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
