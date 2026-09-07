import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, computed } from 'vue'
import RegionalPage from '~/pages/home/master/regional.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

const mockRegionalApi = {
  regionalList: ref([
    { id: 'r1', kode_regional: 'REG-01', nama_regional: 'Regional Jawa', latitude: -6.2, longitude: 106.8 },
    { id: 'r2', kode_regional: 'REG-02', nama_regional: 'Regional Bali', latitude: -8.3, longitude: 115.1 },
  ]),
  loading: ref(false),
  detailLoading: ref(false),
  fetchRegional: vi.fn().mockResolvedValue([]),
  getRegionalById: vi.fn().mockResolvedValue({}),
  createRegional: vi.fn().mockResolvedValue({}),
  updateRegional: vi.fn().mockResolvedValue({}),
  deleteRegional: vi.fn().mockResolvedValue({}),
}
vi.mock('~/composables/master/useRegional', () => ({ useRegional: () => mockRegionalApi }))
vi.mock('~/composables/useAsyncDetail', () => ({
  useAsyncDetail: () => ({
    isDetailModalOpen: ref(false), detailRecord: ref(null), detailLoading: ref(false),
    handleView: vi.fn(), closeDetailModal: vi.fn(), openEditFromDetail: vi.fn(),
  })
}))
vi.mock('~/composables/useCrudState', () => ({
  useCrudState: () => ({
    searchQuery: ref(''), currentPage: ref(1), pageSize: ref(10),
    paginateList: (list: any[]) => list.slice(0, 10),
    modalOpen: ref(false), modalMode: ref('create'), formData: ref({}),
    submitting: ref(false), isSuccessModalOpen: ref(false),
    modalTitle: computed(() => 'Tambah'), modalSubtitle: computed(() => 'Form'),
    openCreateModal: vi.fn(), openEditModal: vi.fn(),
    isConfirmDialogOpen: ref(false), deleteTarget: ref(null), isDeleting: ref(false),
    openDeleteDialog: vi.fn(), closeDeleteDialog: vi.fn(), executeDelete: vi.fn(),
  })
}))
vi.mock('~/composables/useAppToast', () => ({
  useAppToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() })
}))
vi.mock('~/schemas/master/regional.schema', () => ({
  getRegionalFormSections: vi.fn(() => []),
}))

describe('Regional Page', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('mounts without errors', () => {
    const wrapper = mount(RegionalPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('calls fetchRegional on mount', async () => {
    mount(RegionalPage, { global: { stubs: pageComponentStubs } })
    await flushPromises()
    expect(mockRegionalApi.fetchRegional).toHaveBeenCalled()
  })

  it('renders main layout elements and interacts with CRUD flows', async () => {
    const wrapper = mount(RegionalPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)

    const createBtn = wrapper.find('.stub-create')
    if (createBtn.exists()) await createBtn.trigger('click')

    const submitBtn = wrapper.find('.stub-modal-submit')
    if (submitBtn.exists()) await submitBtn.trigger('click')

    const viewBtn = wrapper.find('.stub-action-view') || wrapper.find('.stub-table-view')
    if (viewBtn.exists()) await viewBtn.trigger('click')

    const editBtn = wrapper.find('.stub-action-edit') || wrapper.find('.stub-table-edit')
    if (editBtn.exists()) await editBtn.trigger('click')

    const deleteBtn = wrapper.find('.stub-action-delete') || wrapper.find('.stub-table-delete')
    if (deleteBtn.exists()) await deleteBtn.trigger('click')

    const confirmBtn = wrapper.find('.stub-confirm-ok')
    if (confirmBtn.exists()) await confirmBtn.trigger('click')

    const exportBtn = wrapper.find('.stub-export')
    if (exportBtn.exists()) await exportBtn.trigger('click')
  })
})
