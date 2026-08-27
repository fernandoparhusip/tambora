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
    | 'email'
    | 'password'
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

/** Standard API Response Wrapper */
export interface ApiResponse<T = any> {
  status: boolean | number | string;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
}

/** Pagination Metadata */
export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

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

/** Backend Auth User Model */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  organization?: string;
  nip?: string;
  prnr?: string;
  status: number | string;
  role?: string;
  level_id?: string;
  created_at?: string;
}

/** Login Request Payload */
export interface LoginRequest {
  email: string;
  password: string;
  username?: string;
}

/** Login Response Payload */
export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: string;
  session_uuid: string;
  user: AuthUser;
}

/** Refresh Token Request Payload */
export interface RefreshRequest {
  refresh_token: string;
}

/** Refresh Token Response Payload */
export interface RefreshResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: string;
}

/** Master User DTOs */
export interface UserRoleAssignment {
  role_code: string;
  scope_codes?: string[];
}

export interface UserItem {
  id: string;
  email: string;
  username: string;
  full_name: string;
  organization?: string;
  nip?: string;
  prnr?: string;
  status: number | string;
  created_at?: string;
  role_assignments?: UserRoleAssignment[];
  // Future-proof UI fields
  nama?: string;
  alamat?: string;
  noTelp?: string;
  jabatan?: string;
  aksesLevel?: string;
  aksesGrup?: string;
  statusKaryawan?: string;
  kategori?: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
  organization?: string;
  nip?: string;
  prnr?: string;
  role_assignments?: UserRoleAssignment[];
  permission_overrides?: { permission_key: string; is_granted: boolean }[];
}

export interface UpdateUserRequest {
  full_name?: string;
  organization?: string;
  nip?: string;
  prnr?: string;
  status?: number;
  role_assignments?: UserRoleAssignment[];
  permission_overrides?: { permission_key: string; is_granted: boolean }[];
}

export interface UpdateUserPasswordRequest {
  password: string;
}

/** Master Role DTOs */
export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description: string;
  is_system?: boolean;
  status: number;
  permissions?: string[];
}

export interface CreateRoleRequest {
  code: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  code: string;
  name: string;
  description: string;
  permissions?: string[];
}

/** Master Permission DTOs */
export interface PermissionItem {
  id: string;
  permission_key: string;
  description: string;
  resource_code: string;
  resource_name: string;
  action_code: string;
  action_name: string;
}

/** Master Scope DTOs */
export interface ScopeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  scope_type_id?: string;
  scope_type_code?: string;
  scope_type_name?: string;
  parent_id?: string;
}

export interface CreateScopeRequest {
  code: string;
  name: string;
  description: string;
  scope_type_id?: string;
}

export interface UpdateScopeRequest {
  code: string;
  name: string;
  description: string;
  scope_type_id?: string;
}

/** Master Driver DTOs */
export interface DriverItem {
  id: string;
  full_name: string;
  phone_number?: string;
  license_number?: string;
  license_type?: string;
  nik?: string;
  birth_place?: string;
  birth_date?: string;
  employment_start_date?: string;
  employment_status?: string;
  address?: string;
  description?: string;
  status?: number | string;
  created_at?: string;
}

export interface CreateDriverRequest {
  full_name: string;
  phone_number?: string;
  license_number?: string;
  license_type?: string;
  nik?: string;
  birth_place?: string;
  birth_date?: string;
  employment_start_date?: string;
  employment_status?: string;
  address?: string;
  description?: string;
}

export interface UpdateDriverRequest {
  full_name?: string;
  phone_number?: string;
  employment_status?: string;
  address?: string;
  description?: string;
}

/** Master Organization DTOs */
export interface OrganizationItem {
  id: string;
  scope_id?: string;
  parent_id?: string;
  parent_name?: string;
  kode: string;
  nama: string;
  alamat?: string;
  keterangan?: string;
  latitude?: string | number;
  longitude?: string | number;
  created_at?: string;
}

export interface CreateOrganizationRequest {
  kode: string;
  nama: string;
  alamat?: string;
  keterangan?: string;
  latitude?: string;
  longitude?: string;
  parent_id?: string;
}

export interface UpdateOrganizationRequest {
  kode?: string;
  nama?: string;
  alamat?: string;
  keterangan?: string;
  latitude?: string;
  longitude?: string;
  parent_id?: string;
}

/** Master Machine Condition DTOs */
export interface MachineConditionItem {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface CreateMachineConditionRequest {
  name: string;
  description?: string;
  is_active: boolean;
}

export interface UpdateMachineConditionRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

/** Master System DTOs */
export interface SystemItem {
  id: string;
  code: string;
  name: string;
  system_type: 'BESAR' | 'KECIL' | string;
  upk_id?: string;
  service_unit_ids?: string[];
  latitude?: number;
  longitude?: number;
  description?: string;
  created_at?: string;
}

export interface CreateSystemRequest {
  code: string;
  name: string;
  system_type: string;
  upk_id?: string;
  service_unit_ids?: string[];
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface UpdateSystemRequest {
  code?: string;
  name?: string;
  system_type?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

/** Master Asset DTOs */
export interface AssetItem {
  id: string;
  kode_mesin: string;
  nama_mesin: string;
  serial_number?: string;
  merk_mesin?: string;
  tipe_mesin?: string;
  daya_terpasang?: number;
  daya_mampu_netto?: number;
  daya_mampu_pasok?: number;
  kapasitas?: number;
  jenis_tegangan?: string;
  tegangan_hv?: number;
  tegangan_lv?: number;
  merk_generator?: string;
  nama_trafo?: string;
  kode_bahan_bakar?: string;
  kondisi_mesin?: string;
  status_kepemilikan_mesin?: string;
  status_kepemilikan_kwh?: string;
  tahun_operasi?: number;
  power_plant_id?: string;
  system_id?: string;
  created_at?: string;
}

export interface CreateAssetRequest {
  kode_mesin: string;
  nama_mesin: string;
  serial_number?: string;
  merk_mesin?: string;
  tipe_mesin?: string;
  daya_terpasang?: number;
  daya_mampu_netto?: number;
  daya_mampu_pasok?: number;
  kapasitas?: number;
  jenis_tegangan?: string;
  tegangan_hv?: number;
  tegangan_lv?: number;
  merk_generator?: string;
  nama_trafo?: string;
  kode_bahan_bakar?: string;
  kondisi_mesin?: string;
  status_kepemilikan_mesin?: string;
  status_kepemilikan_kwh?: string;
  tahun_operasi?: number;
  power_plant_id?: string;
  system_id?: string;
}

export interface UpdateAssetRequest {
  kode_mesin?: string;
  nama_mesin?: string;
  serial_number?: string;
  daya_terpasang?: number;
  daya_mampu_netto?: number;
  daya_mampu_pasok?: number;
  kondisi_mesin?: string;
}



