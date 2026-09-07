import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PemakaianBahanBakarPage from '~/pages/home/transaksi/pemakaian-bahan-bakar.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/transaksi/usePemakaianBahanBakar', () => ({
  usePemakaianBahanBakar: () => ({
    list: ref([
      { id: 'pbb-1', tanggal: '2026-08-26', sentral_id: 's1', nama_sentral: 'Sentral 1', pemakaian: 1000 },
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

vi.mock('~/schemas/transaksi/pemakaian-bahan-bakar.schema', () => ({
  getPemakaianBahanBakarFormSections: vi.fn(() => []),
}))

describe('Pemakaian Bahan Bakar Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(PemakaianBahanBakarPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders table and header components', () => {
    const wrapper = mount(PemakaianBahanBakarPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)
  })
})
