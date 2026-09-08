import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import OperasiHarianPage from '~/pages/home/transaksi/operasi-harian.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

const mockList = [
  {
    id: 'oh-1',
    tanggal: '2026-08-26T00:00:00Z',
    jam: '2026-08-26T10:00:00Z',
    mesin_id: 'ast1',
    nama_mesin: '22655321411001 - PLTU Tambora 1',
    nama_sentral: 'PLTU Tambora 1',
    daya_terpasang: 100.5,
    daya_mampu_netto: 88.5,
    daya_mampu_pasok: 90,
    daya_mampu_aktual: 87,
    produksi: 85.2,
    bahan_bakar: 1200.5,
    jenis_bahan_bakar: 'BATUBARA',
  },
  {
    id: 'oh-2',
    tanggal: '2026-08-27T00:00:00Z',
    jam: '2026-08-27T14:30:00Z',
    mesin_id: 'ast2',
    nama_mesin: '22655321411002 - PLTD Sumbawa',
    nama_sentral: 'PLTD Sumbawa',
    daya_terpasang: 50,
    daya_mampu_netto: 45,
    daya_mampu_pasok: 48,
    daya_mampu_aktual: 44,
    produksi: 40,
    bahan_bakar: 500,
    jenis_bahan_bakar: 'HSD',
  },
]

const mockAssets = [
  {
    id: 'ast1',
    kode_mesin: '22655321411001',
    nama_mesin: 'PLTU Tambora 1',
    daya_terpasang: 100.5,
    daya_mampu_netto: 88.5,
    daya_mampu_pasok: 90,
    kode_bahan_bakar: 'BATUBARA',
  },
  {
    id: 'ast2',
    kode_mesin: '22655321411002',
    nama_mesin: 'PLTD Sumbawa',
    daya_terpasang: 50,
    daya_mampu_netto: 45,
    daya_mampu_pasok: 48,
    kode_bahan_bakar: 'HSD',
  },
]

const mockFetchList = vi.fn().mockResolvedValue(mockList)
const mockGetById = vi.fn().mockImplementation((id: string) =>
  Promise.resolve(mockList.find((i) => i.id === id) || mockList[0])
)
const mockCreateItem = vi.fn().mockResolvedValue({ id: 'oh-3' })
const mockUpdateItem = vi.fn().mockResolvedValue({ id: 'oh-1' })
const mockDeleteItem = vi.fn().mockResolvedValue({})
const mockFetchAssets = vi.fn().mockResolvedValue(mockAssets)

vi.mock('~/composables/transaksi/useOperasiHarian', () => ({
  useOperasiHarian: () => ({
    list: ref(mockList),
    loading: ref(false),
    fetchList: mockFetchList,
    getById: mockGetById,
    createItem: mockCreateItem,
    updateItem: mockUpdateItem,
    deleteItem: mockDeleteItem,
  }),
}))

vi.mock('~/composables/master/useAsset', () => ({
  useAsset: () => ({
    assets: ref(mockAssets),
    fetchAssets: mockFetchAssets,
  }),
}))

vi.mock('~/schemas/transaksi/operasi-harian.schema', () => ({
  getOperasiHarianFormSections: vi.fn(() => [
    { title: 'Test Section', fields: [{ key: 'tanggal', label: 'Tanggal' }] },
  ]),
}))

