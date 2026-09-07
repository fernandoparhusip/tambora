import { describe, it, expect, vi } from 'vitest'
import { useCrudState } from '~/composables/useCrudState'

describe('useCrudState Composable', () => {
  it('initializes with default values', () => {
    const crud = useCrudState({ resourceName: 'Organisasi' })
    expect(crud.searchQuery.value).toBe('')
    expect(crud.currentPage.value).toBe(1)
    expect(crud.pageSize.value).toBe(10)
    expect(crud.modalOpen.value).toBe(false)
    expect(crud.modalMode.value).toBe('create')
    expect(crud.modalTitle.value).toBe('Tambah Data Organisasi')
    expect(crud.modalSubtitle.value).toBe('Form Tambah Organisasi')
  })

  it('resets currentPage when searchQuery changes', async () => {
    const crud = useCrudState()
    crud.currentPage.value = 5
    crud.searchQuery.value = 'abc'
    // watch triggers synchronously in Vue reactivity effect or on tick
    await Promise.resolve()
    expect(crud.currentPage.value).toBe(1)
  })

  it('handles openCreateModal and openEditModal correctly', () => {
    const crud = useCrudState({ resourceName: 'Regional' })
    
    crud.openCreateModal({ kode: 'REG-1' })
    expect(crud.modalMode.value).toBe('create')
    expect(crud.formData.value).toEqual({ kode: 'REG-1' })
    expect(crud.modalOpen.value).toBe(true)
    expect(crud.modalTitle.value).toBe('Tambah Data Regional')

    crud.openEditModal({ id: '123', nama: 'Regional Maluku' })
    expect(crud.modalMode.value).toBe('edit')
    expect(crud.formData.value.id).toBe('123')
    expect(crud.formData.value.nama).toBe('Regional Maluku')
    expect(crud.modalTitle.value).toBe('Ubah Data Regional')
    expect(crud.modalSubtitle.value).toBe('Form Ubah Regional')
  })

  it('handles openDeleteDialog and closeDeleteDialog', () => {
    const crud = useCrudState<any>()
    const row = { id: 'item-1', nama: 'PLN Sentral A' }

    crud.openDeleteDialog(row)
    expect(crud.isConfirmDialogOpen.value).toBe(true)
    expect(crud.deleteTarget.value).toEqual(row)

    crud.closeDeleteDialog()
    expect(crud.isConfirmDialogOpen.value).toBe(false)
    expect(crud.deleteTarget.value).toBeNull()
  })

  it('paginates list correctly', () => {
    const crud = useCrudState({ defaultPageSize: 2 })
    const items = [1, 2, 3, 4, 5]

    expect(crud.paginateList(items)).toEqual([1, 2])

    crud.currentPage.value = 2
    expect(crud.paginateList(items)).toEqual([3, 4])

    crud.currentPage.value = 3
    expect(crud.paginateList(items)).toEqual([5])
  })

  it('executes delete action successfully', async () => {
    const crud = useCrudState({ resourceName: 'Unit' })
    const row = { id: 'u1', nama: 'Unit 1' }
    crud.openDeleteDialog(row)

    const deleteFn = vi.fn().mockResolvedValue(true)
    const success = await crud.executeDelete(deleteFn)

    expect(success).toBe(true)
    expect(deleteFn).toHaveBeenCalledWith('u1')
    expect(crud.isConfirmDialogOpen.value).toBe(false)
    expect(crud.deleteTarget.value).toBeNull()
  })
})
