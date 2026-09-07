import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AksesLevelPage from '~/pages/home/konfigurasi-aplikasi/akses-level.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/konfigurasi-aplikasi/useAksesLevel', () => ({
  useAksesLevel: () => ({
    aksesLevels: ref([
      { id: 'al1', code: 'LVL-01', name: 'Level 1', scope_type_name: 'Global', description: 'Top level' },
    ]),
    scopeTypeOptions: ref([{ label: 'Global', value: 'g1' }]),
    loading: ref(false),
    fetchAksesLevels: vi.fn().mockResolvedValue([]),
    fetchScopeTypeCombo: vi.fn().mockResolvedValue([]),
    getAksesLevelById: vi.fn().mockResolvedValue({}),
    createAksesLevel: vi.fn().mockResolvedValue({}),
    updateAksesLevel: vi.fn().mockResolvedValue({}),
    deleteAksesLevel: vi.fn().mockResolvedValue({}),
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
vi.mock('~/schemas/konfigurasi-aplikasi/akses-level.schema', () => ({
  getAksesLevelFormSections: vi.fn(() => []),
}))

describe('Akses Level Page', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('mounts without errors', () => {
    const wrapper = mount(AksesLevelPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements and interacts with CRUD flows', async () => {
    const wrapper = mount(AksesLevelPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)

    const createBtn = wrapper.find('.stub-create')
    if (createBtn.exists()) {
      await createBtn.trigger('click')
    }

    const submitBtn = wrapper.find('.stub-modal-submit')
    if (submitBtn.exists()) {
      await submitBtn.trigger('click')
    }

    const viewBtn = wrapper.find('.stub-action-view') || wrapper.find('.stub-table-view')
    if (viewBtn.exists()) {
      await viewBtn.trigger('click')
    }

    const editBtn = wrapper.find('.stub-action-edit') || wrapper.find('.stub-table-edit')
    if (editBtn.exists()) {
      await editBtn.trigger('click')
    }

    const deleteBtn = wrapper.find('.stub-action-delete') || wrapper.find('.stub-table-delete')
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
