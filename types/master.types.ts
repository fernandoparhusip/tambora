export interface DetailDataItem {
  label: string;
  value?: string | number;
  isStatus?: boolean;
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
  code?: string;
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

export interface CreatePermissionRequest {
  permission_key: string;
  description?: string;
  resource_code?: string;
  resource_name?: string;
  action_code?: string;
  action_name?: string;
}

export interface UpdatePermissionRequest {
  permission_key?: string;
  description?: string;
  resource_code?: string;
  resource_name?: string;
  action_code?: string;
  action_name?: string;
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
  code?: string;
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
