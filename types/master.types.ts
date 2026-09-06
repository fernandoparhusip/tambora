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
  permissions?: string[];
  permission_ids?: string[];
}

export interface UpdateRoleRequest {
  code?: string;
  name: string;
  description: string;
  permissions?: string[];
  permission_ids?: string[];
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
  created_by_name?: string;
  updated_at?: string;
  updated_by?: string;
  updated_by_name?: string;
  history?: any[];
}

export interface CreateScopeRequest {
  name: string;
  scope_type_id?: string;
  description: string;
  code?: string;
}

export interface UpdateScopeRequest {
  name: string;
  scope_type_id?: string;
  description: string;
  code?: string;
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
  latitude?: string | number;
  longitude?: string | number;
  parent_id?: string;
}

export interface UpdateOrganizationRequest {
  kode?: string;
  nama?: string;
  alamat?: string;
  keterangan?: string;
  latitude?: string | number;
  longitude?: string | number;
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
  system_type: "BESAR" | "KECIL" | string;
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

/** Master Regional DTOs */
export interface RegionalItem {
  id: string;
  kode_regional: string;
  nama_regional: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateRegionalRequest {
  kode_regional: string;
  nama_regional: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateRegionalRequest {
  kode_regional?: string;
  nama_regional?: string;
  latitude?: number;
  longitude?: number;
}

/** Master Cabang DTOs */
export interface CabangItem {
  id: string;
  kode_wilayah: string;
  kode_regional?: string;
  nama_wilayah?: string;
  kode_cabang: string;
  nama_cabang: string;
  approve_status?: string;
  keterangan?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateCabangRequest {
  kode_wilayah: string;
  kode_cabang: string;
  nama_cabang: string;
  approve_status?: string;
  keterangan?: string;
}

export interface UpdateCabangRequest {
  kode_wilayah?: string;
  kode_cabang?: string;
  nama_cabang?: string;
  approve_status?: string;
  keterangan?: string;
}

/** Master Ranting DTOs */
export interface RantingItem {
  id: string;
  kode_cabang: string;
  nama_cabang?: string;
  kode_ranting: string;
  nama_ranting: string;
  status_ranting?: string;
  approve_status?: string;
  keterangan?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateRantingRequest {
  kode_cabang: string;
  kode_ranting: string;
  nama_ranting: string;
  status_ranting?: string;
  approve_status?: string;
  keterangan?: string;
}

export interface UpdateRantingRequest {
  kode_cabang?: string;
  kode_ranting?: string;
  nama_ranting?: string;
  status_ranting?: string;
  approve_status?: string;
  keterangan?: string;
}

/** Master UIW / UID DTOs */
export interface UiwUidItem {
  id: string;
  kode: string;
  nama: string;
  alamat?: string;
  keterangan?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateUiwUidRequest {
  kode: string;
  nama: string;
  alamat?: string;
  keterangan?: string;
}

export interface UpdateUiwUidRequest {
  kode?: string;
  nama?: string;
  alamat?: string;
  keterangan?: string;
}

/** Master UIK DTOs */
export interface UikItem {
  id: string;
  kode: string;
  nama: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateUikRequest {
  kode: string;
  nama: string;
}

export interface UpdateUikRequest {
  kode?: string;
  nama?: string;
}

/** Master UP2D DTOs */
export interface Up2dItem {
  id: string;
  kode: string;
  nama: string;
  uiw_uid_id?: string;
  uiw_uid_nama?: string;
  alamat?: string;
  keterangan?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateUp2dRequest {
  kode: string;
  nama: string;
  uiw_uid_id?: string;
  alamat?: string;
  keterangan?: string;
}

export interface UpdateUp2dRequest {
  kode?: string;
  nama?: string;
  uiw_uid_id?: string;
  alamat?: string;
  keterangan?: string;
}

/** Master UPK DTOs */
export interface UpkItem {
  id: string;
  kode: string;
  nama: string;
  uik_id?: string;
  uik_nama?: string;
  is_active?: boolean;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateUpkRequest {
  kode: string;
  nama: string;
  uik_id?: string;
  is_active?: boolean;
}

export interface UpdateUpkRequest {
  kode?: string;
  nama?: string;
  uik_id?: string;
  is_active?: boolean;
}

/** Master Unit Layanan DTOs */
export interface UnitLayananItem {
  id: string;
  kode: string;
  nama: string;
  upk_id?: string;
  upk_nama?: string;
  is_active?: boolean;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateUnitLayananRequest {
  kode: string;
  nama: string;
  upk_id?: string;
  is_active?: boolean;
}

export interface UpdateUnitLayananRequest {
  kode?: string;
  nama?: string;
  upk_id?: string;
  is_active?: boolean;
}

/** Master Sentral Pembangkit DTOs */
export interface SentralItem {
  id: string;
  kode_wilayah?: string;
  kode_ranting?: string;
  nama_ranting?: string;
  kode_sentral: string;
  nama_sentral: string;
  kode_singkatan_sentral?: string;
  kode_jenis_pembangkit?: string;
  jenis_bahan_bakar?: string;
  daya_terpasang?: number;
  daya_mampu?: number;
  kondisi?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  color?: string;
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  alamat?: string;
  nama_pulau?: string;
  kode_sistem?: string;
  pengelola?: string;
  status_milik?: string;
  status_milik_detail?: string;
  pemegang_saham?: string;
  nilai_asset_awal?: number;
  tahun_operasi?: number;
  sejarah?: string;
  penghargaan?: string;
  deskripsi?: string;
  keterangan?: string;
  manager?: string;
  manager_phone?: string;
  wakil_manager?: string;
  wakil_manager_phone?: string;
  approve_status?: string;
  photo?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateSentralRequest {
  kode_wilayah?: string;
  kode_ranting?: string;
  kode_sentral: string;
  nama_sentral: string;
  kode_singkatan_sentral?: string;
  kode_jenis_pembangkit?: string;
  jenis_bahan_bakar?: string;
  daya_terpasang?: number;
  daya_mampu?: number;
  kondisi?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  color?: string;
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  alamat?: string;
  nama_pulau?: string;
  kode_sistem?: string;
  pengelola?: string;
  status_milik?: string;
  status_milik_detail?: string;
  pemegang_saham?: string;
  nilai_asset_awal?: number;
  tahun_operasi?: number;
  sejarah?: string;
  penghargaan?: string;
  deskripsi?: string;
  keterangan?: string;
  manager?: string;
  manager_phone?: string;
  wakil_manager?: string;
  wakil_manager_phone?: string;
  approve_status?: string;
  photo?: string;
}

export interface UpdateSentralRequest {
  kode_wilayah?: string;
  kode_ranting?: string;
  kode_sentral?: string;
  nama_sentral?: string;
  kode_singkatan_sentral?: string;
  kode_jenis_pembangkit?: string;
  jenis_bahan_bakar?: string;
  daya_terpasang?: number;
  daya_mampu?: number;
  kondisi?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  color?: string;
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  alamat?: string;
  pengelola?: string;
  status_milik?: string;
  manager?: string;
  manager_phone?: string;
  tahun_operasi?: number;
  approve_status?: string;
}

/** Master Menu DTOs */
export interface MenuItem {
  id: string;
  nama: string;
  description?: string;
  route?: string;
  url?: string;
  icon?: string;
  order?: number;
  sort_no?: number;
  parent_id?: string;
  parent_nama?: string;
  status: number;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateMenuRequest {
  nama: string;
  parent_id?: string;
  status: number;
  route?: string;
  url?: string;
  sort_no?: number;
  order?: number;
}

export interface UpdateMenuRequest {
  nama?: string;
  parent_id?: string;
  status?: number;
  route?: string;
  url?: string;
  sort_no?: number;
  order?: number;
}
