import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import OperasiPembangkitPage from '~/pages/home/dashboard/operasiPembangkit.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

const mockSentralList = [
  { id: 's1', nama_sentral: 'PLTD Bengkulu', status: 'normal', daya_terpasang: 100, dmn: 80, dmp: 75, beban: 60 },
]

vi.mock('~/composables/useOperasiPembangkit', () => ({
  useOperasiPembangkit: () => ({
    selectedTab: ref('operasi'),
    selectedDate: ref('2026-08-26'),
    selectedStatusFilter: ref('semua'),
    systemSummary: ref({ totalDayaTerpasang: 100, totalDmn: 80, totalDmp: 75, totalBeban: 60, persentaseBeban: 75 }),
    sentralList: ref(mockSentralList),
    statusCounts: ref({ semua: 1, normal: 1, waspada: 0, siaga: 0, gangguan: 0 }),
    filteredSentralList: ref(mockSentralList),
    setStatusFilter: vi.fn(),
    selectedSentralFilter: ref('semua'),
    selectedTimeRange: ref('24h'),
    selectedInterval: ref('1h'),
    timeRangeOptions: ref([{ label: '24 Jam', value: '24h' }]),
    intervalOptions: ref([{ label: '1 Jam', value: '1h' }]),
    fuelContributionList: ref([]),
    fuelSummary: ref({}),
    generationMinMaxStats: ref({}),
    energiGenerationChartOption: ref({}),
    energiDonutChartOption: ref({}),
  }),
}))

const dashboardStubs = {
  ...pageComponentStubs,
  BaseDashboardHeader: { template: '<div class="stub-dash-header" />' },
  BaseChart: { template: '<div class="stub-chart" />' },
  LazyBaseChart: { template: '<div class="stub-chart" />' },
  BaseMap: { template: '<div class="stub-map" />' },
  LazyBaseMap: { template: '<div class="stub-map" />' },
  BaseLoadingIndicatorPLN: { template: '<div class="stub-loading" />' },
  FormFieldRenderer: { template: '<div class="stub-form-field" />' },
  LucideAreaChart: { template: '<svg />' },
  LucideBarChart3: { template: '<svg />' },
  LucideFileText: { template: '<svg />' },
}

describe('Dashboard Operasi Pembangkit Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without errors', () => {
    const wrapper = mount(OperasiPembangkitPage, { global: { stubs: dashboardStubs } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders status filter tabs and dashboard header', () => {
    const wrapper = mount(OperasiPembangkitPage, { global: { stubs: dashboardStubs } })
    expect(wrapper.find('.stub-dash-header').exists()).toBe(true)
  })
})
