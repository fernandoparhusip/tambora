import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOperasiHarian } from '~/composables/transaksi/useOperasiHarian'

// Mock useApi composable
const mockApi = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi,
}))

describe('Transaksi Composables Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useOperasiHarian', () => {
    it('fetchList retrieves and sets operasi harian list with default pagination', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 'oh-1',
            tanggal: '2026-08-26T00:00:00Z',
            jam: '2026-08-26T10:00:00Z',
            nama_sentral: 'PLTU Tambora 1',
            mesin_id: 'm-1',
            daya_terpasang: 100,
            daya_mampu_netto: 88,
            daya_mampu_pasok: 90,
            daya_mampu_aktual: 87,
            produksi: 85,
            bahan_bakar: 1200,
            jenis_bahan_bakar: 'BATUBARA',
          },
        ],
        meta: { total: 1 },
      })

      const { fetchList, list, total, loading } = useOperasiHarian()
      const res = await fetchList()

      expect(res).toHaveLength(1)
      expect(list.value[0]?.nama_sentral).toBe('PLTU Tambora 1')
      expect(total.value).toBe(1)
      expect(loading.value).toBe(false)
      expect(mockApi).toHaveBeenCalledWith('/operasi-harian', {
        query: { limit: 50, offset: 0 },
      })
    })

    it('fetchList passes custom limit and offset query params', async () => {
      mockApi.mockResolvedValueOnce({
        data: [],
        meta: { total: 0 },
      })

      const { fetchList, list, total } = useOperasiHarian()
      await fetchList({ limit: 10, offset: 20 })

      expect(list.value).toEqual([])
      expect(total.value).toBe(0)
      expect(mockApi).toHaveBeenCalledWith('/operasi-harian', {
        query: { limit: 10, offset: 20 },
      })
    })

    it('fetchList handles empty response or non-array data', async () => {
      mockApi.mockResolvedValueOnce({ data: null })

      const { fetchList, list, total } = useOperasiHarian()
      const res = await fetchList()

      expect(res).toEqual([])
      expect(list.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('fetchList handles errors and sets error state', async () => {
      mockApi.mockRejectedValueOnce(new Error('Network Error'))

      const { fetchList, error, loading } = useOperasiHarian()
      await expect(fetchList()).rejects.toThrow('Network Error')
      expect(error.value).toBe('Network Error')
      expect(loading.value).toBe(false)
    })

    it('getById retrieves detail by id and sets currentItem', async () => {
      const mockDetail = {
        id: 'oh-1',
        tanggal: '2026-08-26T00:00:00Z',
        jam: '2026-08-26T10:00:00Z',
        nama_sentral: 'PLTU Tambora 1',
        mesin_id: 'm-1',
        daya_terpasang: 100,
        daya_mampu_netto: 88,
        daya_mampu_pasok: 90,
        daya_mampu_aktual: 87,
        produksi: 85,
        bahan_bakar: 1200,
        jenis_bahan_bakar: 'BATUBARA',
      }
      mockApi.mockResolvedValueOnce({ data: mockDetail })

      const { getById, currentItem, loading } = useOperasiHarian()
      const res = await getById('oh-1')

      expect(res).toEqual(mockDetail)
      expect(currentItem.value).toEqual(mockDetail)
      expect(loading.value).toBe(false)
      expect(mockApi).toHaveBeenCalledWith('/operasi-harian/oh-1')
    })

    it('getById handles error when fetching detail fails', async () => {
      mockApi.mockRejectedValueOnce(new Error('Not Found'))

      const { getById, error, loading } = useOperasiHarian()
      await expect(getById('invalid-id')).rejects.toThrow('Not Found')
      expect(error.value).toBe('Not Found')
      expect(loading.value).toBe(false)
    })

    it('createItem sends post request and refetches list', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'oh-2' } })
        .mockResolvedValueOnce({ data: [] })

      const { createItem, loading } = useOperasiHarian()
      await createItem({
        tanggal: '2026-08-26T00:00:00Z',
        jam: '2026-08-26T10:00:00Z',
        nama_sentral: 'PLTU Tambora 1',
        mesin_id: 'm-1',
        daya_terpasang: 100,
        daya_mampu_netto: 88,
        daya_mampu_pasok: 90,
        daya_mampu_aktual: 87,
        produksi: 85,
        bahan_bakar: 1200,
        jenis_bahan_bakar: 'BATUBARA',
      })

      expect(mockApi).toHaveBeenCalledWith('/operasi-harian', {
        method: 'POST',
        body: expect.objectContaining({
          nama_sentral: 'PLTU Tambora 1',
          mesin_id: 'm-1',
          produksi: 85,
        }),
      })
      expect(loading.value).toBe(false)
    })

    it('createItem handles errors properly', async () => {
      mockApi.mockRejectedValueOnce(new Error('Validation Error'))

      const { createItem, error, loading } = useOperasiHarian()
      await expect(
        createItem({
          tanggal: '2026-08-26T00:00:00Z',
          jam: '2026-08-26T10:00:00Z',
          mesin_id: 'm-1',
          daya_terpasang: 100,
          daya_mampu_netto: 88,
          daya_mampu_pasok: 90,
          daya_mampu_aktual: 87,
          produksi: 85,
          bahan_bakar: 1200,
          jenis_bahan_bakar: 'BATUBARA',
        })
      ).rejects.toThrow('Validation Error')
      expect(error.value).toBe('Validation Error')
      expect(loading.value).toBe(false)
    })

    it('updateItem sends post request to /operasi-harian/{id} and refetches list', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'oh-1' } })
        .mockResolvedValueOnce({ data: [] })

      const { updateItem, loading } = useOperasiHarian()
      await updateItem('oh-1', {
        produksi: 95,
      })

      expect(mockApi).toHaveBeenCalledWith('/operasi-harian/oh-1', {
        method: 'POST',
        body: expect.objectContaining({ produksi: 95 }),
      })
      expect(loading.value).toBe(false)
    })

    it('updateItem handles errors properly', async () => {
      mockApi.mockRejectedValueOnce(new Error('Update Failed'))

      const { updateItem, error, loading } = useOperasiHarian()
      await expect(updateItem('oh-1', { produksi: 95 })).rejects.toThrow('Update Failed')
      expect(error.value).toBe('Update Failed')
      expect(loading.value).toBe(false)
    })

    it('deleteItem sends post request to /operasi-harian/{id}/delete and refetches list', async () => {
      mockApi
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] })

      const { deleteItem, loading } = useOperasiHarian()
      await deleteItem('oh-1')

      expect(mockApi).toHaveBeenCalledWith('/operasi-harian/oh-1/delete', {
        method: 'POST',
      })
      expect(loading.value).toBe(false)
    })

    it('deleteItem handles errors properly', async () => {
      mockApi.mockRejectedValueOnce(new Error('Delete Failed'))

      const { deleteItem, error, loading } = useOperasiHarian()
      await expect(deleteItem('oh-1')).rejects.toThrow('Delete Failed')
      expect(error.value).toBe('Delete Failed')
      expect(loading.value).toBe(false)
    })
  })
})
