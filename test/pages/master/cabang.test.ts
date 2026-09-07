import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import CabangPage from '~/pages/home/master/cabang.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/master/useCabang', () => ({
  useCabang: () => ({
    cabangList: ref([
      { id: 'c1', kode_cabang: 'CAB-01', nama_cabang: 'Cabang 1', kode_wilayah: 'REG-01' },
    ]),
    loading: ref(false),
    detailLoading: ref(false),
    fetchCabang: vi.fn().mockResolvedValue([]),
    getCabangById: vi.fn().mockResolvedValue({ id: 'c1' }),
    createCabang: vi.fn().mockResolvedValue({}),
    updateCabang: vi.fn().mockResolvedValue({}),
    deleteCabang: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/composables/master/useRegional', () => ({
  useRegional: () => ({
    regionalList: ref([{ id: 'r1', kode_wilayah: 'REG-01', nama_wilayah: 'Regional 1' }]),
    fetchRegional: vi.fn().mockResolvedValue([]),
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

vi.mock('~/schemas/master/cabang.schema', () => ({
  getCabangFormSections: vi.fn(() => []),
}))

describe('Cabang Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(CabangPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders table and header components and interacts with CRUD flows', async () => {
    const wrapper = mount(CabangPage, { global: { stubs: pageComponentStubs } })
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
