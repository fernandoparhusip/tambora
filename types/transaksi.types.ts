/**
 * Transaksi Modules Type Definitions & DTOs
 * Active OpenAPI live: /api/v1/operasi-harian
 */

// 1. Operasi Harian (/api/v1/operasi-harian)
export interface OperasiHarianDTO {
  id: string;
  tanggal: string;
  jam: string;
  sentral_id?: string;
  nama_sentral?: string;
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
  mesin_id: string;
  nama_sentral?: string;
  sentral_id?: string;
  daya_terpasang: number;
  daya_mampu_netto: number;
  daya_mampu_pasok: number;
  daya_mampu_aktual: number;
  produksi: number;
  bahan_bakar: number;
  jenis_bahan_bakar: string;
}

export type UpdateOperasiHarianPayload = Partial<CreateOperasiHarianPayload>;
