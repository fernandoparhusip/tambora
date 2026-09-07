import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSearchInput from '~/components/base/BaseSearchInput.vue'
import BaseBadge from '~/components/base/BaseBadge.vue'
import BaseCreateButton from '~/components/base/BaseCreateButton.vue'
import BaseExportButton from '~/components/base/BaseExportButton.vue'
import BasePageHeader from '~/components/base/BasePageHeader.vue'

// Mock useRbac for BaseCreateButton
const mockCan = vi.fn().mockReturnValue(true)
vi.mock('~/composables/useRbac', () => ({
  useRbac: () => ({ can: mockCan, isSuperAdmin: vi.fn().mockReturnValue(true) }),
}))

// Mock svg import
vi.mock('@/assets/icon/FileTypeExcel.svg', () => ({
  default: 'mocked-excel-icon.svg',
}))

describe('Base UI Components', () => {
  describe('BaseSearchInput', () => {
    it('renders with modelValue and emits update:modelValue on input', async () => {
      const wrapper = mount(BaseSearchInput, {
        props: { modelValue: 'Initial' },
      })
      const input = wrapper.find('input')
      expect((input.element as HTMLInputElement).value).toBe('Initial')

      await input.setValue('Search Query')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Search Query'])
    })
  })

  describe('BaseBadge', () => {
    it('renders label and applies variant classes', () => {
      const wrapper = mount(BaseBadge, {
        props: { label: 'Active', variant: 'success', size: 'sm' },
      })
      expect(wrapper.text()).toBe('Active')
      expect(wrapper.classes()).toContain('bg-emerald-50')
      expect(wrapper.classes()).toContain('text-xs')
    })

    it('renders all variant variants correctly', () => {
      const variants = ['danger', 'warning', 'info', 'primary', 'system', 'mono', 'neutral'] as const
      for (const variant of variants) {
        const wrapper = mount(BaseBadge, { props: { label: 'Test', variant, size: 'md' } })
        expect(wrapper.exists()).toBe(true)
      }
    })

    it('renders slot content when provided', () => {
      const wrapper = mount(BaseBadge, {
        slots: { default: 'Custom Slot Content' },
      })
      expect(wrapper.text()).toBe('Custom Slot Content')
    })
  })

  describe('BaseCreateButton', () => {
    const tooltipDirective = { mounted: vi.fn() }

    it('renders active button and emits click when user has permission', async () => {
      mockCan.mockReturnValue(true)
      const wrapper = mount(BaseCreateButton, {
        props: { resource: 'user' },
        global: { directives: { tooltip: tooltipDirective } },
      })

      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('TAMBAH DATA')

      await button.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('renders disabled state with tooltip when user lacks permission', async () => {
      mockCan.mockReturnValue(false)
      const wrapper = mount(BaseCreateButton, {
        props: { resource: 'user', permission: 'USER.CREATE' },
        global: { directives: { tooltip: tooltipDirective } },
      })

      expect(wrapper.find('div.cursor-not-allowed').exists()).toBe(true)
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('respects disabled prop even when permission is granted', () => {
      mockCan.mockReturnValue(true)
      const wrapper = mount(BaseCreateButton, {
        props: { resource: 'user', disabled: true },
        global: { directives: { tooltip: tooltipDirective } },
      })

      expect(wrapper.find('div.cursor-not-allowed').exists()).toBe(true)
    })
  })

  describe('BaseExportButton', () => {
    it('renders button and emits click', async () => {
      const wrapper = mount(BaseExportButton)
      expect(wrapper.text()).toContain('.xls')

      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('BasePageHeader', () => {
    it('renders explicit title and subtitle', () => {
      const wrapper = mount(BasePageHeader, {
        props: { title: 'Master Data Asset', subtitle: 'Kelola data asset mesin pembangkit' },
      })
      expect(wrapper.find('h1').text()).toBe('Master Data Asset')
      expect(wrapper.find('p').text()).toBe('Kelola data asset mesin pembangkit')
    })

    it('renders actions slot when provided', () => {
      const wrapper = mount(BasePageHeader, {
        props: { title: 'Master' },
        slots: { actions: '<button id="btn-slot">Action</button>' },
      })
      expect(wrapper.find('#btn-slot').exists()).toBe(true)
    })
  })
})
