import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRegional } from '~/composables/master/useRegional'
import { useCabang } from '~/composables/master/useCabang'
import { useRanting } from '~/composables/master/useRanting'
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

  describe('useRegional', () => {
    it('fetchRegional retrieves regional list correctly', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 'reg-1',
            kode_regional: '11333',
            nama_regional: 'Regional Sulawesi Utara',
            latitude: 1.4870,
            longitude: 124.8421,
          },
        ],
        meta: { total: 1 },
      })

      const { fetchRegional, regionalList, total } = useRegional()
      const result = await fetchRegional()

      expect(result).toHaveLength(1)
      expect(regionalList.value[0]?.kode_regional).toBe('11333')
      expect(total.value).toBe(1)
      expect(mockApi).toHaveBeenCalledWith('/regional', expect.any(Object))
    })

    it('createRegional posts new regional and refreshes list', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'reg-1', kode_regional: '11333' } })
        .mockResolvedValueOnce({ data: [] })

      const { createRegional } = useRegional()
      await createRegional({
        kode_regional: '11333',
        nama_regional: 'Regional Sulawesi Utara',
        latitude: 1.4870,
        longitude: 124.8421,
      })

      expect(mockApi).toHaveBeenCalledWith('/regional', {
        method: 'POST',
        body: expect.objectContaining({ kode_regional: '11333' }),
      })
    })

    it('deleteRegional calls delete endpoint and refreshes list', async () => {
      mockApi
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] })

      const { deleteRegional } = useRegional()
      await deleteRegional('reg-1')

      expect(mockApi).toHaveBeenCalledWith('/regional/reg-1/delete', {
        method: 'POST',
      })
    })
  })

  describe('useCabang', () => {
    it('fetchCabang retrieves cabang list correctly', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 'cbg-1',
            kode_wilayah: '11333',
            kode_cabang: 'CBG-MND',
            nama_cabang: 'PLN Cabang Manado',
            approve_status: 'APPROVED',
          },
        ],
        meta: { total: 1 },
      })

      const { fetchCabang, cabangList } = useCabang()
      const result = await fetchCabang()

      expect(result).toHaveLength(1)
      expect(cabangList.value[0]?.kode_cabang).toBe('CBG-MND')
      expect(mockApi).toHaveBeenCalledWith('/cabang', expect.any(Object))
    })

    it('createCabang posts payload and refreshes list', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'cbg-1', kode_cabang: 'CBG-MND' } })
        .mockResolvedValueOnce({ data: [] })

      const { createCabang } = useCabang()
      await createCabang({
        kode_wilayah: '11333',
        kode_cabang: 'CBG-MND',
        nama_cabang: 'PLN Cabang Manado',
        approve_status: 'APPROVED',
      })

      expect(mockApi).toHaveBeenCalledWith('/cabang', {
        method: 'POST',
        body: expect.objectContaining({ kode_cabang: 'CBG-MND' }),
      })
    })
  })

  describe('useRanting', () => {
    it('fetchRanting retrieves ranting list correctly', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 'rnt-1',
            kode_cabang: 'CBG-MND',
            kode_ranting: 'RNT-TMH',
            nama_ranting: 'PLN Ranting Tomohon',
            status_ranting: 'AKTIF',
            approve_status: 'APPROVED',
          },
        ],
        meta: { total: 1 },
      })

      const { fetchRanting, rantingList } = useRanting()
      const result = await fetchRanting()

      expect(result).toHaveLength(1)
      expect(rantingList.value[0]?.kode_ranting).toBe('RNT-TMH')
      expect(mockApi).toHaveBeenCalledWith('/ranting', expect.any(Object))
    })

    it('fetchRantingCombo calls combo endpoint', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          { id: 'rnt-1', kode_ranting: 'RNT-TMH', nama_ranting: 'PLN Ranting Tomohon' },
        ],
      })

      const { fetchRantingCombo } = useRanting()
      const result = await fetchRantingCombo({ kode_cabang: 'CBG-MND' })

      expect(result).toHaveLength(1)
      expect(mockApi).toHaveBeenCalledWith('/ranting/combo', {
        query: { kode_cabang: 'CBG-MND' },
      })
    })
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
