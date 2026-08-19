export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'currency' | 'number' | 'date' | 'percent' | 'custom';
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'select'
    | 'searchable-select'
    | 'multi-select'
    | 'searchable-multi-select'
    | 'radio'
    | 'phone'
    | 'currency'
    | 'textarea'
    | 'switch';
  placeholder?: string;
  options?: { label: string; value: any }[];
  colSpan?: number; // Dynamic col-span from 1 to 12
  required?: boolean;
  disabled?: boolean;
  maxLength?: number; // For textarea char limit
  rows?: number; // For textarea rows height
  helpText?: string;
  prefix?: string;
}

export interface FormSectionConfig {
  title?: string; // Optional divider label
  fields: FormFieldConfig[];
}

export interface Transaksi {
  id: string;
  tanggal: string;
  nama: string;
  jumlah: number;
  kategori: string;
  status: 'Pending' | 'Selesai' | 'Batal';
}

export interface User {
  id: string;
  nama: string;
  role: string;
  level: string;
  uiw: string;
  status: 'Pegawai' | 'Pengemudi';
}

export interface Keuntungan {
  id: string;
  periode: string;
  wilayah: string;
  pendapatan: number;
  beban: number;
  keuntungan: number;
  growth: number;
}
