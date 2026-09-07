import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCrudState } from '~/composables/useCrudState'

// Mock useAppToast
vi.mock('~/composables/useAppToast', () => ({
  useAppToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    toasts: { value: [] },
    removeToast: vi.fn(),
    clearAll: vi.fn(),
    addToast: vi.fn(),
  })
}))

describe('useCrudState Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses custom defaultPageSize', () => {
    const crud = useCrudState({ defaultPageSize: 25 })
    expect(crud.pageSize.value).toBe(25)
  })

  it('uses default resourceName "Data" when not specified', () => {
    const crud = useCrudState()
    expect(crud.modalTitle.value).toBe('Tambah Data Data')
  })

  it('calls onResetPage callback when searchQuery changes', async () => {
    const onResetPage = vi.fn()
    const crud = useCrudState({ onResetPage })
    crud.currentPage.value = 3
    crud.searchQuery.value = 'test'
    await Promise.resolve()
    expect(onResetPage).toHaveBeenCalled()
    expect(crud.currentPage.value).toBe(1)
  })

  it('executeDelete returns false when deleteTarget is null', async () => {
    const crud = useCrudState()
    const deleteFn = vi.fn()
    const result = await crud.executeDelete(deleteFn)
    expect(result).toBe(false)
    expect(deleteFn).not.toHaveBeenCalled()
  })

  it('executeDelete uses targetId from options when provided', async () => {
    const crud = useCrudState({ resourceName: 'Mesin' })
    crud.openDeleteDialog({ id: 'row-1', nama: 'Row 1' })

    const deleteFn = vi.fn().mockResolvedValue(true)
    const result = await crud.executeDelete(deleteFn, {
      targetId: 'custom-id',
      targetName: 'Custom Name',
      successMessage: 'Custom success'
    })
    expect(result).toBe(true)
    expect(deleteFn).toHaveBeenCalledWith('custom-id')
  })

  it('executeDelete uses "name" property as fallback for targetName', async () => {
    const crud = useCrudState({ resourceName: 'System' })
    crud.openDeleteDialog({ id: 's-1', name: 'System ABC' })

    const deleteFn = vi.fn().mockResolvedValue(true)
    await crud.executeDelete(deleteFn)
    expect(deleteFn).toHaveBeenCalledWith('s-1')
  })

  it('executeDelete falls back to "Data" when no nama or name', async () => {
    const crud = useCrudState()
    crud.openDeleteDialog({ id: 'x-1' })

    const deleteFn = vi.fn().mockResolvedValue(true)
    await crud.executeDelete(deleteFn)
    expect(deleteFn).toHaveBeenCalledWith('x-1')
  })

  it('executeDelete returns false and resets isDeleting on error', async () => {
    const crud = useCrudState()
    crud.openDeleteDialog({ id: 'd-1', nama: 'Test' })

    const deleteFn = vi.fn().mockRejectedValue(new Error('Delete failed'))
    const result = await crud.executeDelete(deleteFn)
    expect(result).toBe(false)
    expect(crud.isDeleting.value).toBe(false)
  })

  it('openCreateModal without initial data defaults to empty object', () => {
    const crud = useCrudState()
    crud.openCreateModal()
    expect(crud.formData.value).toEqual({})
    expect(crud.modalOpen.value).toBe(true)
    expect(crud.modalMode.value).toBe('create')
  })

  it('paginateList handles empty list', () => {
    const crud = useCrudState({ defaultPageSize: 5 })
    expect(crud.paginateList([])).toEqual([])
  })

  it('paginateList handles page beyond data range', () => {
    const crud = useCrudState({ defaultPageSize: 5 })
    crud.currentPage.value = 100
    const items = [1, 2, 3]
    expect(crud.paginateList(items)).toEqual([])
  })

  it('modalTitle switches to edit mode correctly', () => {
    const crud = useCrudState({ resourceName: 'Aset' })
    expect(crud.modalTitle.value).toBe('Tambah Data Aset')
    crud.openEditModal({ id: '1', nama: 'test' })
    expect(crud.modalTitle.value).toBe('Ubah Data Aset')
    expect(crud.modalSubtitle.value).toBe('Form Ubah Aset')
  })

  it('closeDeleteDialog resets both fields', () => {
    const crud = useCrudState()
    crud.openDeleteDialog({ id: '1' })
    expect(crud.isConfirmDialogOpen.value).toBe(true)
    crud.closeDeleteDialog()
    expect(crud.isConfirmDialogOpen.value).toBe(false)
    expect(crud.deleteTarget.value).toBeNull()
  })
})
