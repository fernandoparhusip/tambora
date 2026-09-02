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

function extractBackendMessage(responseData: any): string | null {
  if (!responseData) return null
  if (typeof responseData === 'string') return responseData

  // 1. Direct message or detail string
  if (typeof responseData.message === 'string' && responseData.message) return responseData.message
  if (typeof responseData.detail === 'string' && responseData.detail) return responseData.detail
  if (typeof responseData.error === 'string' && responseData.error) return responseData.error
  if (typeof responseData.error_description === 'string' && responseData.error_description) return responseData.error_description

  // 2. Nested data.message
  if (typeof responseData.data?.message === 'string' && responseData.data.message) return responseData.data.message

  // 3. Validation errors object e.g. { errors: { email: ['invalid email'] } } or { errors: ['error1', 'error2'] }
  if (responseData.errors) {
    if (Array.isArray(responseData.errors)) {
      return responseData.errors.join(', ')
    }
    if (typeof responseData.errors === 'object') {
      const messages = Object.values(responseData.errors)
        .flatMap((err: any) => (Array.isArray(err) ? err : [err]))
        .filter(Boolean)
      if (messages.length > 0) return messages.join(', ')
    }
  }

  return null
}

export function parseApiError(error: any): ApiErrorResult {
  const status = error?.response?.status || error?.status || error?.statusCode
  const responseData = error?.response?._data || error?.data || error?.response?.data

  const backendMessage = extractBackendMessage(responseData)

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
        detail: backendMessage || 'Akses Ditolak: Anda tidak memiliki izin untuk melakukan aksi ini.'
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
    default: {
      const rawMsg = typeof error?.message === 'string' ? error.message : ''
      const isTechnicalError =
        rawMsg.startsWith('[') ||
        rawMsg.includes('Failed to fetch') ||
        rawMsg.includes('fetch failed') ||
        rawMsg.includes('NetworkError') ||
        rawMsg.includes('<no response>') ||
        rawMsg.includes('http://') ||
        rawMsg.includes('https://')

      const detailMessage =
        backendMessage ||
        (isTechnicalError || !rawMsg
          ? 'Gagal terhubung ke server atau terjadi kendala jaringan.'
          : rawMsg)

      return {
        statusCode: status || 0,
        severity: 'error',
        summary: 'Terjadi Kesalahan',
        detail: detailMessage,
      }
    }
  }
}
