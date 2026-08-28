import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOperasiHarian } from '~/composables/transaksi/useOperasiHarian'
import { usePemakaianBahanBakar } from '~/composables/transaksi/usePemakaianBahanBakar'
import { usePembebanan } from '~/composables/transaksi/usePembebanan'
import { usePagu } from '~/composables/transaksi/usePagu'
import { usePaguBidang } from '~/composables/transaksi/usePaguBidang'
import { usePrognosa } from '~/composables/transaksi/usePrognosa'
import { useNKO } from '~/composables/transaksi/useNKO'

// Mock useApi composable
const mockApi = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi
}))

describe('Transaksi Composables Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. useOperasiHarian
  describe('useOperasiHarian', () => {
    it('fetchList retrieves and sets operasi harian list', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 'oh-1',
            tanggal: '2026-08-26T00:00:00Z',
            jam: '2026-08-26T10:00:00Z',
            sentral_id: 's-1',
            nama_sentral: 'PLTU Tambora 1',
            mesin_id: 'm-1',
            daya_terpasang: 100,
            daya_mampu_netto: 88,
            daya_mampu_pasok: 90,
            daya_mampu_aktual: 87,
            produksi: 85,
            bahan_bakar: 1200,
            jenis_bahan_bakar: 'BATUBARA'
          }
        ],
        meta: { total: 1 }
      })

      const { fetchList, list, total } = useOperasiHarian()
      const res = await fetchList()

      expect(res).toHaveLength(1)
      expect(list.value[0]?.nama_sentral).toBe('PLTU Tambora 1')
      expect(total.value).toBe(1)
      expect(mockApi).toHaveBeenCalledWith('/operasi-harian', expect.any(Object))
    })

    it('createItem sends post request and refetches list', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'oh-2' } })
        .mockResolvedValueOnce({ data: [] })

      const { createItem } = useOperasiHarian()
      await createItem({
        tanggal: '2026-08-26T00:00:00Z',
        jam: '2026-08-26T10:00:00Z',
        sentral_id: 's-1',
        nama_sentral: 'PLTU Tambora 1',
        mesin_id: 'm-1',
        daya_terpasang: 100,
        daya_mampu_netto: 88,
        daya_mampu_pasok: 90,
        daya_mampu_aktual: 87,
        produksi: 85,
        bahan_bakar: 1200,
        jenis_bahan_bakar: 'BATUBARA'
      })

      expect(mockApi).toHaveBeenCalledWith('/operasi-harian', {
        method: 'POST',
        body: expect.objectContaining({ nama_sentral: 'PLTU Tambora 1' })
      })
    })
  })

  // 2. usePemakaianBahanBakar
  describe('usePemakaianBahanBakar', () => {
    it('fetchList retrieves fuel consumption records', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 'bb-1',
            tanggal: '2026-08-26T00:00:00Z',
            sentral_id: 's-1',
            mesin_id: 'm-1',
            jenis_bahan_bakar: 'BATUBARA',
            pemakaian: 1500,
            satuan: 'Ton',
            sisa_stok: 8500
          }
        ],
        meta: { total: 1 }
      })

      const { fetchList, list } = usePemakaianBahanBakar()
      await fetchList()

      expect(list.value).toHaveLength(1)
      expect(list.value[0]?.pemakaian).toBe(1500)
      expect(mockApi).toHaveBeenCalledWith('/pemakaian-bahan-bakar', expect.any(Object))
    })
  })

  // 3. usePembebanan
  describe('usePembebanan', () => {
    it('fetchList and deleteItem call appropriate endpoints', async () => {
      mockApi.mockResolvedValueOnce({
        data: [{ id: 'pb-1', beban_mw: 25.5, frekuensi_hz: 50.0 }],
        meta: { total: 1 }
      })

      const { fetchList, list } = usePembebanan()
      await fetchList()
      expect(list.value[0]?.beban_mw).toBe(25.5)

      mockApi
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] })

      const { deleteItem } = usePembebanan()
      await deleteItem('pb-1')
      expect(mockApi).toHaveBeenCalledWith('/pembebanan/pb-1/delete', { method: 'POST' })
    })
  })

  // 4. usePagu
  describe('usePagu', () => {
    it('reviseItem calls revise endpoint', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'pagu-1', revisi_ke: 1 } })
        .mockResolvedValueOnce({ data: [] })

      const { reviseItem } = usePagu()
      await reviseItem('pagu-1', {
        jenis_pagu: 'AO_AKO',
        periode: 2026,
        scope: 'Unit',
        tanggal_input: '2026-04-27T00:00:00Z',
        detail_ao_ako: []
      })

      expect(mockApi).toHaveBeenCalledWith('/pagu/pagu-1/revise', {
        method: 'POST',
        body: expect.any(Object)
      })
    })
  })

  // 5. usePaguBidang
  describe('usePaguBidang', () => {
    it('fetchList retrieves pagu bidang allocations', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 'pb-1',
            pagu_unit_id: 'pu-1',
            periode: 2026,
            details: [{ uraian: 'Ophar', ao: 500000000, ako: 450000000, persentase: 50 }]
          }
        ],
        meta: { total: 1 }
      })

      const { fetchList, list } = usePaguBidang()
      await fetchList()

      expect(list.value).toHaveLength(1)
      expect(list.value[0]?.details).toHaveLength(1)
      expect(mockApi).toHaveBeenCalledWith('/pagu-bidang', expect.any(Object))
    })
  })

  // 6. usePrognosa
  describe('usePrognosa', () => {
    it('createItem posts prognosa payload and updates list', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'prog-1', jenis: 'PLTU' } })
        .mockResolvedValueOnce({ data: [] })

      const { createItem } = usePrognosa()
      await createItem({
        wilayah_id: 'w-1',
        ulpl_id: 'u-1',
        bulan_tahun: '2026-06-01T00:00:00Z',
        jenis: 'PLTU',
        keterangan_nilai: 'Prognosa',
        status: 'Draft',
        mesin_list: []
      })

      expect(mockApi).toHaveBeenCalledWith('/prognosa', {
        method: 'POST',
        body: expect.objectContaining({ jenis: 'PLTU' })
      })
    })
  })

  // 7. useNKO
  describe('useNKO', () => {
    it('createBatch sends batch NKO payload', async () => {
      mockApi
        .mockResolvedValueOnce({ data: [{ id: 'nko-1' }] })
        .mockResolvedValueOnce({ data: [] })

      const { createBatch } = useNKO()
      await createBatch({
        bulan_tahun: '2026-06-01T00:00:00Z',
        items: [
          {
            indikator_nama: 'ERT',
            polaritas: 'Negatif',
            satuan: 'Jam',
            bobot: 8,
            target_bulanan: 3,
            realisasi: 3,
            status: 'Baik'
          }
        ]
      })

      expect(mockApi).toHaveBeenCalledWith('/nko', {
        method: 'POST',
        body: expect.objectContaining({ bulan_tahun: '2026-06-01T00:00:00Z' })
      })
    })
  })
})
