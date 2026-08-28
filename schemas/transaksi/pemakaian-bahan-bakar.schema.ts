import type { FormSectionConfig } from "~/types";

export interface PemakaianBahanBakarSchemaOptions {
  sentralOptions?: { label: string; value: any }[];
  mesinOptions?: { label: string; value: any }[];
}

export const getPemakaianBahanBakarFormSections = (
  options: PemakaianBahanBakarSchemaOptions = {}
): FormSectionConfig[] => {
  const sentralOptions = options.sentralOptions || [];
  const mesinOptions = options.mesinOptions || [];

  return [
    {
      title: "Informasi Lokasi & Tanggal",
      fields: [
        {
          key: "tanggal",
          label: "Tanggal Pemakaian",
          type: "date",
          placeholder: "Pilih tanggal",
          required: true,
          colSpan: 12
        },
        {
          key: "sentral_id",
          label: "Sentral / Unit Pembangkit",
          type: "searchable-select",
          options: sentralOptions,
          placeholder: "Pilih sentral",
          required: true,
          colSpan: 6
        },
        {
          key: "mesin_id",
          label: "Unit Mesin",
          type: "searchable-select",
          options: mesinOptions,
          placeholder: "Pilih unit mesin",
          required: true,
          colSpan: 6
        }
      ]
    },
    {
      title: "Rincian Konsumsi & Stok",
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
          placeholder: "Pilih jenis BBM",
          required: true,
          colSpan: 6
        },
        {
          key: "satuan",
          label: "Satuan Ukuran",
          type: "select",
          options: [
            { label: "Ton", value: "Ton" },
            { label: "Liter", value: "Liter" },
            { label: "kL (Kilo Liter)", value: "kL" },
            { label: "MMBTU", value: "MMBTU" }
          ],
          placeholder: "Pilih satuan",
          required: true,
          colSpan: 6
        },
        {
          key: "pemakaian",
          label: "Jumlah Pemakaian",
          type: "number",
          placeholder: "Contoh: 1500",
          required: true,
          colSpan: 6
        },
        {
          key: "sisa_stok",
          label: "Sisa Stok Tersedia",
          type: "number",
          placeholder: "Contoh: 8500",
          required: true,
          colSpan: 6
        }
      ]
    }
  ];
};
