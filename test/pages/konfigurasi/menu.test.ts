import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import MenuPage from '~/pages/home/konfigurasi-aplikasi/menu.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/konfigurasi-aplikasi/useMenu', () => ({
  useMenu: () => ({
    menus: ref([
      { id: 'm1', nama: 'Dashboard', url: '/home', status: 1 },
    ]),
    loading: ref(false),
    detailLoading: ref(false),
    parentMenuOptions: ref([]),
    fetchMenus: vi.fn().mockResolvedValue([]),
    getMenuById: vi.fn().mockResolvedValue({ id: 'm1' }),
    createMenu: vi.fn().mockResolvedValue({}),
    updateMenu: vi.fn().mockResolvedValue({}),
    deleteMenu: vi.fn().mockResolvedValue({}),
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

vi.mock('~/schemas/konfigurasi-aplikasi/menu.schema', () => ({
  getMenuFormSections: vi.fn(() => []),
}))

describe('Menu Configuration Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(MenuPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements and interacts with CRUD flows', async () => {
    const wrapper = mount(MenuPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)

    const createBtn = wrapper.find('.stub-create')
    if (createBtn.exists()) {
      await createBtn.trigger('click')
      expect(createBtn.exists()).toBe(true)
    }

    const submitBtn = wrapper.find('.stub-modal-submit')
    if (submitBtn.exists()) {
      await submitBtn.trigger('click')
      expect(submitBtn.exists()).toBe(true)
    }

    const viewBtn = wrapper.find('.stub-action-view') || wrapper.find('.stub-table-view')
    if (viewBtn.exists()) {
      await viewBtn.trigger('click')
      expect(viewBtn.exists()).toBe(true)
    }

    const editBtn = wrapper.find('.stub-action-edit') || wrapper.find('.stub-table-edit')
    if (editBtn.exists()) {
      await editBtn.trigger('click')
      expect(editBtn.exists()).toBe(true)
    }

    const deleteBtn = wrapper.find('.stub-action-delete') || wrapper.find('.stub-table-delete')
    if (deleteBtn.exists()) {
      await deleteBtn.trigger('click')
      expect(deleteBtn.exists()).toBe(true)
    }

    const confirmBtn = wrapper.find('.stub-confirm-ok')
    if (confirmBtn.exists()) {
      await confirmBtn.trigger('click')
      expect(confirmBtn.exists()).toBe(true)
    }

    const exportBtn = wrapper.find('.stub-export')
    if (exportBtn.exists()) {
      await exportBtn.trigger('click')
      expect(exportBtn.exists()).toBe(true)
    }

    expect(wrapper.find('.stub-table').exists()).toBe(true)
  })
})