describe('Operasi Harian Page Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts properly and fetches initial data onMounted', async () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    await flushPromises()

    expect(wrapper.exists()).toBe(true)
    expect(mockFetchList).toHaveBeenCalled()
    expect(mockFetchAssets).toHaveBeenCalled()
  })

  it('renders table, header, search input, and create button', () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)
    expect(wrapper.find('.stub-search').exists()).toBe(true)
    expect(wrapper.find('.stub-create').exists()).toBe(true)
  })

  it('renders all required modal components with SSOT props', () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-form-modal').exists()).toBe(true)
    expect(wrapper.find('.stub-detail').exists()).toBe(true)
    expect(wrapper.find('.stub-confirm').exists()).toBe(true)
    expect(wrapper.find('.stub-success').exists()).toBe(true)
  })

  it('defines correct columns layout for UI reference', () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    const vm = wrapper.vm as any

    expect(vm.columns).toBeDefined()
    const keys = vm.columns.map((c: any) => c.key)
    expect(keys).toEqual([
      'no',
      'tanggal',
      'nama_mesin',
      'jenis_bahan_bakar',
      'produksi',
      'daya_mampu_pasok',
      'daya_mampu_netto',
      'actions',
    ])
  })

  it('handles search filtering and resets currentPage to 1', async () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    const vm = wrapper.vm as any

    vm.currentPage = 2
    expect(vm.currentPage).toBe(2)

    // Filter by machine name
    vm.searchQuery = 'Tambora'
    await flushPromises()
    expect(vm.currentPage).toBe(1)
    expect(vm.filteredList).toHaveLength(1)
    expect(vm.filteredList[0].nama_mesin).toContain('Tambora')

    // Filter by fuel type
    vm.searchQuery = 'HSD'
    await flushPromises()
    expect(vm.filteredList).toHaveLength(1)
    expect(vm.filteredList[0].jenis_bahan_bakar).toBe('HSD')

    // Filter by sentral
    vm.searchQuery = 'Sumbawa'
    await flushPromises()
    expect(vm.filteredList).toHaveLength(1)

    // Clear search returns full list
    vm.searchQuery = ''
    await flushPromises()
    expect(vm.filteredList).toHaveLength(2)
  })

  it('opens create modal with empty default values and submits payload', async () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    const vm = wrapper.vm as any

    vm.openCreateModal()
    expect(vm.modalMode).toBe('create')
    expect(vm.modalOpen).toBe(true)
    expect(vm.modalTitle).toBe('Tambah Data Operasi Harian')
    expect(vm.modalSubtitle).toBe('Form Pencatatan Operasi Harian')
    expect(vm.formData.mesin_id).toBe('')

    // Fill form and submit
    vm.formData = {
      tanggal: '2026-08-26',
      jam: '10:00',
      mesin_id: 'ast1',
      nama_sentral: 'PLTU Tambora 1',
      daya_terpasang: 100.5,
      daya_mampu_netto: 88.5,
      daya_mampu_pasok: 90,
      daya_mampu_aktual: 87,
      produksi: 85.2,
      bahan_bakar: 1200.5,
      jenis_bahan_bakar: 'BATUBARA',
    }

    await vm.handleSubmit()
    await flushPromises()

    expect(mockCreateItem).toHaveBeenCalledWith(
      expect.objectContaining({
        mesin_id: 'ast1',
        nama_sentral: 'PLTU Tambora 1',
        daya_terpasang: 100.5,
        produksi: 85.2,
        bahan_bakar: 1200.5,
        jenis_bahan_bakar: 'BATUBARA',
      })
    )
    expect(vm.modalOpen).toBe(false)
    expect(vm.isSuccessModalOpen).toBe(true)
  })

  it('opens edit modal with pre-filled row data and submits update payload', async () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    const vm = wrapper.vm as any

    vm.handleEdit(mockList[0])
    expect(vm.modalMode).toBe('edit')
    expect(vm.modalOpen).toBe(true)
    expect(vm.modalTitle).toBe('Edit Data Operasi Harian')
    expect(vm.modalSubtitle).toBe('Form Ubah Operasi Harian')
    expect(vm.formData.id).toBe('oh-1')
    expect(vm.formData.mesin_id).toBe('ast1')

    // Modify a value and submit
    vm.formData.produksi = 92.5
    await vm.handleSubmit()
    await flushPromises()

    expect(mockUpdateItem).toHaveBeenCalledWith(
      'oh-1',
      expect.objectContaining({
        produksi: 92.5,
      })
    )
    expect(vm.modalOpen).toBe(false)
    expect(vm.isSuccessModalOpen).toBe(true)
  })

  it('handles delete flow with confirmation dialog', async () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    const vm = wrapper.vm as any

    vm.handleDelete(mockList[0])
    expect(vm.isConfirmDialogOpen).toBe(true)
    expect(vm.deleteTarget).toEqual(mockList[0])

    await vm.handleConfirmDelete()
    await flushPromises()

    expect(mockDeleteItem).toHaveBeenCalledWith('oh-1')
    expect(vm.isConfirmDialogOpen).toBe(false)
    expect(vm.deleteTarget).toBeNull()
  })

  it('handles view detail flow via useAsyncDetail and transitions to edit', async () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    const vm = wrapper.vm as any

    await vm.handleView(mockList[0])
    await flushPromises()

    expect(vm.isDetailModalOpen).toBe(true)
    expect(vm.detailRecord).toBeDefined()
    expect(mockGetById).toHaveBeenCalledWith('oh-1')

    // Transition from detail modal to edit modal
    vm.openEditFromDetail()
    expect(vm.isDetailModalOpen).toBe(false)
    expect(vm.modalOpen).toBe(true)
    expect(vm.modalMode).toBe('edit')
  })

  it('auto-fills technical parameters when mesin_id changes', async () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    const vm = wrapper.vm as any

    vm.formData = {
      tanggal: '2026-08-26',
      jam: '08:00',
      mesin_id: '',
      daya_terpasang: null,
      daya_mampu_netto: null,
      daya_mampu_pasok: null,
      jenis_bahan_bakar: '',
    }

    // Select asset 1
    vm.formData.mesin_id = 'ast1'
    await flushPromises()

    expect(vm.formData.daya_terpasang).toBe(100.5)
    expect(vm.formData.daya_mampu_netto).toBe(88.5)
    expect(vm.formData.daya_mampu_pasok).toBe(90)
    expect(vm.formData.jenis_bahan_bakar).toBe('BATUBARA')
  })

  it('computes mesinOptions from assets reactive store', () => {
    const wrapper = mount(OperasiHarianPage, { global: { stubs: pageComponentStubs } })
    const vm = wrapper.vm as any

    expect(vm.mesinOptions).toEqual([
      { label: '22655321411001 - PLTU Tambora 1', value: 'ast1' },
      { label: '22655321411002 - PLTD Sumbawa', value: 'ast2' },
    ])
  })
})
