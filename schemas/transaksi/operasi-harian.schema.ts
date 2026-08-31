import type { FormSectionConfig } from "~/types";

export interface OperasiHarianSchemaOptions {
  sentralOptions?: { label: string; value: any }[];
  mesinOptions?: { label: string; value: any }[];
}

export const getOperasiHarianFormSections = (
  options: OperasiHarianSchemaOptions = {}
): FormSectionConfig[] => {
  const sentralOptions = options.sentralOptions || [];
  const mesinOptions = options.mesinOptions || [];

  return [
    {
      title: "Informasi Waktu & Lokasi Operasi",
      fields: [
        {
          key: "tanggal",
          label: "Tanggal Operasi",
          type: "date",
          placeholder: "Pilih tanggal",
          required: true,
          colSpan: 6
        },
        {
          key: "jam",
          label: "Jam Pencatatan",
          type: "time",
          placeholder: "08:00",
          required: true,
          colSpan: 6
        },
        {
          key: "sentral_id",
          label: "Sentral / Unit Pembangkit",
          type: "searchable-select",
          options: sentralOptions,
          placeholder: "Pilih sentral pembangkit",
          required: true,
          colSpan: 6
        },
        {
          key: "mesin_id",
          label: "Mesin Pembangkit",
          type: "searchable-select",
          options: mesinOptions,
          placeholder: "Pilih mesin pembangkit",
          required: true,
          colSpan: 6
        }
      ]
    },
    {
      title: "Parameter Daya & Produksi",
      fields: [
        {
          key: "daya_terpasang",
          label: "Daya Terpasang (MW)",
          type: "number",
          placeholder: "Contoh: 100.5",
          required: true,
          colSpan: 6
        },
        {
          key: "daya_mampu_netto",
          label: "Daya Mampu Netto / DMN (MW)",
          type: "number",
          placeholder: "Contoh: 88.5",
          required: true,
          colSpan: 6
        },
        {
          key: "daya_mampu_pasok",
          label: "Daya Mampu Pasok / DMP (MW)",
          type: "number",
          placeholder: "Contoh: 90",
          required: true,
          colSpan: 6
        },
        {
          key: "daya_mampu_aktual",
          label: "Daya Mampu Aktual (MW)",
          type: "number",
          placeholder: "Contoh: 87",
          required: true,
          colSpan: 6
        },
        {
          key: "produksi",
          label: "Produksi Energi (MWh)",
          type: "number",
          placeholder: "Contoh: 85.2",
          required: true,
          colSpan: 12
        }
      ]
    },
    {
      title: "Konsumsi Bahan Bakar",
      fields: [
        {
          key: "jenis_bahan_bakar",
          label: "Jenis Bahan Bakar",
          type: "select",
          options: [
            { label: "BATUBARA", value: "BATUBARA" },
            { label: "SOLAR (HSD)", value: "HSD" },
            { label: "B30 / B35", value: "B30" },
            { label: "MFO", value: "MFO" },
            { label: "BIOMASSA", value: "BIOMASSA" },
            { label: "GAS ALAM", value: "GAS" }
          ],
          placeholder: "Pilih jenis bahan bakar",
          required: true,
          colSpan: 6
        },
        {
          key: "bahan_bakar",
          label: "Jumlah Konsumsi Bahan Bakar",
          type: "number",
          placeholder: "Contoh: 1200.5",
          required: true,
          colSpan: 6
        }
      ]
    }
  ];
};
