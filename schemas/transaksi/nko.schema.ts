import type { FormSectionConfig } from "~/types";

export const getNKOFormSections = (): FormSectionConfig[] => {
  return [
    {
      title: "Informasi Indikator NKO",
      fields: [
        {
          key: "bulan_tahun",
          label: "Bulan & Tahun",
          type: "date",
          placeholder: "Pilih bulan tahun",
          required: true,
          colSpan: 6
        },
        {
          key: "indikator_nama",
          label: "Nama Indikator KPI",
          type: "text",
          placeholder: "Contoh: Emergency Response Time (ERT)",
          required: true,
          colSpan: 6
        },
        {
          key: "polaritas",
          label: "Polaritas KPI",
          type: "select",
          options: [
            { label: "Positif (+)", value: "Positif" },
            { label: "Negatif (-)", value: "Negatif" }
          ],
          placeholder: "Pilih polaritas",
          required: true,
          colSpan: 4
        },
        {
          key: "satuan",
          label: "Satuan Ukuran",
          type: "text",
          placeholder: "Contoh: Jam / % / Kali",
          required: true,
          colSpan: 4
        },
        {
          key: "bobot",
          label: "Bobot (%)",
          type: "number",
          placeholder: "Contoh: 8",
          required: true,
          colSpan: 4
        }
      ]
    },
    {
      title: "Target & Realisasi",
      fields: [
        {
          key: "target_bulanan",
          label: "Target Bulanan",
          type: "number",
          placeholder: "Contoh: 3",
          required: true,
          colSpan: 6
        },
        {
          key: "realisasi",
          label: "Realisasi Aktual",
          type: "number",
          placeholder: "Contoh: 3",
          required: true,
          colSpan: 6
        },
        {
          key: "status",
          label: "Status Kinerja",
          type: "select",
          options: [
            { label: "Baik", value: "Baik" },
            { label: "Cukup", value: "Cukup" },
            { label: "Kurang", value: "Kurang" }
          ],
          placeholder: "Pilih status",
          required: true,
          colSpan: 12
        },
        {
          key: "keterangan",
          label: "Keterangan Evaluasi",
          type: "textarea",
          placeholder: "Catatan pencapaian target...",
          colSpan: 12,
          rows: 3
        }
      ]
    }
  ];
};
