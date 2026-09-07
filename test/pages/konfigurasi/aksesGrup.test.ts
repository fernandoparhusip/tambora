import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AksesGrupPage from '~/pages/home/konfigurasi-aplikasi/akses-grup.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/konfigurasi-aplikasi/useAksesGrup', () => ({
  useAksesGrup: () => ({
    aksesGrups: ref([
      { id: 'ag1', role_code: 'ADMIN', role_name: 'Administrator', description: 'Admin role' },
    ]),
    loading: ref(false), detailLoading: ref(false),
    fetchAksesGrups: vi.fn().mockResolvedValue([]),
    getAksesGrupById: vi.fn().mockResolvedValue({}),
    createAksesGrup: vi.fn().mockResolvedValue({}),
    updateAksesGrup: vi.fn().mockResolvedValue({}),
    deleteAksesGrup: vi.fn().mockResolvedValue({}),
  })
}))
vi.mock('~/composables/master/usePermission', () => ({
  usePermission: () => ({
    permissions: ref([]),
    fetchPermissions: vi.fn().mockResolvedValue([]),
    loading: ref(false),
  })
}))
vi.mock('~/composables/useAsyncDetail', () => ({
  useAsyncDetail: () => ({
    isDetailModalOpen: ref(false), detailRecord: ref(null), detailLoading: ref(false),
    handleView: vi.fn(), closeDetailModal: vi.fn(), openEditFromDetail: vi.fn(),
  })
}))
vi.mock('~/composables/useAppToast', () => ({
  useAppToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() })
}))
vi.mock('~/schemas/konfigurasi-aplikasi/akses-grup.schema', () => ({
  aksesGrupFormSections: [],
}))

// Mock Lucide icons
vi.mock('@lucide/vue', () => ({
  Key: { template: '<svg />' },
  RotateCcw: { template: '<svg />' },
}))

describe('Akses Grup Page', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders layout and interacts with CRUD flows', async () => {
    const wrapper = mount(AksesGrupPage, {
      global: {
        stubs: {
          ...pageComponentStubs,
          Key: { template: '<svg />' },
          RotateCcw: { template: '<svg />' },
        },
      },
    })
    expect(wrapper.exists()).toBe(true)

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

    // Trigger View, Edit, Delete via Action Buttons
    const viewBtn = wrapper.find('.stub-action-view')
    if (viewBtn.exists()) {
      await viewBtn.trigger('click')
    }

    const editBtn = wrapper.find('.stub-action-edit')
    if (editBtn.exists()) {
      await editBtn.trigger('click')
    }

    const deleteBtn = wrapper.find('.stub-action-delete')
    if (deleteBtn.exists()) {
      await deleteBtn.trigger('click')
    }

    // Confirm Delete
    const confirmBtn = wrapper.find('.stub-confirm-ok')
    if (confirmBtn.exists()) {
      await confirmBtn.trigger('click')
    }
  })
})
