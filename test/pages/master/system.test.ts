import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SystemPage from '~/pages/home/master/system.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/master/useSystem', () => ({
  useSystem: () => ({
    systems: ref([
      { id: 's1', code: 'SYS-01', name: 'Sistem A', upk_id: 'upk1', unit_layanan_id: 'ul1' },
    ]),
    loading: ref(false),
    detailLoading: ref(false),
    fetchSystems: vi.fn().mockResolvedValue([]),
    getSystemById: vi.fn().mockResolvedValue({ id: 's1' }),
    createSystem: vi.fn().mockResolvedValue({}),
    updateSystem: vi.fn().mockResolvedValue({}),
    deleteSystem: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/composables/master/useUpk', () => ({
  useUpk: () => ({
    upks: ref([{ id: 'upk1', nama_upk: 'UPK 1' }]),
    fetchUpks: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/composables/master/useUnitLayanan', () => ({
  useUnitLayanan: () => ({
    unitLayanans: ref([{ id: 'ul1', nama_unit_layanan: 'UL 1' }]),
    fetchUnitLayanans: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/composables/useAsyncDetail', () => ({
  useAsyncDetail: () => ({
    isDetailModalOpen: ref(false),
    detailRecord: ref(null),
    detailLoading: ref(false),
    handleView: vi.fn(),
    closeDetailModal: vi.fn(),
    openEditFromDetail: vi.fn(),
  }),
}))

vi.mock('~/schemas/master/system.schema', () => ({
  getSystemFormSections: vi.fn(() => []),
}))

describe('System Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(SystemPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements and interacts with CRUD flows', async () => {
    const wrapper = mount(SystemPage, { global: { stubs: pageComponentStubs } })
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
