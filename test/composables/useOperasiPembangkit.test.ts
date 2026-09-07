import { describe, it, expect } from 'vitest'
import { useOperasiPembangkit } from '~/composables/useOperasiPembangkit'

describe('useOperasiPembangkit', () => {
  it('initializes with default values and filters sentral list', () => {
    const composable = useOperasiPembangkit()

    expect(composable.selectedTab.value).toBe('operasi')
    expect(composable.selectedStatusFilter.value).toBe('semua')
    expect(composable.systemSummary.value.title).toBe('Sistem Tambora')
    expect(composable.sentralList.value.length).toBeGreaterThan(0)

    // Check status counts
    const counts = composable.statusCounts.value
    expect(counts).toHaveProperty('semua')
    expect(counts).toHaveProperty('operasi')
    expect(counts).toHaveProperty('gangguan')

    // Filter by 'operasi'
    composable.setStatusFilter('operasi')
    expect(composable.selectedStatusFilter.value).toBe('operasi')
    expect(composable.filteredSentralList.value.every(s => s.status === 'operasi')).toBe(true)

    // Filter by 'gangguan'
    composable.setStatusFilter('gangguan')
    expect(composable.selectedStatusFilter.value).toBe('gangguan')
    expect(composable.filteredSentralList.value.every(s => s.status === 'gangguan')).toBe(true)

    // Reset filter
    composable.setStatusFilter('semua')
    expect(composable.filteredSentralList.value.length).toBe(composable.sentralList.value.length)
  })

  it('provides options and computed chart options for energy tab', () => {
    const composable = useOperasiPembangkit()

    expect(composable.timeRangeOptions).toContain('1D')
    expect(composable.intervalOptions).toContain('5m')
    expect(composable.fuelContributionList.value.length).toBe(4)
    expect(composable.fuelSummary.value.net).toBe(10000)
    expect(composable.generationMinMaxStats.value.length).toBeGreaterThan(0)

    // Generation chart option
    const genChart = composable.energiGenerationChartOption.value
    expect(genChart).toHaveProperty('tooltip')
    expect(genChart).toHaveProperty('series')
    expect(genChart.series.length).toBeGreaterThan(0)

    // Donut chart option
    const donutChart = composable.energiDonutChartOption.value
    expect(donutChart).toHaveProperty('tooltip')
    expect(donutChart).toHaveProperty('series')
    expect((donutChart.series as any)?.[0]?.data?.length).toBe(4)
  })
})
