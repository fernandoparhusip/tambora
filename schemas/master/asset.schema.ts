import type { FormSectionConfig } from "~/types";

export interface AssetSchemaOptions {
  systemOptions?: { label: string; value: any }[];
  conditionOptions?: { label: string; value: any }[];
  powerPlantOptions?: { label: string; value: any }[];
}

export const getAssetFormSections = (
  options: AssetSchemaOptions = {},
): FormSectionConfig[] => {
  const systemOptions = options.systemOptions || [];
  const conditionOptions = options.conditionOptions || [
    { label: "Beroperasi", value: "Beroperasi" },
    { label: "Standby", value: "Standby" },
    { label: "Derating", value: "Derating" },
    { label: "Gangguan", value: "Gangguan" },
    { label: "Pemeliharaan", value: "Pemeliharaan" },
  ];
  const powerPlantOptions = options.powerPlantOptions || [];

  return [
    {
      title: "1. Identitas Mesin",
      fields: [
        {
          key: "kode_mesin",
          label: "Kode",
          type: "text",
          placeholder: "Contoh: 1010111",
          required: true,
          colSpan: 6,
        },
        {
          key: "nama_mesin",
          label: "Nama",
          type: "text",
          placeholder: "Contoh: PLTD BIMA #07 (CATERPILLAR)",
          required: true,
          colSpan: 6,
        },
        {
          key: "kode_spln",
          label: "Kode SPLN",
          type: "text",
          placeholder: "Contoh: GNW01011",
          required: true,
          colSpan: 6,
        },
        {
          key: "serial_number",
          label: "Serial Number",
          type: "text",
          placeholder: "Contoh: 28617",
          required: true,
          colSpan: 6,
        },
        {
          key: "system_id",
          label: "Sistem",
          type: "searchable-select",
          placeholder: "Pilih Sistem",
          options: systemOptions,
          required: true,
          colSpan: 6,
        },
        {
          key: "power_plant_id",
          label: "Sentral",
          type: "searchable-select",
          placeholder: "Pilih Sentral",
          options: powerPlantOptions,
          required: true,
          colSpan: 6,
        },
        {
          key: "kondisi_mesin",
          label: "Kondisi Mesin",
          type: "searchable-select",
          placeholder: "Pilih Kondisi Mesin",
          options: conditionOptions,
          required: true,
          colSpan: 6,
        },
        {
          key: "kode_bahan_bakar",
          label: "Bahan Bakar",
          type: "searchable-select",
          placeholder: "Pilih Jenis Bahan Bakar",
          options: [
            { label: "101 - HSD (High Speed Diesel)", value: "101 - HSD" },
            { label: "102 - MFO (Marine Fuel Oil)", value: "102 - MFO" },
            { label: "103 - B30 / B35 Biosolar", value: "103 - B30" },
            { label: "201 - Gas Alam (LNG/CNG)", value: "201 - GAS" },
            { label: "301 - Batubara (Coal)", value: "301 - BATUBARA" },
            { label: "401 - Tenaga Surya (PLTS)", value: "401 - SURYA" },
            { label: "501 - Tenaga Air (PLTA/PLTM)", value: "501 - AIR" },
          ],
          required: true,
          colSpan: 6,
        },
      ],
    },
    {
      title: "2. Spesifikasi Daya & Kelistrikan",
      fields: [
        {
          key: "daya_terpasang",
          label: "Daya Terpasang (kW)",
          type: "number",
          placeholder: "Contoh: 3231",
          required: true,
          colSpan: 4,
        },
        {
          key: "daya_mampu_netto",
          label: "Daya Mampu Netto / DMN (kW)",
          type: "number",
          placeholder: "Contoh: 3131",
          required: true,
          colSpan: 4,
        },
        {
          key: "daya_mampu_pasok",
          label: "Daya Mampu Pasok / DMP (kW)",
          type: "number",
          placeholder: "Contoh: 3000",
          required: true,
          colSpan: 4,
        },
        {
          key: "kapasitas",
          label: "Kapasitas Generator (kVA)",
          type: "number",
          placeholder: "Contoh: 210",
          required: true,
          colSpan: 6,
        },
        {
          key: "jenis_tegangan",
          label: "Level Tegangan",
          type: "select",
          placeholder: "Pilih Level Tegangan",
          options: [
            {
              label: "Tegangan Menengah (TM / MV)",
              value: "Tegangan Menengah",
            },
            { label: "Tegangan Rendah (TR / LV)", value: "Tegangan Rendah" },
            { label: "Tegangan Tinggi (TT / HV)", value: "Tegangan Tinggi" },
            {
              label: "Tegangan Ekstra Tinggi (TET / EHV)",
              value: "Tegangan Ekstra Tinggi",
            },
            { label: "MV (Medium Voltage)", value: "MV" },
            { label: "LV (Low Voltage)", value: "LV" },
            { label: "HV (High Voltage)", value: "HV" },
          ],
          required: true,
          colSpan: 6,
        },
        {
          key: "tegangan_hv",
          label: "Tegangan HV (kV)",
          type: "number",
          placeholder: "Contoh: 20",
          required: true,
          colSpan: 6,
        },
        {
          key: "tegangan_lv",
          label: "Tegangan LV (kV)",
          type: "number",
          placeholder: "Contoh: 0.4",
          required: true,
          colSpan: 6,
        },
        {
          key: "merk_mesin",
          label: "Merk Mesin (Engine)",
          type: "text",
          placeholder: "Contoh: Caterpillar, Niigata, Daihatsu",
          required: true,
          colSpan: 6,
        },
        {
          key: "tipe_mesin",
          label: "Tipe Mesin",
          type: "text",
          placeholder: "Contoh: 3156B-DITA",
          required: true,
          colSpan: 6,
        },
        {
          key: "merk_generator",
          label: "Merk Generator",
          type: "text",
          placeholder: "Contoh: HYUNDAI, Kato, Stamford",
          required: true,
          colSpan: 6,
        },
        {
          key: "nama_trafo",
          label: "Nama Trafo Step-Up",
          type: "text",
          placeholder: "Contoh: Sintra",
          required: true,
          colSpan: 6,
        },
      ],
    },
    {
      title: "3. Legalitas & Kepemilikan Aset",
      fields: [
        {
          key: "status_kepemilikan_mesin",
          label: "Status Kepemilikan Mesin",
          type: "select",
          placeholder: "Pilih Status Kepemilikan Mesin",
          options: [
            { label: "PLN Holding", value: "PLN Holding" },
            { label: "PLN (Milik Sendiri)", value: "PLN" },
            { label: "Sewa (IPP / Rental Unit)", value: "Sewa" },
            { label: "SEWA", value: "SEWA" },
            { label: "KSO (Kerja Sama Operasi)", value: "KSO" },
          ],
          required: true,
          colSpan: 6,
        },
        {
          key: "status_kepemilikan_kwh",
          label: "Status Kepemilikan kWh",
          type: "select",
          placeholder: "Pilih Status Kepemilikan kWh",
          options: [
            { label: "Produksi Sendiri", value: "Produksi Sendiri" },
            { label: "PLN", value: "PLN" },
            { label: "Beli / Sewa", value: "Beli / Sewa" },
            { label: "SEWA", value: "SEWA" },
          ],
          required: true,
          colSpan: 6,
        },
        {
          key: "tahun_operasi",
          label: "Tahun Mulai Operasi (COD)",
          type: "year",
          placeholder: "Pilih Tahun",
          required: true,
          colSpan: 6,
        },
      ],
    },
  ];
};
