import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PrognosaPage from '~/pages/home/transaksi/prognosa.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/transaksi/usePrognosa', () => ({
  usePrognosa: () => ({
    list: ref([{ id: 'prog-1', bulan_tahun: '2026-08', jenis: 'PLTU', wilayah_id: 'org1' }]),
    loading: ref(false),
    fetchList: vi.fn().mockResolvedValue([]),
    createItem: vi.fn().mockResolvedValue({}),
    updateItem: vi.fn().mockResolvedValue({}),
    deleteItem: vi.fn().mockResolvedValue({}),
    exportExcel: vi.fn().mockResolvedValue(new Blob()),
  }),
}))

vi.mock('~/composables/master/useOrganization', () => ({
  useOrganization: () => ({
    organizations: ref([{ id: 'org1', nama: 'PLN UIK SBS', kode: 'UIK-SBS' }]),
    fetchOrganizations: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/schemas/transaksi/prognosa.schema', () => ({
  getPrognosaFormSections: vi.fn(() => []),
}))

describe('Prognosa Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(PrognosaPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements', () => {
    const wrapper = mount(PrognosaPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)
  })
})
