export interface PaguDetailAOAKO {
  id: string;
  pagu_id: string;
  uraian_id?: string | null;
  level: number;
  urutan: number;
  uraian: string;
  ao: number;
  ako: number;
  created_at: string;
  updated_at?: string | null;
}

export interface PaguDetailAIAKI {
  id: string;
  pagu_id: string;
  jenis_anggaran: 'Luncuran' | 'Murni' | string;
  fungsi?: string | null;
  no_prk?: string | null;
  no_pa?: string | null;
  no_kontrak?: string | null;
  nama_kontrak?: string | null;
  nama_vendor?: string | null;
  nilai_kontrak?: number | null;
  nilai_aki?: number | null;
  no_skki?: string | null;
  nama_pekerjaan?: string | null;
  nilai_ai?: number | null;
  dokumen_path?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface PaguDetailPOS54 {
  id: string;
  pagu_id: string;
  uraian_id?: string | null;
  parent_id?: string | null;
  uraian: string;
  tunai?: string | null;
  ao: number;
  ako: number;
  dokumen_path?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface PaguItem {
  id: string;
  jenis_pagu: 'AO_AKO' | 'AI_AKI' | 'POS_54' | string;
  tanggal_input: string; 
  periode: number;
  scope: 'Unit' | 'Bidang' | string;
  revisi: number;
  dokumen_path?: string | null;
  wilayah_id?: string | null;
  ulpl_id?: string | null;
  pembangkit_id?: string | null;
  created_at: string;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  detail_ao_ako?: PaguDetailAOAKO[];
  detail_ai_aki?: PaguDetailAIAKI[];
  detail_pos54?: PaguDetailPOS54[];
  history?: any[];
}

export interface PaguPayload {
  jenis_pagu: 'AO_AKO' | 'AI_AKI' | 'POS_54' | string;
  tanggal_input: string;
  periode: number;
  scope: 'Unit' | 'Bidang' | string;
  dokumen_path?: string | null;
  wilayah_id?: string | null;
  ulpl_id?: string | null;
  pembangkit_id?: string | null;
  detail_ao_ako: Partial<PaguDetailAOAKO>[];
  detail_ai_aki: Partial<PaguDetailAIAKI>[];
  detail_pos54: Partial<PaguDetailPOS54>[];
}

export interface PaguRiwayat {
  id: string;
  pagu_id: string;
  revisi_nomor: number;
  aksi: string;
  data_snapshot: string; 
  catatan?: string | null;
  created_at: string;
  created_by?: string | null;
  creator_name?: string | null;
}

// --- Tambahan untuk Pagu Bidang ---

export interface PaguDetailBidang {
  id: string;
  pagu_bidang_id: string;
  uraian: string;
  persentase: number;
  ao: number;
  ako: number;
  created_at: string;
  updated_at?: string | null;
}

export interface PaguBidangItem {
  id: string;
  pagu_unit_id?: string | null;
  periode: number;
  created_at: string;
  created_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  details?: PaguDetailBidang[];
  history?: any[];
}

export interface PaguBidangPayload {
  pagu_unit_id?: string | null;
  periode: number;
  details: Partial<PaguDetailBidang>[];
}