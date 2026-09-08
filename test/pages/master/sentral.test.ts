import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import SentralPage from '~/pages/home/master/sentral.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/master/useSentral', () => ({
  useSentral: () => ({
    sentralList: ref([
      { id: 'st1', kode_sentral: 'S001', nama_sentral: 'Sentral A', kode_wilayah: 'REG-01', kode_jenis_pembangkit: 'PLTD', daya_terpasang: 1000, approve_status: 'approved' },
    ]),
    loading: ref(false), detailLoading: ref(false),
    fetchSentral: vi.fn().mockResolvedValue([]),
    getSentralById: vi.fn().mockResolvedValue({}),
    createSentral: vi.fn().mockResolvedValue({}),
    updateSentral: vi.fn().mockResolvedValue({}),
    deleteSentral: vi.fn().mockResolvedValue({}),
    approveSentral: vi.fn().mockResolvedValue({}),
  })
}))
vi.mock('~/composables/master/useSystem', () => ({
  useSystem: () => ({
    systems: ref([{ id: 's1', code: 'PLTD', name: 'PLTD' }]),
    fetchSystems: vi.fn().mockResolvedValue([]),
  })
}))
vi.mock('~/composables/useRbac', () => ({
  useRbac: () => ({ can: vi.fn(() => true), isSuperAdmin: ref(true) })
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
vi.mock('~/schemas/master/sentral.schema', () => ({
  getSentralFormSections: vi.fn(() => []),
}))

describe('Sentral Page', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('mounts without errors', () => {
    const wrapper = mount(SentralPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements and interacts with CRUD and export flows', async () => {
    const wrapper = mount(SentralPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-table').exists()).toBe(true)

    // Trigger Create Modal
    const createBtn = wrapper.find('.stub-create')
    if (createBtn.exists()) {
      await createBtn.trigger('click')
    }

    // Submit form modal
    const submitBtn = wrapper.find('.stub-modal-submit')
    if (submitBtn.exists()) {
      await submitBtn.trigger('click')
    }

    // Trigger Table Actions (View, Edit, Delete)
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

    // Confirm Delete
    const confirmBtn = wrapper.find('.stub-confirm-ok')
    if (confirmBtn.exists()) {
      await confirmBtn.trigger('click')
    }

    // Trigger Export Button
    const exportBtn = wrapper.find('.stub-export')
    if (exportBtn.exists()) {
      await exportBtn.trigger('click')
    }
  })
})
