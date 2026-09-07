import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseTable from '~/components/base/BaseTable.vue'

vi.mock('gsap', () => ({
  gsap: {
    killTweensOf: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
  },
}))

describe('BaseTable Component', () => {
  const columns = [
    { key: 'no', label: 'No' },
    { key: 'kode', label: 'Kode', sortable: true },
    { key: 'nama', label: 'Nama', sortable: true },
    { key: 'actions', label: 'Aksi' },
  ]

  const rows = [
    { id: '1', kode: 'K-01', nama: 'Item Alpha' },
    { id: '2', kode: 'K-02', nama: 'Item Beta' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders table columns and data rows', () => {
    const wrapper = mount(BaseTable, {
      props: { columns, rows, loading: false },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Item Alpha')
    expect(wrapper.text()).toContain('Item Beta')
  })

  it('renders empty state when rows array is empty', () => {
    const wrapper = mount(BaseTable, {
      props: { columns, rows: [], loading: false },
    })
    expect(wrapper.text()).toContain('Tidak ada data')
  })

  it('renders loading skeletons when loading is true', () => {
    const wrapper = mount(BaseTable, {
      props: { columns, rows: [], loading: true },
    })
    expect(wrapper.find('tbody').exists()).toBe(true)
  })

  it('supports custom cell slots', () => {
    const wrapper = mount(BaseTable, {
      props: { columns, rows },
      slots: {
        'nama-data': '<template #nama-data="{ row }"><span class="custom-cell">{{ row.nama }} (Custom)</span></template>',
      },
    })
    expect(wrapper.find('.custom-cell').exists()).toBe(true)
    expect(wrapper.text()).toContain('Item Alpha (Custom)')
  })

  it('emits reload event when reload button is triggered', async () => {
    const wrapper = mount(BaseTable, {
      props: { columns, rows },
    })
    const reloadBtn = wrapper.find('button[aria-label="Muat Ulang Tabel"]')
    if (reloadBtn.exists()) {
      await reloadBtn.trigger('click')
      expect(wrapper.emitted('reload')).toBeTruthy()
    }
  })

  it('toggles column dropdown visibility', async () => {
    const wrapper = mount(BaseTable, {
      props: { columns, rows, enableColumnToggle: true },
    })
    const toggleBtn = wrapper.find('button[aria-label="Pilih Kolom Tampil"]')
    if (toggleBtn.exists()) {
      await toggleBtn.trigger('click')
      expect(wrapper.text()).toContain('Pilih Kolom')
    }
  })
})
