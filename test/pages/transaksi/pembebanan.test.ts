import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PembebananPage from '~/pages/home/transaksi/pembebanan.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/transaksi/usePembebanan', () => ({
  usePembebanan: () => ({
    list: ref([
      { id: 'pbm-1', tanggal: '2026-08-26 08:00', sentral_id: 's1', beban_mw: 25.5 },
    ]),
    loading: ref(false),
    fetchList: vi.fn().mockResolvedValue([]),
    createItem: vi.fn().mockResolvedValue({}),
    updateItem: vi.fn().mockResolvedValue({}),
    deleteItem: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/composables/master/useOrganization', () => ({
  useOrganization: () => ({
    organizations: ref([{ id: 'org1', nama: 'Sentral A', kode: 'SNT-01' }]),
    fetchOrganizations: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/composables/master/useAsset', () => ({
  useAsset: () => ({
    assets: ref([{ id: 'ast1', nama_mesin: 'Mesin 1', power_plant_id: 'org1' }]),
    fetchAssets: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/schemas/transaksi/pembebanan.schema', () => ({
  getPembebananFormSections: vi.fn(() => []),
}))

describe('Pembebanan Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(PembebananPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders layout elements', () => {
    const wrapper = mount(PembebananPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)
  })
})
