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
