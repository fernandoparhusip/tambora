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
  organisasi?: string;
  nip?: string;
  prnr?: string;
  status: number | string;
  created_at?: string;
  role_assignments?: UserRoleAssignment[];
  nama?: string;
  alamat?: string;
  address?: string;
  noTelp?: string;
  jabatan?: string;
  aksesLevel?: string;
  aksesGrup?: string;
  statusKaryawan?: string;
  kategori?: string;
}


export interface CreateUserRequest {
  access_level?: string;
  address?: string;
  akses_grup?: string;
  approval_code?: string;
  description?: string;
  email: string;
  full_name: string;
  is_pengelola?: boolean;
  is_sso?: boolean;
  jabatan?: string;
  jenis_pengguna?: string;
  main_application?: string;
  nip?: string;
  organization?: string;
  organization_id?: string;
  password?: string;
  permission_overrides?: { permission_key: string; is_granted: boolean }[];
  pernr?: string;
  phone_number?: string;
  role_assignments?: UserRoleAssignment[];
  status_karyawan?: string;
  // Backward compatibility
  username?: string;
  permissions?: string[];
  prnr?: string;
}

export interface UpdateUserRequest {
  access_level?: string;
  address?: string;
  akses_grup?: string;
  approval_code?: string;
  description?: string;
  email?: string;
  full_name?: string;
  is_pengelola?: boolean;
  is_sso?: boolean;
  jabatan?: string;
  jenis_pengguna?: string;
  main_application?: string;
  nip?: string;
  organization?: string;
  organization_id?: string;
  password?: string;
  permission_overrides?: { permission_key: string; is_granted: boolean }[];
  pernr?: string;
  phone_number?: string;
  role_assignments?: UserRoleAssignment[];
  status_karyawan?: string;
  status?: number;
  // Backward compatibility
  username?: string;
  permissions?: string[];
  prnr?: string;
}

export interface UpdateUserPasswordRequest {
  password: string;
}

export interface UserDetailRole {
  role_id: string;
  role_code: string;
  role_name: string;
}

export interface UserDetailMenu {
  id?: string;
  code?: string;
  name?: string;
  path?: string;
  icon?: string;
  [key: string]: any;
}

export interface UserDetailPermission {
  ID: string;
  Key: string;
  ResourceCode: string;
  ActionCode: string;
  Description?: string;
}

export interface UserDetailAccess {
  menus?: UserDetailMenu[];
  permissions?: UserDetailPermission[];
}

export interface UserDetailData {
  user: UserItem;
  roles?: UserDetailRole[];
  access?: UserDetailAccess;
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
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
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
  resource_id?: string;
  action_id?: string;
  resource_code: string;
  resource_name: string;
  action_code: string;
  action_name: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreatePermissionRequest {
  permission_key: string;
  description?: string | null;
  resource_id: string;
  action_id: string;
}

export interface UpdatePermissionRequest {
  permission_key: string;
  description?: string | null;
  resource_id: string;
  action_id: string;
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
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
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
