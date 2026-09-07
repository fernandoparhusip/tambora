import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAsset } from '~/composables/master/useAsset'
import { useSentral } from '~/composables/master/useSentral'
import { useOrganization } from '~/composables/master/useOrganization'
import { useDriver } from '~/composables/master/useDriver'
import { useMachineCondition } from '~/composables/master/useMachineCondition'
import { useSystem } from '~/composables/master/useSystem'
import { useCabang } from '~/composables/master/useCabang'
import { useRanting } from '~/composables/master/useRanting'

const mockApi = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi
}))

describe('Master Composables Error & Branch Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAsset Branches', () => {
    it('handles fetchAssets error and resets loading', async () => {
      mockApi.mockRejectedValueOnce(new Error('Network error loading assets'))
      const { fetchAssets, error, loading } = useAsset()

      await expect(fetchAssets()).rejects.toThrow('Network error loading assets')
      expect(error.value).toBe('Network error loading assets')
      expect(loading.value).toBe(false)
    })

    it('handles non-array response gracefully in fetchAssets', async () => {
      mockApi.mockResolvedValueOnce({ data: null })
      const { fetchAssets, assets, total } = useAsset()

      const res = await fetchAssets()
      expect(res).toEqual([])
      expect(assets.value).toEqual([])
      expect(total.value).toBe(0)
    })

    it('handles getAssetById error and resets detailLoading', async () => {
      mockApi.mockRejectedValueOnce(new Error('Asset not found'))
      const { getAssetById, error, detailLoading } = useAsset()

      await expect(getAssetById('invalid-id')).rejects.toThrow('Asset not found')
      expect(error.value).toBe('Asset not found')
      expect(detailLoading.value).toBe(false)
    })

    it('handles createAsset, updateAsset, and deleteAsset errors', async () => {
      mockApi.mockRejectedValueOnce(new Error('Create asset failed'))
      const { createAsset, updateAsset, deleteAsset, error } = useAsset()

      await expect(createAsset({ kode_mesin: 'K1' } as any)).rejects.toThrow('Create asset failed')
      expect(error.value).toBe('Create asset failed')

      mockApi.mockRejectedValueOnce(new Error('Update asset failed'))
      await expect(updateAsset('1', { kode_mesin: 'K1' } as any)).rejects.toThrow('Update asset failed')
      expect(error.value).toBe('Update asset failed')

      mockApi.mockRejectedValueOnce(new Error('Delete asset failed'))
      await expect(deleteAsset('1')).rejects.toThrow('Delete asset failed')
      expect(error.value).toBe('Delete asset failed')
    })
  })

  describe('useSentral Branches', () => {
    it('handles fetchSentral error and non-array fallback', async () => {
      mockApi.mockRejectedValueOnce(new Error('Failed fetching sentral'))
      const { fetchSentral, error, loading } = useSentral()

      await expect(fetchSentral()).rejects.toThrow('Failed fetching sentral')
      expect(error.value).toBe('Failed fetching sentral')
      expect(loading.value).toBe(false)

      mockApi.mockResolvedValueOnce({ data: null })
      const data = await fetchSentral()
      expect(data).toEqual([])
    })

    it('handles updateSentral and deleteSentral errors', async () => {
      mockApi.mockRejectedValueOnce(new Error('Update sentral error'))
      const { updateSentral, deleteSentral, error } = useSentral()

      await expect(updateSentral('s-1', {} as any)).rejects.toThrow('Update sentral error')
      expect(error.value).toBe('Update sentral error')

      mockApi.mockRejectedValueOnce(new Error('Delete sentral error'))
      await expect(deleteSentral('s-1')).rejects.toThrow('Delete sentral error')
      expect(error.value).toBe('Delete sentral error')
    })

    it('handles approveSentral successfully and with error', async () => {
      const { approveSentral, error } = useSentral()

      // Success
      mockApi.mockResolvedValueOnce({ success: true }) // approve endpoint
      mockApi.mockResolvedValueOnce({ data: [] }) // re-fetch sentral
      const successRes = await approveSentral('s-1', 'APPROVE')
      expect(successRes).toBeDefined()

      // Error
      mockApi.mockRejectedValueOnce(new Error('Approve failed'))
      await expect(approveSentral('s-1', 'REJECT')).rejects.toThrow('Approve failed')
      expect(error.value).toBe('Approve failed')
    })
  })

  describe('useOrganization Branches', () => {
    it('handles createOrganization, updateOrganization, and deleteOrganization errors', async () => {
      mockApi.mockRejectedValueOnce(new Error('Create org error'))
      const { createOrganization, updateOrganization, deleteOrganization, error } = useOrganization()

      await expect(createOrganization({ kode: 'O', nama: 'Org' } as any)).rejects.toThrow('Create org error')
      expect(error.value).toBe('Create org error')

      mockApi.mockRejectedValueOnce(new Error('Update org error'))
      await expect(updateOrganization('1', { kode: 'O', nama: 'Org' } as any)).rejects.toThrow('Update org error')
      expect(error.value).toBe('Update org error')

      mockApi.mockRejectedValueOnce(new Error('Delete org error'))
      await expect(deleteOrganization('1')).rejects.toThrow('Delete org error')
      expect(error.value).toBe('Delete org error')
    })
  })

  describe('useDriver, useMachineCondition, and useSystem Branches', () => {
    it('handles useDriver errors', async () => {
      mockApi.mockRejectedValueOnce(new Error('Driver create error'))
      const { createDriver, deleteDriver, error } = useDriver()

      await expect(createDriver({ full_name: 'D' } as any)).rejects.toThrow('Driver create error')
      expect(error.value).toBe('Driver create error')

      mockApi.mockRejectedValueOnce(new Error('Driver delete error'))
      await expect(deleteDriver('1')).rejects.toThrow('Driver delete error')
      expect(error.value).toBe('Driver delete error')
    })

    it('handles useMachineCondition errors', async () => {
      mockApi.mockRejectedValueOnce(new Error('Condition create error'))
      const { createMachineCondition, deleteMachineCondition, error } = useMachineCondition()

      await expect(createMachineCondition({ name: 'C' } as any)).rejects.toThrow('Condition create error')
      expect(error.value).toBe('Condition create error')

      mockApi.mockRejectedValueOnce(new Error('Condition delete error'))
      await expect(deleteMachineCondition('1')).rejects.toThrow('Condition delete error')
      expect(error.value).toBe('Condition delete error')
    })

    it('handles useSystem errors', async () => {
      mockApi.mockRejectedValueOnce(new Error('System create error'))
      const { createSystem, deleteSystem, error } = useSystem()

      await expect(createSystem({ name: 'Sys' } as any)).rejects.toThrow('System create error')
      expect(error.value).toBe('System create error')

      mockApi.mockRejectedValueOnce(new Error('System delete error'))
      await expect(deleteSystem('1')).rejects.toThrow('System delete error')
      expect(error.value).toBe('System delete error')
    })
  })

  describe('useCabang and useRanting Branches', () => {
    it('handles useCabang delete and update errors', async () => {
      mockApi.mockRejectedValueOnce(new Error('Cabang update error'))
      const { updateCabang, deleteCabang, error } = useCabang()

      await expect(updateCabang('1', {} as any)).rejects.toThrow('Cabang update error')
      expect(error.value).toBe('Cabang update error')

      mockApi.mockRejectedValueOnce(new Error('Cabang delete error'))
      await expect(deleteCabang('1')).rejects.toThrow('Cabang delete error')
      expect(error.value).toBe('Cabang delete error')
    })

    it('handles useRanting delete and update errors', async () => {
      mockApi.mockRejectedValueOnce(new Error('Ranting update error'))
      const { updateRanting, deleteRanting, error } = useRanting()

      await expect(updateRanting('1', {} as any)).rejects.toThrow('Ranting update error')
      expect(error.value).toBe('Ranting update error')

      mockApi.mockRejectedValueOnce(new Error('Ranting delete error'))
      await expect(deleteRanting('1')).rejects.toThrow('Ranting delete error')
      expect(error.value).toBe('Ranting delete error')
    })
  })
})
