import type { FormSectionConfig } from "~/types";

export interface PrognosaSchemaOptions {
  orgOptions?: { label: string; value: any }[];
}

export const getPrognosaFormSections = (
  options: PrognosaSchemaOptions = {}
): FormSectionConfig[] => {
  const orgOptions = options.orgOptions || [];

  return [
    {
      title: "Informasi Header Prognosa Kinerja",
      fields: [
        {
          key: "bulan_tahun",
          label: "Bulan & Tahun Prognosa",
          type: "date",
          placeholder: "Pilih tanggal bulan",
          required: true,
          colSpan: 6
        },
        {
          key: "jenis",
          label: "Jenis Pembangkit",
          type: "select",
          options: [
            { label: "PLTU (Pembangkit Listrik Tenaga Uap)", value: "PLTU" },
            { label: "Non-PLTU (PLTD / PLTM / PLTS / PLTB)", value: "Non-PLTU" }
          ],
          placeholder: "Pilih jenis",
          required: true,
          colSpan: 6
        },
        {
          key: "wilayah_id",
          label: "Wilayah / Unit Induk",
          type: "searchable-select",
          options: orgOptions,
          placeholder: "Pilih wilayah",
          required: true,
          colSpan: 6
        },
        {
          key: "ulpl_id",
          label: "Unit Pelaksana (ULPL)",
          type: "searchable-select",
          options: orgOptions,
          placeholder: "Pilih ULPL",
          required: true,
          colSpan: 6
        },
        {
          key: "keterangan_nilai",
          label: "Keterangan Nilai",
          type: "text",
          placeholder: "Contoh: Prognosa Tahunan / Bulanan",
          required: true,
          colSpan: 6
        },
        {
          key: "status",
          label: "Status Dokumen",
          type: "select",
          options: [
            { label: "Draft", value: "Draft" },
            { label: "Submitted", value: "Submitted" },
            { label: "Approved", value: "Approved" }
          ],
          placeholder: "Pilih status",
          required: true,
          colSpan: 6
        }
      ]
    }
  ];
};
