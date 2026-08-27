import type { FormSectionConfig } from "~/types";

export interface SystemSchemaOptions {
  orgOptions?: { label: string; value: any }[];
}

export const getSystemFormSections = (
  options: SystemSchemaOptions = {}
): FormSectionConfig[] => {
  const orgOptions = options.orgOptions || [];

  return [
    {
      fields: [
        {
          key: "code",
          label: "Kode Sistem",
          type: "text",
          placeholder: "Contoh: SYS-LBK, SYS-SBW, SYS-BIMA",
          required: true,
          colSpan: 6,
        },
        {
          key: "name",
          label: "Nama Sistem Pembangkit",
          type: "text",
          placeholder: "Contoh: Sistem Tambora - Sumbawa",
          required: true,
          colSpan: 6,
        },
        {
          key: "system_type",
          label: "Tipe Sistem Kelistrikan",
          type: "select",
          placeholder: "Pilih Tipe Sistem",
          options: [
            { label: "SISTEM BESAR (Interkoneksi)", value: "BESAR" },
            { label: "SISTEM KECIL (Isolated / Kepulauan)", value: "KECIL" },
          ],
          required: true,
          colSpan: 6,
        },
        {
          key: "upk_id",
          label: "UPK Penanggung Jawab (Organisasi)",
          type: "searchable-select",
          placeholder: "Pilih Unit Pelaksana Pembangkitan",
          options: orgOptions,
          required: false,
          colSpan: 6,
        },
        {
          key: "service_unit_ids",
          label: "Unit Layanan / Sentral Terkait",
          type: "searchable-multi-select",
          placeholder: "Pilih Sentral-Sentral Terkait",
          options: orgOptions,
          required: false,
          colSpan: 12,
        },
        {
          key: "latitude",
          label: "Latitude Pusat Sistem",
          type: "number",
          placeholder: "Contoh: -8.4526",
          required: false,
          colSpan: 6,
        },
        {
          key: "longitude",
          label: "Longitude Pusat Sistem",
          type: "number",
          placeholder: "Contoh: 117.4285",
          required: false,
          colSpan: 6,
        },
        {
          key: "description",
          label: "Deskripsi & Karakteristik Beban",
          type: "textarea",
          placeholder: "Catatan atau spesifikasi sistem kelistrikan ini...",
          required: false,
          colSpan: 12,
          rows: 3,
        },
      ],
    },
  ];
};
