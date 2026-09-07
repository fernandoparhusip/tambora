import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import RantingPage from '~/pages/home/master/ranting.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/master/useRanting', () => ({
  useRanting: () => ({
    rantingList: ref([
      { id: 'rt1', kode_ranting: 'RNT-01', nama_ranting: 'Ranting A', kode_cabang: 'CAB-01' },
    ]),
    loading: ref(false), detailLoading: ref(false),
    fetchRanting: vi.fn().mockResolvedValue([]),
    getRantingById: vi.fn().mockResolvedValue({}),
    createRanting: vi.fn().mockResolvedValue({}),
    updateRanting: vi.fn().mockResolvedValue({}),
    deleteRanting: vi.fn().mockResolvedValue({}),
  })
}))
vi.mock('~/composables/master/useCabang', () => ({
  useCabang: () => ({
    cabangList: ref([{ id: 'c1', kode_cabang: 'CAB-01', nama_cabang: 'Cabang A' }]),
    fetchCabang: vi.fn().mockResolvedValue([]),
  })
}))
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
vi.mock('~/schemas/master/ranting.schema', () => ({
  getRantingFormSections: vi.fn(() => []),
}))

describe('Ranting Page', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('mounts without errors', () => {
    const wrapper = mount(RantingPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements and interacts with CRUD flows', async () => {
    const wrapper = mount(RantingPage, { global: { stubs: pageComponentStubs } })
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
