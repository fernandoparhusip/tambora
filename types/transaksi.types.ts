/**
 * Transaksi Modules Type Definitions & DTOs
 * OpenAPI live: /api/v1/operasi-harian, /pemakaian-bahan-bakar, /pembebanan, /pagu, /pagu-bidang, /prognosa, /nko
 */

// 1. Operasi Harian (/api/v1/operasi-harian)
export interface OperasiHarianDTO {
  id: string;
  tanggal: string;
  jam: string;
  sentral_id: string;
  nama_sentral: string;
  mesin_id: string;
  nama_mesin?: string;
  daya_terpasang: number;
  daya_mampu_netto: number;
  daya_mampu_pasok: number;
  daya_mampu_aktual: number;
  produksi: number;
  bahan_bakar: number;
  jenis_bahan_bakar: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOperasiHarianPayload {
  tanggal: string;
  jam: string;
  sentral_id: string;
  nama_sentral: string;
  mesin_id: string;
  daya_terpasang: number;
  daya_mampu_netto: number;
  daya_mampu_pasok: number;
  daya_mampu_aktual: number;
  produksi: number;
  bahan_bakar: number;
  jenis_bahan_bakar: string;
}

export type UpdateOperasiHarianPayload = Partial<CreateOperasiHarianPayload>;

// 2. Pemakaian Bahan Bakar (/api/v1/pemakaian-bahan-bakar)
export interface PemakaianBahanBakarDTO {
  id: string;
  tanggal: string;
  sentral_id: string;
  nama_sentral?: string;
  mesin_id: string;
  nama_mesin?: string;
  jenis_bahan_bakar: string;
  pemakaian: number;
  satuan: string;
  sisa_stok: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePemakaianBahanBakarPayload {
  tanggal: string;
  sentral_id: string;
  mesin_id: string;
  jenis_bahan_bakar: string;
  pemakaian: number;
  satuan: string;
  sisa_stok: number;
}

export type UpdatePemakaianBahanBakarPayload = Partial<CreatePemakaianBahanBakarPayload>;

// 3. Pembebanan (/api/v1/pembebanan)
export interface PembebananDTO {
  id: string;
  tanggal: string;
  jam: string;
  sentral_id: string;
  nama_sentral?: string;
  mesin_id: string;
  nama_mesin?: string;
  beban_mw: number;
  tegangan_kv: number;
  frekuensi_hz: number;
  faktor_daya: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePembebananPayload {
  tanggal: string;
  jam: string;
  sentral_id: string;
  mesin_id: string;
  beban_mw: number;
  tegangan_kv: number;
  frekuensi_hz: number;
  faktor_daya: number;
}

export type UpdatePembebananPayload = Partial<CreatePembebananPayload>;

// 4. Pagu (/api/v1/pagu)
export interface PaguDetailItem {
  id?: string;
  urutan: number;
  level: number;
  uraian: string;
  ao: number;
  ako: number;
}

export interface PaguDTO {
  id: string;
  jenis_pagu: "AO_AKO" | "AI_AKI" | "POS_54" | string;
  periode: number;
  scope: string;
  tanggal_input: string;
  dokumen_path?: string;
  revisi_ke?: number;
  detail_ao_ako: PaguDetailItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaguPayload {
  jenis_pagu: string;
  periode: number;
  scope: string;
  tanggal_input: string;
  dokumen_path?: string;
  detail_ao_ako: PaguDetailItem[];
}

export type UpdatePaguPayload = Partial<CreatePaguPayload>;

// 5. Pagu Bidang (/api/v1/pagu-bidang)
export interface PaguBidangDetailItem {
  id?: string;
  uraian: string;
  ao: number;
  ako: number;
  persentase: number;
}

export interface PaguBidangDTO {
  id: string;
  pagu_unit_id: string;
  periode: number;
  details: PaguBidangDetailItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaguBidangPayload {
  pagu_unit_id: string;
  periode: number;
  details: PaguBidangDetailItem[];
}

export type UpdatePaguBidangPayload = Partial<CreatePaguBidangPayload>;

// 6. Prognosa (/api/v1/prognosa)
export interface PrognosaMesinItem {
  id?: string;
  nama_mesin: string;
  dtp: number;
  dmn: number;
  dmp: number;
  ph: number;
  sh: number;
  rsh: number;
  poh: number;
  moh: number;
  foh: number;
  ah: number;
  omc: number;
  keterangan?: string;
}

export interface PrognosaDTO {
  id: string;
  wilayah_id: string;
  nama_wilayah?: string;
  ulpl_id: string;
  nama_ulpl?: string;
  bulan_tahun: string;
  jenis: "PLTU" | "Non-PLTU" | string;
  keterangan_nilai: string;
  status: "Draft" | "Submitted" | string;
  mesin_list: PrognosaMesinItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreatePrognosaPayload {
  wilayah_id: string;
  ulpl_id: string;
  bulan_tahun: string;
  jenis: string;
  keterangan_nilai: string;
  status: string;
  mesin_list: PrognosaMesinItem[];
}

export type UpdatePrognosaPayload = Partial<CreatePrognosaPayload>;

// 7. Perhitungan NKO (/api/v1/nko)
export interface NKOItem {
  id?: string;
  indikator_nama: string;
  polaritas: "Positif" | "Negatif" | string;
  satuan: string;
  bobot: number;
  target_bulanan: number;
  realisasi: number;
  status: string;
  keterangan?: string;
}

export interface NKODTO {
  id: string;
  bulan_tahun: string;
  indikator_nama: string;
  polaritas: string;
  satuan: string;
  bobot: number;
  target_bulanan: number;
  realisasi: number;
  status: string;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNKOBatchPayload {
  bulan_tahun: string;
  items: NKOItem[];
}

export interface UpdateNKOPayload {
  bulan_tahun?: string;
  indikator_nama?: string;
  polaritas?: string;
  satuan?: string;
  bobot?: number;
  target_bulanan?: number;
  realisasi?: number;
  status?: string;
  keterangan?: string;
}
