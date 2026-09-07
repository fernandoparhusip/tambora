import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PaguPage from '~/pages/home/transaksi/pagu.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/transaksi/usePagu', () => ({
  usePagu: () => ({
    list: ref([{ id: 'pagu-1', jenis_pagu: 'AO_AKO', periode: 2026, scope: 'Unit Induk' }]),
    loading: ref(false),
    fetchList: vi.fn().mockResolvedValue([]),
    createItem: vi.fn().mockResolvedValue({}),
    updateItem: vi.fn().mockResolvedValue({}),
    deleteItem: vi.fn().mockResolvedValue({}),
    reviseItem: vi.fn().mockResolvedValue({}),
    exportExcel: vi.fn().mockResolvedValue(new Blob()),
  }),
}))

vi.mock('~/composables/transaksi/usePaguBidang', () => ({
  usePaguBidang: () => ({
    list: ref([{ id: 'pb-1', pagu_unit_id: 'pagu-1', periode: 2026 }]),
    loading: ref(false),
    fetchList: vi.fn().mockResolvedValue([]),
    createItem: vi.fn().mockResolvedValue({}),
    updateItem: vi.fn().mockResolvedValue({}),
    deleteItem: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/schemas/transaksi/pagu.schema', () => ({
  getPaguFormSections: vi.fn(() => []),
}))

vi.mock('~/schemas/transaksi/pagu-bidang.schema', () => ({
  getPaguBidangFormSections: vi.fn(() => []),
}))

describe('Pagu Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(PaguPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders tab filter and table components', () => {
    const wrapper = mount(PaguPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)
  })
})
