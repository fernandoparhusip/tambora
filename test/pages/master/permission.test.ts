import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PermissionPage from '~/pages/home/master/permission.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/master/usePermission', () => ({
  usePermission: () => ({
    permissions: ref([
      { id: 'p1', code: 'USER.CREATE', name: 'Create User', resource_code: 'USER', action_code: 'CREATE' },
    ]),
    resourcesCombo: ref([{ label: 'USER', value: 'USER' }]),
    actionsCombo: ref([{ label: 'CREATE', value: 'CREATE' }]),
    loading: ref(false),
    fetchPermissions: vi.fn().mockResolvedValue([]),
    fetchResourcesCombo: vi.fn().mockResolvedValue([]),
    fetchActionsCombo: vi.fn().mockResolvedValue([]),
    getPermissionById: vi.fn().mockResolvedValue({ id: 'p1' }),
    createPermission: vi.fn().mockResolvedValue({}),
    updatePermission: vi.fn().mockResolvedValue({}),
    deletePermission: vi.fn().mockResolvedValue({}),
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

vi.mock('~/schemas/master/permission.schema', () => ({
  getPermissionFormSections: vi.fn(() => []),
}))

describe('Permission Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(PermissionPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements and interacts with CRUD flows', async () => {
    const wrapper = mount(PermissionPage, { global: { stubs: pageComponentStubs } })
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
