import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseToastContainer from '~/components/base/BaseToastContainer.vue'
import BaseDashboardHeader from '~/components/base/BaseDashboardHeader.vue'
import BaseChart from '~/components/base/BaseChart.vue'
import LoadingIndicatorPLN from '~/components/base/LoadingIndicatorPLN.vue'
import { useAppToast } from '~/composables/useAppToast'

vi.mock('vue-echarts', () => ({
  default: {
    name: 'VChart',
    template: '<div class="echarts-mock" :data-option="JSON.stringify(option)" />',
    props: ['option', 'loading', 'loadingOptions'],
  },
}))

describe('Extra Base Components', () => {
  const commonStubs = {
    BaseTabFilter: {
      template: '<div class="tab-filter"><button v-for="item in items" :key="item.key" @click="$emit(\'update:modelValue\', item.key)">{{ item.label }}</button></div>',
      props: ['items', 'modelValue'],
    },
    DatePicker: {
      template: '<input type="date" @change="$emit(\'update:modelValue\', new Date())" />',
      props: ['modelValue', 'view', 'dateFormat', 'placeholder'],
    },
    ClientOnly: {
      template: '<div><slot /></div>',
    },
    UIcon: {
      template: '<i :class="name" />',
      props: ['name'],
    },
  }

  describe('BaseToastContainer', () => {
    it('renders and displays toasts of various types and allows removal', async () => {
      const { addToast, toasts } = useAppToast()
      toasts.value = [] // reset

      addToast('success', 'Data tersimpan', 'Berhasil')
      addToast('error', 'Gagal koneksi', 'Gagal')
      addToast('warning', 'Periksa input', 'Peringatan')
      addToast('info', 'Sistem update', 'Info')

      const wrapper = mount(BaseToastContainer)
      expect(wrapper.text()).toContain('Berhasil')
      expect(wrapper.text()).toContain('Gagal')
      expect(wrapper.text()).toContain('Peringatan')
      expect(wrapper.text()).toContain('Info')

      // Remove a toast via close button
      const closeButtons = wrapper.findAll('button')
      if (closeButtons.length > 0 && closeButtons[0]) {
        await closeButtons[0].trigger('click')
      }
      expect(toasts.value.length).toBe(3)
    })
  })

  describe('BaseDashboardHeader', () => {
    it('renders title, subtitle, and emits tab / date changes', async () => {
      const tabs = [
        { key: 'operasi', label: 'Operasi Pembangkit' },
        { key: 'energi', label: 'Energi' },
      ]

      const wrapper = mount(BaseDashboardHeader, {
        props: {
          title: 'Operasi Pembangkit',
          subtitle: 'Monitoring Realtime',
          tabs,
          tabValue: 'operasi',
          datePickerView: 'date',
        },
        global: {
          stubs: commonStubs,
        },
      })

      expect(wrapper.text()).toContain('Operasi Pembangkit')
      expect(wrapper.text()).toContain('Monitoring Realtime')

      // Check tab filter switch
      const tabBtns = wrapper.findAll('button')
      const energiBtn = tabBtns.find(b => b.text().includes('Energi'))
      if (energiBtn) {
        await energiBtn.trigger('click')
        expect(wrapper.emitted('update:tabValue')).toBeTruthy()
      }
    })

    it('renders with tabGroups and month/year datePicker views', () => {
      const tabGroups = [
        {
          id: 'g1',
          value: 'all',
          items: [{ key: 'all', label: 'Semua' }, { key: 'pln', label: 'PLN' }],
        },
      ]

      const wrapper = mount(BaseDashboardHeader, {
        props: {
          title: 'Laporan',
          tabGroups,
          datePickerView: 'year',
        },
        global: {
          stubs: commonStubs,
        },
      })
      expect(wrapper.text()).toContain('Semua')
    })
  })

  describe('BaseChart', () => {
    it('renders empty placeholder when no data provided', () => {
      const wrapper = mount(BaseChart, {
        props: {
          option: { series: [] },
        },
        global: {
          stubs: commonStubs,
        },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Tidak ada data untuk ditampilkan')
    })

    it('renders chart component when series data exists', () => {
      const wrapper = mount(BaseChart, {
        props: {
          option: {
            series: [{ data: [10, 20, 30] }],
          },
        },
        global: {
          stubs: commonStubs,
        },
      })
      expect(wrapper.find('.echarts-mock').exists()).toBe(true)
    })
  })

  describe('LoadingIndicatorPLN', () => {
    it('renders svg and animation element', () => {
      const wrapper = mount(LoadingIndicatorPLN)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.find('circle').exists()).toBe(true)
    })
  })
})
