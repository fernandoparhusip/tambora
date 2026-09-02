import type { FormSectionConfig } from "~/types";

export interface CabangSchemaOptions {
  regionalOptions?: { label: string; value: any }[];
}

export const getCabangFormSections = (
  options: CabangSchemaOptions = {}
): FormSectionConfig[] => {
  const regionalOptions = options.regionalOptions || [];

  return [
    {
      fields: [
        {
          key: "kode_wilayah",
          label: "Regional / Wilayah",
          type: "searchable-select",
          placeholder: "Pilih Regional / Wilayah",
          options: regionalOptions,
          required: true,
          colSpan: 12,
        },
        {
          key: "kode_cabang",
          label: "Kode Cabang",
          type: "text",
          placeholder: "Contoh: CBG-MND",
          required: true,
          colSpan: 6,
        },
        {
          key: "nama_cabang",
          label: "Nama Cabang",
          type: "text",
          placeholder: "Contoh: PLN Cabang Manado",
          required: true,
          colSpan: 6,
        },
        {
          key: "approve_status",
          label: "Status Approval",
          type: "select",
          placeholder: "Pilih Status Approval",
          options: [
            { label: "APPROVED", value: "APPROVED" },
            { label: "DRAFT", value: "DRAFT" },
            { label: "REJECTED", value: "REJECTED" },
          ],
          required: false,
          colSpan: 6,
        },
        {
          key: "keterangan",
          label: "Keterangan",
          type: "textarea",
          placeholder: "Catatan informasi cabang...",
          required: false,
          colSpan: 12,
          rows: 2,
        },
      ],
    },
  ];
};
