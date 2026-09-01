import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAksesLevel } from '~/composables/konfigurasi-aplikasi/useAksesLevel'
import { useAksesGrup } from '~/composables/konfigurasi-aplikasi/useAksesGrup'

const mockApi = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi
}))

describe('Konfigurasi Aplikasi Composables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAksesLevel', () => {
    it('fetchAksesLevels loads akses levels from /scopes', async () => {
      mockApi.mockResolvedValueOnce({
        data: [{ id: '1', code: 'REG-01', name: 'Regional 1' }]
      })

      const { fetchAksesLevels, aksesLevels } = useAksesLevel()
      await fetchAksesLevels()

      expect(mockApi).toHaveBeenCalledWith('/scopes')
      expect(aksesLevels.value).toHaveLength(1)
      expect(aksesLevels.value[0]?.code).toBe('REG-01')
    })

    it('createAksesLevel and updateAksesLevel perform correct API calls', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: '1', code: 'REG-01', name: 'Regional 1', description: 'Regional 1' } })
        .mockResolvedValueOnce({ data: [{ id: '1', code: 'REG-01', name: 'Regional 1', description: 'Regional 1' }] })
        .mockResolvedValueOnce({ data: { id: '1', code: 'REG-01', name: 'Regional Updated', description: 'Regional Updated' } })
        .mockResolvedValueOnce({ data: [{ id: '1', code: 'REG-01', name: 'Regional Updated', description: 'Regional Updated' }] })

      const { createAksesLevel, updateAksesLevel } = useAksesLevel()
      await createAksesLevel({ code: 'REG-01', name: 'Regional 1', description: 'Regional 1' })
      expect(mockApi).toHaveBeenCalledWith('/scopes', {
        method: 'POST',
        body: { code: 'REG-01', name: 'Regional 1', description: 'Regional 1' }
      })

      await updateAksesLevel('1', { code: 'REG-01', name: 'Regional Updated', description: 'Regional Updated' })
      expect(mockApi).toHaveBeenCalledWith('/scopes/1', {
        method: 'POST',
        body: { code: 'REG-01', name: 'Regional Updated', description: 'Regional Updated' }
      })
    })

    it('getAksesLevelById and deleteAksesLevel call correct endpoints', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: '1', code: 'REG-01', name: 'Regional 1' } })
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] })

      const { getAksesLevelById, deleteAksesLevel } = useAksesLevel()
      const detail = await getAksesLevelById('1')
      expect(mockApi).toHaveBeenCalledWith('/scopes/1')
      expect(detail?.code).toBe('REG-01')

      await deleteAksesLevel('1')
      expect(mockApi).toHaveBeenCalledWith('/scopes/1/delete', {
        method: 'POST'
      })
    })
  })

  describe('useAksesGrup', () => {
    it('fetchAksesGrups loads akses grups from /roles', async () => {
      mockApi.mockResolvedValueOnce({
        data: [{ id: 'r-1', code: 'ADMIN', name: 'Administrator' }]
      })

      const { fetchAksesGrups, aksesGrups } = useAksesGrup()
      await fetchAksesGrups()

      expect(mockApi).toHaveBeenCalledWith('/roles')
      expect(aksesGrups.value).toHaveLength(1)
      expect(aksesGrups.value[0]?.code).toBe('ADMIN')
    })

    it('createAksesGrup and updateAksesGrup perform correct API calls', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'r-1', code: 'ADMIN', name: 'Administrator', description: 'Administrator', permissions: [] } })
        .mockResolvedValueOnce({ data: [{ id: 'r-1', code: 'ADMIN', name: 'Administrator', description: 'Administrator', permissions: [] }] })
        .mockResolvedValueOnce({ data: { id: 'r-1', code: 'ADMIN', name: 'Admin Updated', description: 'Admin Updated' } })
        .mockResolvedValueOnce({ data: [{ id: 'r-1', code: 'ADMIN', name: 'Admin Updated', description: 'Admin Updated' }] })

      const { createAksesGrup, updateAksesGrup } = useAksesGrup()
      await createAksesGrup({ code: 'ADMIN', name: 'Administrator', description: 'Administrator', permissions: [] })
      expect(mockApi).toHaveBeenCalledWith('/roles', {
        method: 'POST',
        body: { code: 'ADMIN', name: 'Administrator', description: 'Administrator', permissions: [] }
      })

      await updateAksesGrup('r-1', { code: 'ADMIN', name: 'Admin Updated', description: 'Admin Updated' })
      expect(mockApi).toHaveBeenCalledWith('/roles/r-1', {
        method: 'POST',
        body: { code: 'ADMIN', name: 'Admin Updated', description: 'Admin Updated' }
      })
    })

    it('getAksesGrupById and deleteAksesGrup call correct endpoints', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'r-1', code: 'ADMIN', name: 'Administrator' } })
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] })

      const { getAksesGrupById, deleteAksesGrup } = useAksesGrup()
      const detail = await getAksesGrupById('r-1')
      expect(mockApi).toHaveBeenCalledWith('/roles/r-1')
      expect(detail?.code).toBe('ADMIN')

      await deleteAksesGrup('r-1')
      expect(mockApi).toHaveBeenCalledWith('/roles/r-1/delete', {
        method: 'POST'
      })
    })
  })
})
