import type { FormSectionConfig } from "~/types";

export interface SentralSchemaOptions {
  regionalOptions?: { label: string; value: any }[];
  rantingOptions?: { label: string; value: any }[];
}

export const getSentralFormSections = (
  options: SentralSchemaOptions = {}
): FormSectionConfig[] => {
  const regionalOptions = options.regionalOptions || [];
  const rantingOptions = options.rantingOptions || [];

  return [
    {
      title: "Informasi Wilayah & Identitas Sentral",
      fields: [
        {
          key: "kode_wilayah",
          label: "Regional / Wilayah",
          type: "select",
          placeholder: "Pilih Regional / Wilayah",
          options: regionalOptions,
          required: false,
          colSpan: 6,
        },
        {
          key: "kode_ranting",
          label: "Ranting",
          type: "select",
          placeholder: "Pilih Ranting",
          options: rantingOptions,
          required: false,
          colSpan: 6,
        },
        {
          key: "kode_sentral",
          label: "Kode Sentral",
          type: "text",
          placeholder: "Contoh: 11001",
          required: true,
          colSpan: 6,
        },
        {
          key: "nama_sentral",
          label: "Nama Sentral Pembangkit",
          type: "text",
          placeholder: "Contoh: Sentral Bitung",
          required: true,
          colSpan: 6,
        },
        {
          key: "kode_singkatan_sentral",
          label: "Singkatan Sentral",
          type: "text",
          placeholder: "Contoh: BTG",
          required: false,
          colSpan: 4,
        },
        {
          key: "kode_jenis_pembangkit",
          label: "Jenis Pembangkit",
          type: "select",
          placeholder: "Pilih Jenis Pembangkit",
          options: [
            { label: "PLTD (Diesel)", value: "PLTD" },
            { label: "PLTU (Uap / Batubara)", value: "PLTU" },
            { label: "PLTG (Gas)", value: "PLTG" },
            { label: "PLTMG (Mesin Gas)", value: "PLTMG" },
            { label: "PLTA (Air)", value: "PLTA" },
            { label: "PLTM / PLTMH (Minihidro)", value: "PLTM" },
            { label: "PLTP (Panas Bumi)", value: "PLTP" },
            { label: "PLTS (Surya)", value: "PLTS" },
            { label: "PLTB (Bayu/Angin)", value: "PLTB" },
            { label: "PLTBm (Biomassa)", value: "PLTBm" },
            { label: "PLTGU (Gas & Uap)", value: "PLTGU" },
          ],
          required: false,
          colSpan: 4,
        },
        {
          key: "jenis_bahan_bakar",
          label: "Jenis Bahan Bakar Utama",
          type: "select",
          placeholder: "Pilih Bahan Bakar",
          options: [
            { label: "HSD (High Speed Diesel)", value: "HSD" },
            { label: "B30 / B35 (Biodiesel)", value: "B30" },
            { label: "MFO (Marine Fuel Oil)", value: "MFO" },
            { label: "Batubara (Coal)", value: "Batubara" },
            { label: "Gas Alam (Natural Gas)", value: "Gas" },
            { label: "Biomassa", value: "Biomassa" },
            { label: "Air (Hydro)", value: "Air" },
            { label: "Surya (Solar)", value: "Surya" },
            { label: "Geothermal", value: "Geothermal" },
          ],
          required: false,
          colSpan: 4,
        },
      ],
    },
    {
      title: "Kapasitas & Kondisi Operasi",
      fields: [
        {
          key: "daya_terpasang",
          label: "Daya Terpasang (kW)",
          type: "number",
          placeholder: "Contoh: 15000",
          required: false,
          colSpan: 6,
        },
        {
          key: "daya_mampu",
          label: "Daya Mampu (kW)",
          type: "number",
          placeholder: "Contoh: 14000",
          required: false,
          colSpan: 6,
        },
        {
          key: "tahun_operasi",
          label: "Tahun Operasi",
          type: "number",
          placeholder: "Contoh: 2018",
          required: false,
          colSpan: 6,
        },
        {
          key: "kondisi",
          label: "Kondisi Operasi",
          type: "select",
          placeholder: "Pilih Kondisi",
          options: [
            { label: "Siap Operasi", value: "SIAP_OPERASI" },
            { label: "Standby", value: "STANDBY" },
            { label: "Pemeliharaan", value: "PEMELIHARAAN" },
            { label: "Gangguan", value: "GANGGUAN" },
            { label: "Rusak Berat", value: "RUSAK_BERAT" },
          ],
          required: false,
          colSpan: 6,
        },
      ],
    },
    {
      title: "Koordinat Lokasi & Status",
      fields: [
        {
          key: "latitude",
          label: "Latitude",
          type: "number",
          placeholder: "Contoh: 1.4400",
          required: false,
          colSpan: 6,
        },
        {
          key: "longitude",
          label: "Longitude",
          type: "number",
          placeholder: "Contoh: 125.1800",
          required: false,
          colSpan: 6,
        },
        {
          key: "approve_status",
          label: "Status Approval",
          type: "select",
          placeholder: "Pilih Status Approval",
          options: [
            { label: "DRAFT", value: "DRAFT" },
            { label: "APPROVED", value: "APPROVED" },
            { label: "REJECTED", value: "REJECTED" },
          ],
          required: false,
          colSpan: 12,
        },
      ],
    },
  ];
};

export const sentralFormSections: FormSectionConfig[] = getSentralFormSections();
