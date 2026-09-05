import { describe, it, expect, vi } from 'vitest'
import { useAsyncDetail } from '~/composables/useAsyncDetail'

describe('useAsyncDetail Composable', () => {
  interface DummyItem {
    id: string
    name: string
    detailExtra?: string
  }

  it('buka modal seketika (0ms) dengan data optimistic dari baris tabel', () => {
    const { isDetailModalOpen, detailRecord, handleView } = useAsyncDetail<DummyItem>()

    handleView({ id: '1', name: 'Item Satu' })

    expect(isDetailModalOpen.value).toBe(true)
    expect(detailRecord.value).toEqual({ id: '1', name: 'Item Satu' })
  })

  it('mengabaikan respon lama jika terjadi race condition (Request 1 lebih lambat dari Request 2)', async () => {
    let resolveReq1: (val: any) => void = () => {}
    let resolveReq2: (val: any) => void = () => {}

    const fetchDetail = vi.fn().mockImplementation((id: string) => {
      if (id === '1') {
        return new Promise((resolve) => {
          resolveReq1 = resolve
        })
      }
      return new Promise((resolve) => {
        resolveReq2 = resolve
      })
    })

    const { detailRecord, handleView } = useAsyncDetail<DummyItem>({ fetchDetail })

    // 1. User buka Item 1
    handleView({ id: '1', name: 'Item Satu' })
    expect(detailRecord.value?.name).toBe('Item Satu')

    // 2. User cepat-cepat beralih ke Item 2 sebelum Item 1 selesai
    handleView({ id: '2', name: 'Item Dua' })
    expect(detailRecord.value?.name).toBe('Item Dua')

    // 3. Respon Item 2 selesai duluan
    resolveReq2({ id: '2', name: 'Item Dua Fresh', detailExtra: 'Extra 2' })
    await Promise.resolve()
    expect(detailRecord.value?.detailExtra).toBe('Extra 2')

    // 4. Respon Item 1 baru selesai belakangan (Stale)
    resolveReq1({ id: '1', name: 'Item Satu Fresh', detailExtra: 'Extra 1' })
    await Promise.resolve()

    // 5. Verifikasi: Data di layar TIDAK ter-overwrite oleh Item 1!
    expect(detailRecord.value?.id).toBe('2')
    expect(detailRecord.value?.name).toBe('Item Dua Fresh')
    expect(detailRecord.value?.detailExtra).toBe('Extra 2')
  })

  it('mengabaikan respon jika modal sudah ditutup sebelum respon sampai', async () => {
    let resolveReq: (val: any) => void = () => {}
    const fetchDetail = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        resolveReq = resolve
      })
    })

    const { detailRecord, isDetailModalOpen, handleView, closeDetailModal } = useAsyncDetail<DummyItem>({
      fetchDetail
    })

    handleView({ id: '1', name: 'Item Satu' })
    expect(isDetailModalOpen.value).toBe(true)

    // User menutup modal sebelum fetch selesai
    closeDetailModal()
    expect(isDetailModalOpen.value).toBe(false)
    expect(detailRecord.value).toBeNull()

    // Respon server tiba belakangan
    resolveReq({ id: '1', name: 'Item Satu Fresh' })
    await Promise.resolve()

    // Verifikasi: detailRecord tetap null dan tidak hidup kembali di background
    expect(detailRecord.value).toBeNull()
    expect(isDetailModalOpen.value).toBe(false)
  })

  it('mengamankan snapshot data saat tombol Ubah Data diklik', () => {
    const onEdit = vi.fn()
    const { detailRecord, isDetailModalOpen, handleView, openEditFromDetail } = useAsyncDetail<DummyItem>({
      onEdit
    })

    handleView({ id: '1', name: 'Item Satu' })
    expect(isDetailModalOpen.value).toBe(true)

    // Klik Ubah Data
    openEditFromDetail()

    // Modal detail tertutup, data diteruskan dengan aman ke callback edit
    expect(isDetailModalOpen.value).toBe(false)
    expect(detailRecord.value).toBeNull()
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith({ id: '1', name: 'Item Satu' })
  })
})
