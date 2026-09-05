import type { FormSectionConfig } from "~/types";

export interface AssetSchemaOptions {
  systemOptions?: { label: string; value: any }[];
  conditionOptions?: { label: string; value: any }[];
}

export const getAssetFormSections = (
  options: AssetSchemaOptions = {}
): FormSectionConfig[] => {
  const systemOptions = options.systemOptions || [];
  const conditionOptions = options.conditionOptions || [
    { label: "Beroperasi", value: "Beroperasi" },
    { label: "Standby", value: "Standby" },
    { label: "Derating", value: "Derating" },
    { label: "Gangguan", value: "Gangguan" },
    { label: "Pemeliharaan", value: "Pemeliharaan" },
  ];

  return [
    {
      title: "1. Identitas Mesin & Sistem",
      fields: [
        {
          key: "kode_mesin",
          label: "Kode Mesin",
          type: "text",
          placeholder: "Contoh: 1010111",
          required: true,
          colSpan: 6,
        },
        {
          key: "nama_mesin",
          label: "Nama Mesin",
          type: "text",
          placeholder: "Contoh: PLTD BIMA #07 (CATERPILLAR)",
          required: true,
          colSpan: 6,
        },
        {
          key: "serial_number",
          label: "Nomor Seri",
          type: "text",
          placeholder: "Contoh: 28617",
          required: false,
          colSpan: 6,
        },
        {
          key: "system_id",
          label: "Sistem Pembangkit",
          type: "searchable-select",
          placeholder: "Pilih Sistem Pembangkit",
          options: systemOptions,
          required: false,
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
          required: false,
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
          key: "merk_mesin",
          label: "Merk Mesin (Engine)",
          type: "text",
          placeholder: "Contoh: Caterpillar, Niigata, Daihatsu",
          required: false,
          colSpan: 6,
        },
        {
          key: "tipe_mesin",
          label: "Tipe Mesin",
          type: "text",
          placeholder: "Contoh: 3156B-DITA",
          required: false,
          colSpan: 6,
        },
        {
          key: "merk_generator",
          label: "Merk Generator",
          type: "text",
          placeholder: "Contoh: Kato, Leroy Somer, Stamford",
          required: false,
          colSpan: 6,
        },
        {
          key: "kapasitas",
          label: "Kapasitas Generator (kVA)",
          type: "number",
          placeholder: "Contoh: 4000",
          required: false,
          colSpan: 6,
        },
        {
          key: "jenis_tegangan",
          label: "Level Tegangan",
          type: "select",
          placeholder: "Pilih Level Tegangan",
          options: [
            { label: "LV (Low Voltage - 380V / 400V)", value: "LV" },
            { label: "MV (Medium Voltage - 6.3kV / 20kV)", value: "MV" },
            { label: "HV (High Voltage - 70kV / 150kV)", value: "HV" },
          ],
          required: false,
          colSpan: 6,
        },
        {
          key: "nama_trafo",
          label: "Nama Trafo Step-Up Terhubung",
          type: "text",
          placeholder: "Contoh: Trafo Unit 7 (20kV)",
          required: false,
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
          placeholder: "Pilih Status",
          options: [
            { label: "PLN (Aset Milik Sendiri)", value: "PLN" },
            { label: "Sewa (IPP / Rental Unit)", value: "SEWA" },
            { label: "KSO (Kerja Sama Operasi)", value: "KSO" },
          ],
          required: false,
          colSpan: 6,
        },
        {
          key: "status_kepemilikan_kwh",
          label: "Status Kepemilikan kWh",
          type: "select",
          placeholder: "Pilih Status kWh",
          options: [
            { label: "PLN", value: "PLN" },
            { label: "SEWA", value: "SEWA" },
          ],
          required: false,
          colSpan: 6,
        },
        {
          key: "tahun_operasi",
          label: "Tahun Mulai Operasi (COD)",
          type: "number",
          placeholder: "Contoh: 2018",
          required: false,
          colSpan: 12,
        },
      ],
    },
  ];
};
