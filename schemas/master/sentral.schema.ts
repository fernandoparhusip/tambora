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
          type: "searchable-select",
          placeholder: "Pilih Regional / Wilayah",
          options: regionalOptions,
          required: true,
          colSpan: 6,
        },
        {
          key: "kode_ranting",
          label: "Ranting",
          type: "searchable-select",
          placeholder: "Pilih Ranting",
          options: rantingOptions,
          required: true,
          colSpan: 6,
        },
        {
          key: "kode_sentral",
          label: "Kode Sentral",
          type: "text",
          placeholder: "Contoh: PLTD-BTG",
          required: true,
          colSpan: 6,
        },
        {
          key: "nama_sentral",
          label: "Nama Sentral",
          type: "text",
          placeholder: "Contoh: PLTD Bitung",
          required: true,
          colSpan: 6,
        },
      ],
    },
    {
      title: "Spesifikasi Teknis & Kapasitas",
      fields: [
        {
          key: "kode_jenis_pembangkit",
          label: "Jenis Pembangkit",
          type: "select",
          placeholder: "Pilih Jenis Pembangkit",
          options: [
            { label: "PLTD (Diesel)", value: "PLTD" },
            { label: "PLTU (Uap)", value: "PLTU" },
            { label: "PLTG (Gas)", value: "PLTG" },
            { label: "PLTGU (Gas & Uap)", value: "PLTGU" },
            { label: "PLTA (Air)", value: "PLTA" },
            { label: "PLTM (Minihidro)", value: "PLTM" },
            { label: "PLTS (Surya)", value: "PLTS" },
            { label: "PLTB (Bayu/Angin)", value: "PLTB" },
            { label: "PLTBg (Biogas)", value: "PLTBg" },
          ],
          required: false,
          colSpan: 6,
        },
        {
          key: "jenis_bahan_bakar",
          label: "Jenis Bahan Bakar",
          type: "select",
          placeholder: "Pilih Jenis Bahan Bakar",
          options: [
            { label: "HSD (High Speed Diesel)", value: "HSD" },
            { label: "B30 / B35 (Biodiesel)", value: "B30" },
            { label: "MFO (Marine Fuel Oil)", value: "MFO" },
            { label: "BATUBARA (Coal)", value: "BATUBARA" },
            { label: "GAS (Natural Gas / LNG)", value: "GAS" },
            { label: "BIOMASS", value: "BIOMASS" },
            { label: "AIR / SURYA / BAYU", value: "EBT" },
          ],
          required: false,
          colSpan: 6,
        },
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
          placeholder: "Contoh: 2015",
          required: false,
          colSpan: 6,
        },
        {
          key: "kondisi",
          label: "Kondisi Operasi",
          type: "select",
          placeholder: "Pilih Kondisi",
          options: [
            { label: "SIAP OPERASI", value: "SIAP_OPERASI" },
            { label: "OPERASI", value: "OPERASI" },
            { label: "STANDBY", value: "STANDBY" },
            { label: "PEMELIHARAAN (HAR)", value: "PEMELIHARAAN" },
            { label: "GANGGUAN", value: "GANGGUAN" },
            { label: "RUSAK", value: "RUSAK" },
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
