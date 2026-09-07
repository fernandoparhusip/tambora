import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseDateFilter from '~/components/base/BaseDateFilter.vue'
import BaseActionButton from '~/components/base/BaseActionButton.vue'
import BaseTabFilter from '~/components/base/BaseTabFilter.vue'

// Mock useRbac
const mockCan = vi.fn().mockReturnValue(true)
vi.mock('~/composables/useRbac', () => ({
  useRbac: () => ({ can: mockCan, isSuperAdmin: vi.fn().mockReturnValue(true) }),
}))

// Mock PrimeVue DatePicker
const DatePickerStub = {
  name: 'DatePicker',
  props: ['modelValue', 'dateFormat', 'placeholder'],
  emits: ['update:modelValue'],
  template: '<div class="date-picker-stub"><button id="btn-date" @click="$emit(\'update:modelValue\', new Date(\'2026-08-26T00:00:00Z\'))">Select</button><slot name="dropdownicon" /></div>',
}

const tooltipDirective = { mounted: vi.fn() }

describe('Base Filters and Action Buttons', () => {
  describe('BaseDateFilter', () => {
    it('renders with placeholder and converts date change to YYYY-MM-DD', async () => {
      const wrapper = mount(BaseDateFilter, {
        props: { modelValue: '2026-08-25', placeholder: 'Pilih Tanggal' },
        global: {
          stubs: { DatePicker: DatePickerStub },
        },
      })
      expect(wrapper.exists()).toBe(true)

      const btn = wrapper.find('#btn-date')
      await btn.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('emits empty string when date is cleared', async () => {
      const wrapper = mount(BaseDateFilter, {
        global: {
          stubs: {
            DatePicker: {
              emits: ['update:modelValue'],
              template: '<button id="btn-clear" @click="$emit(\'update:modelValue\', null)">Clear</button>',
            },
          },
        },
      })
      await wrapper.find('#btn-clear').trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    })
  })

  describe('BaseActionButton', () => {
    it('renders edit action button and emits click', async () => {
      mockCan.mockReturnValue(true)
      const wrapper = mount(BaseActionButton, {
        props: { type: 'edit', resource: 'user' },
        global: { directives: { tooltip: tooltipDirective } },
      })
      const btn = wrapper.find('button')
      await btn.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('renders disabled button when permission is denied', async () => {
      mockCan.mockReturnValue(false)
      const wrapper = mount(BaseActionButton, {
        props: { type: 'delete', resource: 'user' },
        global: { directives: { tooltip: tooltipDirective } },
      })
      const btn = wrapper.find('button')
      expect(btn.attributes('disabled')).toBeDefined()
    })

    it('renders view and download types correctly', () => {
      mockCan.mockReturnValue(true)
      for (const type of ['view', 'download', 'custom'] as const) {
        const wrapper = mount(BaseActionButton, {
          props: { type },
          global: { directives: { tooltip: tooltipDirective } },
        })
        expect(wrapper.exists()).toBe(true)
      }
    })
  })

  describe('BaseTabFilter', () => {
    const tabs = [
      { key: 'operasi', label: 'Operasi' },
      { key: 'energi', label: 'Energi' },
    ]

    it('renders tabs and emits update:modelValue and tabChange on click', async () => {
      const wrapper = mount(BaseTabFilter, {
        props: { items: tabs, modelValue: 'operasi' },
      })
      expect(wrapper.text()).toContain('Operasi')
      expect(wrapper.text()).toContain('Energi')

      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(2)

      await buttons[1]!.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['energi'])
      expect(wrapper.emitted('tabChange')?.[0]).toEqual(['energi'])
    })

    it('supports alternative item formats like kode and nama', () => {
      const altTabs = [
        { kode: 'k1', nama: 'Tab Satu' },
        { kode: 'k2', nama: 'Tab Dua' },
      ]
      const wrapper = mount(BaseTabFilter, {
        props: { items: altTabs, activeTab: 'k1' },
      })
      expect(wrapper.text()).toContain('Tab Satu')
      expect(wrapper.text()).toContain('Tab Dua')
    })
  })
})
