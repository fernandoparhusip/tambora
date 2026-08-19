import { describe, it, expect } from 'vitest'
import { parseApiError } from '~/utils/apiError'

describe('API Error Parser Utility', () => {
  it('should parse 400 bad request error', () => {
    const err = { response: { status: 400, _data: { message: 'Invalid payload' } } }
    const result = parseApiError(err)
    expect(result.statusCode).toBe(400)
    expect(result.severity).toBe('warn')
    expect(result.summary).toBe('Permintaan Tidak Valid')
    expect(result.detail).toBe('Invalid payload')
  })

  it('should parse 401 unauthorized error', () => {
    const err = { response: { status: 401 } }
    const result = parseApiError(err)
    expect(result.statusCode).toBe(401)
    expect(result.severity).toBe('warn')
    expect(result.summary).toBe('Sesi Berakhir')
    expect(result.detail).toBe('Sesi Anda telah habis. Silakan login kembali.')
  })

  it('should parse 403 forbidden error', () => {
    const err = { response: { status: 403, _data: { message: 'Forbidden access' } } }
    const result = parseApiError(err)
    expect(result.statusCode).toBe(403)
    expect(result.severity).toBe('error')
    expect(result.summary).toBe('Akses Ditolak')
    expect(result.detail).toBe('Forbidden access')
  })

  it('should parse 404 not found error', () => {
    const err = { response: { status: 404 } }
    const result = parseApiError(err)
    expect(result.statusCode).toBe(404)
    expect(result.severity).toBe('warn')
    expect(result.summary).toBe('Tidak Ditemukan')
  })

  it('should parse 422 validation error', () => {
    const err = { response: { status: 422, _data: { message: 'Email already taken' } } }
    const result = parseApiError(err)
    expect(result.statusCode).toBe(422)
    expect(result.severity).toBe('warn')
    expect(result.summary).toBe('Validasi Gagal')
    expect(result.detail).toBe('Email already taken')
  })

  it('should parse 500 server error', () => {
    const err = { response: { status: 500 } }
    const result = parseApiError(err)
    expect(result.statusCode).toBe(500)
    expect(result.severity).toBe('error')
    expect(result.summary).toBe('Gangguan Server')
  })

  it('should fallback gracefully for network / unhandled errors', () => {
    const err = new Error('Network timeout')
    const result = parseApiError(err)
    expect(result.severity).toBe('error')
    expect(result.summary).toBe('Terjadi Kesalahan')
    expect(result.detail).toBe('Network timeout')
  })
})
