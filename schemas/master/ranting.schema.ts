import type { FormSectionConfig } from "~/types";

export interface RantingSchemaOptions {
  cabangOptions?: { label: string; value: any }[];
}

export const getRantingFormSections = (
  options: RantingSchemaOptions = {}
): FormSectionConfig[] => {
  const cabangOptions = options.cabangOptions || [];

  return [
    {
      fields: [
        {
          key: "kode_cabang",
          label: "Cabang",
          type: "searchable-select",
          placeholder: "Pilih Cabang",
          options: cabangOptions,
          required: true,
          colSpan: 12,
        },
        {
          key: "kode_ranting",
          label: "Kode Ranting",
          type: "text",
          placeholder: "Contoh: RNT-TMH",
          required: true,
          colSpan: 6,
        },
        {
          key: "nama_ranting",
          label: "Nama Ranting",
          type: "text",
          placeholder: "Contoh: PLN Ranting Tomohon",
          required: true,
          colSpan: 6,
        },
        {
          key: "status_ranting",
          label: "Status Ranting",
          type: "select",
          placeholder: "Pilih Status Ranting",
          options: [
            { label: "AKTIF", value: "AKTIF" },
            { label: "NONAKTIF", value: "NONAKTIF" },
          ],
          required: false,
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
          placeholder: "Catatan informasi ranting...",
          required: false,
          colSpan: 12,
          rows: 2,
        },
      ],
    },
  ];
};
