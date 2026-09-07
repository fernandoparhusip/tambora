import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import NKOPage from '~/pages/home/transaksi/nko.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/transaksi/useNKO', () => ({
  useNKO: () => ({
    list: ref([
      { id: 'nko-1', bulan_tahun: '2026-08', indikator_nama: 'EFOR', polaritas: 'Negatif', bobot: 20 },
    ]),
    loading: ref(false),
    fetchList: vi.fn().mockResolvedValue([]),
    createBatch: vi.fn().mockResolvedValue({}),
    updateItem: vi.fn().mockResolvedValue({}),
    deleteItem: vi.fn().mockResolvedValue({}),
    exportExcel: vi.fn().mockResolvedValue(new Blob()),
  }),
}))

vi.mock('~/schemas/transaksi/nko.schema', () => ({
  getNKOFormSections: vi.fn(() => []),
}))

describe('NKO Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(NKOPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders table and header components', () => {
    const wrapper = mount(NKOPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)
  })
})
