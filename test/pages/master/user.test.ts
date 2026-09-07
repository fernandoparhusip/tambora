import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import UserPage from '~/pages/home/master/user.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/master/useUser', () => ({
  useUser: () => ({
    users: ref([
      { id: 'u1', email: 'user@pln.co.id', nama: 'User Satu', nip: '12345', status: 1 },
    ]),
    loading: ref(false),
    fetchUsers: vi.fn().mockResolvedValue([]),
    getUserById: vi.fn().mockResolvedValue({ id: 'u1' }),
    createUser: vi.fn().mockResolvedValue({}),
    updateUser: vi.fn().mockResolvedValue({}),
    deleteUser: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/composables/master/useRole', () => ({
  useRole: () => ({
    roles: ref([{ id: 'r1', name: 'Admin' }]),
    fetchRoles: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/composables/master/useScope', () => ({
  useScope: () => ({
    scopes: ref([{ id: 's1', name: 'Pusat' }]),
    fetchScopes: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/composables/master/useOrganization', () => ({
  useOrganization: () => ({
    organizations: ref([{ id: 'o1', nama: 'PLN Pusat' }]),
    fetchOrganizations: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/composables/master/usePermission', () => ({
  usePermission: () => ({
    permissions: ref([]),
    fetchPermissions: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/schemas/master/user.schema', () => ({
  getUserFormSections: vi.fn(() => []),
  userValidationSchema: {
    safeParse: vi.fn(() => ({ success: true, data: {} })),
  },
}))

describe('User Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(UserPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements and interacts with create, view, edit, delete, and export', async () => {
    const wrapper = mount(UserPage, { global: { stubs: pageComponentStubs } })
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

    // Trigger View, Edit, Delete on Table
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
