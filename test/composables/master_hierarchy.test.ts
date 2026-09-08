import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSentral } from '~/composables/master/useSentral'

// Mock useApi composable
const mockApi = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi,
}))

describe('Master Hierarchy Composables Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSentral', () => {
    it('fetchSentral retrieves sentral list correctly', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 's-1',
            kode_wilayah: '11333',
            kode_ranting: 'RNT-TMH',
            kode_sentral: 'PLTD-BTG',
            nama_sentral: 'PLTD Bitung',
            kode_jenis_pembangkit: 'PLTD',
            jenis_bahan_bakar: 'HSD',
            daya_terpasang: 15000.0,
            daya_mampu: 14000.0,
            tahun_operasi: 2015,
            kondisi: 'SIAP_OPERASI',
            latitude: 1.4400,
            longitude: 125.1800,
            approve_status: 'DRAFT',
          },
        ],
        meta: { total: 1 },
      })

      const { fetchSentral, sentralList } = useSentral()
      const result = await fetchSentral()

      expect(result).toHaveLength(1)
      expect(sentralList.value[0]?.kode_sentral).toBe('PLTD-BTG')
      expect(mockApi).toHaveBeenCalledWith('/sentral', expect.any(Object))
    })

    it('fetchSentral with search and filter params', async () => {
      mockApi.mockResolvedValueOnce({ data: [], meta: { total: 0 } })

      const { fetchSentral } = useSentral()
      await fetchSentral({ search: 'bitung', kode_wilayah: '11333', kode_ranting: 'RNT-TMH', limit: 20, offset: 0 })

      expect(mockApi).toHaveBeenCalledWith('/sentral', {
        query: expect.objectContaining({ search: 'bitung', kode_wilayah: '11333', kode_ranting: 'RNT-TMH' }),
      })
    })

    it('fetchSentral handles array response directly', async () => {
      mockApi.mockResolvedValueOnce([
        { id: 's-2', kode_sentral: 'PLTD-TDO', nama_sentral: 'PLTD Tahuna' },
      ])

      const { fetchSentral, sentralList, total } = useSentral()
      await fetchSentral()

      expect(sentralList.value[0]?.kode_sentral).toBe('PLTD-TDO')
      expect(total.value).toBe(1)
    })

    it('fetchSentrals fetches all sentrals without params', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          { id: 's-1', kode_sentral: 'PLTD-BTG', nama_sentral: 'PLTD Bitung' },
          { id: 's-2', kode_sentral: 'PLTD-TDO', nama_sentral: 'PLTD Tahuna' },
        ],
        meta: { total: 2 },
      })

      const { fetchSentrals, total } = useSentral()
      const result = await fetchSentrals()

      expect(result).toHaveLength(2)
      expect(total.value).toBe(2)
      expect(mockApi).toHaveBeenCalledWith('/sentral')
    })

    it('getSentralById fetches sentral detail by id', async () => {
      mockApi.mockResolvedValueOnce({
        data: { id: 's-1', kode_sentral: 'PLTD-BTG', nama_sentral: 'PLTD Bitung' },
      })

      const { getSentralById, currentSentral } = useSentral()
      const result = await getSentralById('s-1')

      expect(result).toBeDefined()
      expect(result.kode_sentral).toBe('PLTD-BTG')
      expect(currentSentral.value?.kode_sentral).toBe('PLTD-BTG')
      expect(mockApi).toHaveBeenCalledWith('/sentral/s-1')
    })

    it('getSentralById handles response without data wrapper', async () => {
      mockApi.mockResolvedValueOnce({ id: 's-1', kode_sentral: 'PLTD-BTG' })

      const { getSentralById } = useSentral()
      const result = await getSentralById('s-1')

      expect(result.kode_sentral).toBe('PLTD-BTG')
    })

    it('createSentral posts new sentral data', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 's-1', kode_sentral: 'PLTD-BTG' } })
        .mockResolvedValueOnce({ data: [] })

      const { createSentral } = useSentral()
      await createSentral({
        kode_wilayah: '11333',
        kode_ranting: 'RNT-TMH',
        kode_sentral: 'PLTD-BTG',
        nama_sentral: 'PLTD Bitung',
        kode_jenis_pembangkit: 'PLTD',
        jenis_bahan_bakar: 'HSD',
        daya_terpasang: 15000.0,
        daya_mampu: 14000.0,
        tahun_operasi: 2015,
        kondisi: 'SIAP_OPERASI',
        latitude: 1.4400,
        longitude: 125.1800,
        approve_status: 'DRAFT',
      })

      expect(mockApi).toHaveBeenCalledWith('/sentral', {
        method: 'POST',
        body: expect.objectContaining({ kode_sentral: 'PLTD-BTG' }),
      })
    })

    it('updateSentral sends updated payload to /sentral/:id', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 's-1', kode_sentral: 'PLTD-BTG-UPD' } })
        .mockResolvedValueOnce({ data: [] })

      const { updateSentral } = useSentral()
      await updateSentral('s-1', {
        kode_sentral: 'PLTD-BTG-UPD',
        nama_sentral: 'PLTD Bitung Updated',
      })

      expect(mockApi).toHaveBeenCalledWith('/sentral/s-1', {
        method: 'POST',
        body: expect.objectContaining({ kode_sentral: 'PLTD-BTG-UPD' }),
      })
    })

    it('deleteSentral calls /sentral/:id/delete', async () => {
      mockApi
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] })

      const { deleteSentral } = useSentral()
      await deleteSentral('s-1')

      expect(mockApi).toHaveBeenCalledWith('/sentral/s-1/delete', {
        method: 'POST',
      })
    })

    it('approveSentral triggers approval endpoint', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 's-1', approve_status: 'APPROVED' } })
        .mockResolvedValueOnce({ data: [] })

      const { approveSentral } = useSentral()
      await approveSentral('s-1')

      expect(mockApi).toHaveBeenCalledWith('/sentral/s-1/approve', {
        method: 'POST',
      })
    })

    it('fetchSentral sets error and rethrows on failure', async () => {
      mockApi.mockRejectedValueOnce(new Error('Network error'))

      const { fetchSentral, error } = useSentral()
      await expect(fetchSentral()).rejects.toThrow('Network error')
      expect(error.value).toBe('Network error')
    })

    it('getSentralById sets error and rethrows on failure', async () => {
      mockApi.mockRejectedValueOnce(new Error('Not found'))

      const { getSentralById, error } = useSentral()
      await expect(getSentralById('bad-id')).rejects.toThrow('Not found')
      expect(error.value).toBe('Not found')
    })

    it('createSentral sets error and rethrows on failure', async () => {
      mockApi.mockRejectedValueOnce(new Error('Validation failed'))

      const { createSentral, error } = useSentral()
      await expect(createSentral({} as any)).rejects.toThrow('Validation failed')
      expect(error.value).toBe('Validation failed')
    })

    it('updateSentral sets error and rethrows on failure', async () => {
      mockApi.mockRejectedValueOnce(new Error('Update failed'))

      const { updateSentral, error } = useSentral()
      await expect(updateSentral('s-1', {} as any)).rejects.toThrow('Update failed')
      expect(error.value).toBe('Update failed')
    })

    it('deleteSentral sets error and rethrows on failure', async () => {
      mockApi.mockRejectedValueOnce(new Error('Delete failed'))

      const { deleteSentral, error } = useSentral()
      await expect(deleteSentral('s-1')).rejects.toThrow('Delete failed')
      expect(error.value).toBe('Delete failed')
    })
  })
})
