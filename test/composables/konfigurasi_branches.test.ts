import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAksesGrup } from '~/composables/konfigurasi-aplikasi/useAksesGrup'
import { useAksesLevel } from '~/composables/konfigurasi-aplikasi/useAksesLevel'
import { useMenu } from '~/composables/konfigurasi-aplikasi/useMenu'

const mockApi = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi
}))

describe('Konfigurasi Aplikasi Composables Branches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAksesGrup Branches', () => {
    it('handles fetchAksesGrups and getAksesGrupById errors', async () => {
      mockApi.mockRejectedValueOnce(new Error('Fetch roles error'))
      const { fetchAksesGrups, getAksesGrupById, error, loading, detailLoading } = useAksesGrup()

      await expect(fetchAksesGrups()).rejects.toThrow('Fetch roles error')
      expect(error.value).toBe('Fetch roles error')
      expect(loading.value).toBe(false)

      mockApi.mockRejectedValueOnce(new Error('Detail role error'))
      await expect(getAksesGrupById('1')).rejects.toThrow('Detail role error')
      expect(error.value).toBe('Detail role error')
      expect(detailLoading.value).toBe(false)
    })

    it('handles createAksesGrup, updateAksesGrup, and deleteAksesGrup', async () => {
      const { createAksesGrup, updateAksesGrup, deleteAksesGrup, error } = useAksesGrup()

      // Success flows
      mockApi.mockResolvedValueOnce({ data: { id: 'g-1' } }) // create
      mockApi.mockResolvedValueOnce({ data: [] }) // re-fetch
      const created = await createAksesGrup({ name: 'Admin', code: 'ADM' } as any)
      expect(created).toBeDefined()

      mockApi.mockResolvedValueOnce({ data: { id: 'g-1' } }) // update
      mockApi.mockResolvedValueOnce({ data: [] }) // re-fetch
      const updated = await updateAksesGrup('g-1', { name: 'Admin New' } as any)
      expect(updated).toBeDefined()

      mockApi.mockResolvedValueOnce({ success: true }) // delete
      mockApi.mockResolvedValueOnce({ data: [] }) // re-fetch
      const deleted = await deleteAksesGrup('g-1')
      expect(deleted).toBeDefined()

      // Error flows
      mockApi.mockRejectedValueOnce(new Error('Create role error'))
      await expect(createAksesGrup({ name: 'Fail' } as any)).rejects.toThrow('Create role error')
      expect(error.value).toBe('Create role error')

      mockApi.mockRejectedValueOnce(new Error('Update role error'))
      await expect(updateAksesGrup('g-1', {} as any)).rejects.toThrow('Update role error')
      expect(error.value).toBe('Update role error')

      mockApi.mockRejectedValueOnce(new Error('Delete role error'))
      await expect(deleteAksesGrup('g-1')).rejects.toThrow('Delete role error')
      expect(error.value).toBe('Delete role error')
    })
  })

  describe('useAksesLevel Branches', () => {
    it('handles various rawList response formats in fetchAksesLevels', async () => {
      const { fetchAksesLevels, aksesLevels } = useAksesLevel()

      // 1. Array in res.data
      mockApi.mockResolvedValueOnce({ data: [{ id: '1', name: 'Scope 1' }] })
      await fetchAksesLevels()
      expect(aksesLevels.value).toHaveLength(1)

      // 2. Direct array
      mockApi.mockResolvedValueOnce([{ id: '2', name: 'Scope 2' }])
      await fetchAksesLevels()
      expect(aksesLevels.value).toHaveLength(1)

      // 3. Array in res.data.items
      mockApi.mockResolvedValueOnce({ data: { items: [{ id: '3', name: 'Scope 3' }] } })
      await fetchAksesLevels()
      expect(aksesLevels.value).toHaveLength(1)

      // 4. Fallback empty
      mockApi.mockResolvedValueOnce({ data: null })
      await fetchAksesLevels()
      expect(aksesLevels.value).toEqual([])
    })

    it('handles fetchScopeTypeCombo gracefully on error', async () => {
      const { fetchScopeTypeCombo, scopeTypeOptions, scopeTypesLoading } = useAksesLevel()

      mockApi.mockRejectedValueOnce(new Error('Scope types error'))
      const res = await fetchScopeTypeCombo()
      expect(res).toEqual([])
      expect(scopeTypeOptions.value).toEqual([])
      expect(scopeTypesLoading.value).toBe(false)
    })

    it('handles create, update, and delete errors', async () => {
      const { createAksesLevel, updateAksesLevel, deleteAksesLevel } = useAksesLevel()

      mockApi.mockRejectedValueOnce(new Error('Create scope error'))
      await expect(createAksesLevel({ name: 'S' } as any)).rejects.toThrow('Create scope error')

      mockApi.mockRejectedValueOnce(new Error('Update scope error'))
      await expect(updateAksesLevel('1', {} as any)).rejects.toThrow('Update scope error')

      mockApi.mockRejectedValueOnce(new Error('Post delete failed'))
      mockApi.mockRejectedValueOnce(new Error('Delete scope error'))
      await expect(deleteAksesLevel('1')).rejects.toThrow('Delete scope error')
    })
  })

  describe('useMenu Branches', () => {
    it('handles non-array response and error in fetchMenus', async () => {
      const { fetchMenus, menus, parentMenuOptions, error, loading } = useMenu()

      mockApi.mockResolvedValueOnce({ data: null })
      const res = await fetchMenus()
      expect(res).toEqual([])
      expect(menus.value).toEqual([])
      expect(parentMenuOptions.value).toEqual([])

      mockApi.mockRejectedValueOnce(new Error('Fetch menu error'))
      await expect(fetchMenus()).rejects.toThrow('Fetch menu error')
      expect(error.value).toBe('Fetch menu error')
      expect(loading.value).toBe(false)
    })

    it('handles getMenuById, createMenu, updateMenu, and deleteMenu errors', async () => {
      const { getMenuById, createMenu, updateMenu, deleteMenu, error } = useMenu()

      mockApi.mockRejectedValueOnce(new Error('Detail menu error'))
      await expect(getMenuById('1')).rejects.toThrow('Detail menu error')
      expect(error.value).toBe('Detail menu error')

      mockApi.mockRejectedValueOnce(new Error('Create menu error'))
      await expect(createMenu({ nama: 'M' } as any)).rejects.toThrow('Create menu error')
      expect(error.value).toBe('Create menu error')

      mockApi.mockRejectedValueOnce(new Error('Update menu error'))
      await expect(updateMenu('1', {} as any)).rejects.toThrow('Update menu error')
      expect(error.value).toBe('Update menu error')

      mockApi.mockRejectedValueOnce(new Error('Delete failed'))
      mockApi.mockRejectedValueOnce(new Error('Delete menu error'))
      await expect(deleteMenu('1')).rejects.toThrow('Delete menu error')
      expect(error.value).toBe('Delete menu error')
    })
  })
})
