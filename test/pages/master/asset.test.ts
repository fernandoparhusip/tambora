import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, computed } from 'vue'
import AssetPage from '~/pages/home/master/asset.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

// ── Mock all composables used by asset.vue ──────────────────────────────
const mockAssetApi = {
  assets: ref([
    { id: 'a1', kode_mesin: 'M001', nama_mesin: 'Mesin A', kondisi_mesin: 'Beroperasi', kode_spln: 'SPLN-1', merk_mesin: 'Caterpillar', daya_terpasang: 1000, daya_mampu_netto: 900, daya_mampu_pasok: 800, system_id: 's1', power_plant_id: 'pp1' },
    { id: 'a2', kode_mesin: 'M002', nama_mesin: 'Mesin B', kondisi_mesin: 'Standby', kode_spln: '', merk_mesin: 'Wartsila', daya_terpasang: 2000, daya_mampu_netto: 1800, daya_mampu_pasok: 1600, system_id: 's2', power_plant_id: 'pp2' },
  ]),
  loading: ref(false),
  detailLoading: ref(false),
  fetchAssets: vi.fn().mockResolvedValue([]),
  getAssetById: vi.fn().mockResolvedValue({ id: 'a1', kode_mesin: 'M001', nama_mesin: 'Mesin A' }),
  createAsset: vi.fn().mockResolvedValue({}),
  updateAsset: vi.fn().mockResolvedValue({}),
  deleteAsset: vi.fn().mockResolvedValue({}),
}
vi.mock('~/composables/master/useAsset', () => ({ useAsset: () => mockAssetApi }))

const mockSystems = ref([{ id: 's1', name: 'PLTD', code: 'PLTD' }])
vi.mock('~/composables/master/useSystem', () => ({
  useSystem: () => ({
    systems: mockSystems,
    fetchSystems: vi.fn().mockResolvedValue([]),
    loading: ref(false),
  })
}))

const mockMachineConditions = ref([{ id: 'mc1', name: 'Beroperasi' }])
vi.mock('~/composables/master/useMachineCondition', () => ({
  useMachineCondition: () => ({
    machineConditions: mockMachineConditions,
    fetchMachineConditions: vi.fn().mockResolvedValue([]),
    loading: ref(false),
  })
}))

vi.mock('~/composables/master/useSentral', () => ({
  useSentral: () => ({
    sentralList: ref([{ id: 'pp1', kode_sentral: 'S001', nama_sentral: 'Sentral A' }]),
    fetchSentral: vi.fn().mockResolvedValue([]),
    loading: ref(false),
  })
}))

vi.mock('~/composables/useAsyncDetail', () => ({
  useAsyncDetail: () => ({
    isDetailModalOpen: ref(false),
    detailRecord: ref(null),
    detailLoading: ref(false),
    handleView: vi.fn(),
    closeDetailModal: vi.fn(),
    openEditFromDetail: vi.fn(),
  })
}))

vi.mock('~/composables/useCrudState', () => ({
  useCrudState: () => ({
    searchQuery: ref(''),
    currentPage: ref(1),
    pageSize: ref(10),
    paginateList: (list: any[]) => list.slice(0, 10),
    modalOpen: ref(false),
    modalMode: ref('create'),
    formData: ref({}),
    submitting: ref(false),
    isSuccessModalOpen: ref(false),
    modalTitle: computed(() => 'Tambah Aset'),
    modalSubtitle: computed(() => 'Form Tambah'),
    openCreateModal: vi.fn(),
    openEditModal: vi.fn(),
    isConfirmDialogOpen: ref(false),
    deleteTarget: ref(null),
    isDeleting: ref(false),
    openDeleteDialog: vi.fn(),
    closeDeleteDialog: vi.fn(),
    executeDelete: vi.fn(),
  })
}))

vi.mock('~/composables/useAppToast', () => ({
  useAppToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  })
}))

vi.mock('~/schemas/master/asset.schema', () => ({
  getAssetFormSections: vi.fn(() => []),
}))

vi.mock('~/utils/formatNumber', () => ({
  formatNumber: (val: any) => String(val ?? 0),
}))

describe('Asset Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    return mount(AssetPage, {
      global: {
        stubs: pageComponentStubs,
      },
    })
  }

  it('mounts without errors', () => {
    const wrapper = createWrapper()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders page header', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.stub-header').exists()).toBe(true)
  })

  it('renders search input', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.stub-search').exists()).toBe(true)
  })

  it('renders table component', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.stub-table').exists()).toBe(true)
  })

  it('renders pagination', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.stub-pagination').exists()).toBe(true)
  })

  it('renders form modal', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.stub-form-modal').exists()).toBe(true)
  })

  it('renders confirm dialog', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.stub-confirm').exists()).toBe(true)
  })

  it('renders detail modal', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.stub-detail').exists()).toBe(true)
  })

  it('calls fetchAssets on mount', async () => {
    createWrapper()
    await flushPromises()
    expect(mockAssetApi.fetchAssets).toHaveBeenCalled()
  })

  it('interacts with create, form submit, table actions, and export', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    const createBtn = wrapper.find('.stub-create')
    if (createBtn.exists()) {
      await createBtn.trigger('click')
    }

    const submitBtn = wrapper.find('.stub-modal-submit')
    if (submitBtn.exists()) {
      await submitBtn.trigger('click')
    }

    const viewBtn = wrapper.find('.stub-table-view')
    if (viewBtn.exists()) {
      await viewBtn.trigger('click')
    }

    const editBtn = wrapper.find('.stub-table-edit')
    if (editBtn.exists()) {
      await editBtn.trigger('click')
    }

    const deleteBtn = wrapper.find('.stub-table-delete')
    if (deleteBtn.exists()) {
      await deleteBtn.trigger('click')
    }

    const confirmBtn = wrapper.find('.stub-confirm-ok')
    if (confirmBtn.exists()) {
      await confirmBtn.trigger('click')
    }

    const exportBtn = wrapper.find('.stub-export')
    if (exportBtn.exists()) {
      await exportBtn.trigger('click')
    }
  })
})
