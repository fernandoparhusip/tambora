/**
 * API Error Handling & Parser Utility
 * Extracts readable message, severity, and status code from API error responses.
 */

export interface ApiErrorResult {
  summary: string
  detail: string
  severity: 'error' | 'warn' | 'info' | 'success'
  statusCode?: number
}

export function parseApiError(error: any): ApiErrorResult {
  const status = error?.response?.status || error?.status || error?.statusCode
  const responseData = error?.response?._data || error?.data || error?.response?.data

  const backendMessage =
    responseData?.message ||
    responseData?.error ||
    (typeof responseData === 'string' ? responseData : null)

  switch (status) {
    case 400:
      return {
        statusCode: 400,
        severity: 'warn',
        summary: 'Permintaan Tidak Valid',
        detail: backendMessage || 'Format data yang dikirim tidak sesuai.'
      }
    case 401:
      return {
        statusCode: 401,
        severity: 'warn',
        summary: 'Sesi Berakhir',
        detail: backendMessage || 'Sesi Anda telah habis. Silakan login kembali.'
      }
    case 403:
      return {
        statusCode: 403,
        severity: 'error',
        summary: 'Akses Ditolak',
        detail: backendMessage || 'Anda tidak memiliki hak akses untuk tindakan ini.'
      }
    case 404:
      return {
        statusCode: 404,
        severity: 'warn',
        summary: 'Tidak Ditemukan',
        detail: backendMessage || 'Data atau layanan yang diminta tidak ditemukan.'
      }
    case 422:
      return {
        statusCode: 422,
        severity: 'warn',
        summary: 'Validasi Gagal',
        detail: backendMessage || 'Periksa kembali data yang Anda masukkan.'
      }
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        statusCode: status,
        severity: 'error',
        summary: 'Gangguan Server',
        detail: backendMessage || 'Terjadi gangguan internal pada server. Silakan coba beberapa saat lagi.'
      }
    default:
      return {
        statusCode: status,
        severity: 'error',
        summary: 'Terjadi Kesalahan',
        detail: backendMessage || error?.message || 'Gagal terhubung ke server atau terjadi kendala jaringan.'
      }
  }
}
