import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import DriverPage from '~/pages/home/master/driver.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/master/useDriver', () => ({
  useDriver: () => ({
    drivers: ref([
      { id: 'd1', kode_driver: 'DRV-01', nama_driver: 'Driver A' },
    ]),
    loading: ref(false),
    fetchDrivers: vi.fn().mockResolvedValue([]),
    getDriverById: vi.fn().mockResolvedValue({ id: 'd1' }),
    createDriver: vi.fn().mockResolvedValue({}),
    updateDriver: vi.fn().mockResolvedValue({}),
    deleteDriver: vi.fn().mockResolvedValue({}),
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

vi.mock('~/schemas/master/driver.schema', () => ({
  driverFormSections: [],
}))

describe('Driver Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(DriverPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements and interacts with CRUD flows', async () => {
    const wrapper = mount(DriverPage, { global: { stubs: pageComponentStubs } })
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
