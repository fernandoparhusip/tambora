/** Operasi Pembangkit System Summary */
export interface SystemSummary {
  dmn: number;
  dmp: number;
  bebanSistem: number;
  unitMax: number;
  cadTotal: number;
  cadPutar: number;
}

/** Sentral Summary Item */
export interface SentralSummary {
  id: string | number;
  name: string;
  code?: string;
  status: 'operasi' | 'gangguan' | 'derating' | 'pemeliharaan' | 'standby' | 'rusak_permanen';
  dmn: number;
  dmp: number;
  beban: number;
  lat: number;
  lng: number;
  fuelType?: string;
}

export interface Transaksi {
  id: string;
  tanggal: string;
  nama: string;
  jumlah: number;
  kategori: string;
  status: 'Pending' | 'Selesai' | 'Batal';
}
