import type { FormSectionConfig } from "~/types";

export interface PembebananSchemaOptions {
  sentralOptions?: { label: string; value: any }[];
  mesinOptions?: { label: string; value: any }[];
}

export const getPembebananFormSections = (
  options: PembebananSchemaOptions = {}
): FormSectionConfig[] => {
  const sentralOptions = options.sentralOptions || [];
  const mesinOptions = options.mesinOptions || [];

  return [
    {
      title: "Informasi Waktu & Lokasi Generator",
      fields: [
        {
          key: "tanggal",
          label: "Tanggal Pengukuran",
          type: "date",
          placeholder: "Pilih tanggal",
          required: true,
          colSpan: 6
        },
        {
          key: "jam",
          label: "Jam Pengukuran",
          type: "time",
          placeholder: "10:00",
          required: true,
          colSpan: 6
        },
        {
          key: "sentral_id",
          label: "Sentral",
          type: "searchable-select",
          options: sentralOptions,
          placeholder: "Pilih Sentral",
          required: true,
          colSpan: 6
        },
        {
          key: "mesin_id",
          label: "Unit Generator",
          type: "searchable-select",
          options: mesinOptions,
          placeholder: "Pilih mesin generator",
          required: true,
          colSpan: 6
        }
      ]
    },
    {
      title: "Parameter Elektrikal Generator",
      fields: [
        {
          key: "beban_mw",
          label: "Beban Aktif (MW)",
          type: "number",
          placeholder: "Contoh: 18.5",
          required: true,
          colSpan: 6
        },
        {
          key: "tegangan_kv",
          label: "Tegangan Operasi (kV)",
          type: "number",
          placeholder: "Contoh: 20.0",
          required: true,
          colSpan: 6
        },
        {
          key: "frekuensi_hz",
          label: "Frekuensi Sistem (Hz)",
          type: "number",
          placeholder: "Contoh: 50.0",
          required: true,
          colSpan: 6
        },
        {
          key: "faktor_daya",
          label: "Faktor Daya (Cos φ)",
          type: "number",
          placeholder: "Contoh: 0.85",
          required: true,
          colSpan: 6
        }
      ]
    }
  ];
};
