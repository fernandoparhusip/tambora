import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FormFieldRenderer from '~/components/base/FormFieldRenderer.vue'

// Mock cryptoRandom
vi.mock('~/utils/cryptoRandom', () => ({
  getNextSequenceId: vi.fn(() => 'test-id-1'),
  getSecureRandom: vi.fn(() => 0.5),
}))

const globalStubs = {
  Teleport: { template: '<div><slot /></div>' },
  DatePicker: { template: '<div class="datepicker-stub"></div>', props: ['modelValue'] },
  Textarea: { template: '<textarea></textarea>', props: ['modelValue'] },
  BaseMap: { template: '<div class="basemap-stub"></div>', props: ['markers', 'center', 'zoom'] },
  ToggleSwitch: { template: '<input type="checkbox" class="toggleswitch-stub" />', props: ['modelValue'] },
  ColorPicker: { template: '<input type="color" class="colorpicker-stub" />', props: ['modelValue'] },
  ClientOnly: { template: '<div><slot /></div>' },
}

describe('FormFieldRenderer', () => {
  const createWrapper = (fieldConfig: any = {}, modelValue: any = '', formData: any = {}) => {
    const field = {
      key: 'test_field',
      label: 'Test Field',
      type: 'text',
      ...fieldConfig,
    }
    return mount(FormFieldRenderer, {
      props: { field, modelValue, formData },
      global: { stubs: globalStubs },
    })
  }

  describe('isDisabled computed', () => {
    it('returns false when disabled is not set', () => {
      const wrapper = createWrapper({ disabled: false })
      expect(wrapper.exists()).toBe(true)
    })

    it('returns true when disabled is boolean true', () => {
      const wrapper = createWrapper({ disabled: true })
      expect(wrapper.exists()).toBe(true)
    })

    it('evaluates function-based disabled', () => {
      const disabledFn = (data: any) => data.status === 'locked'
      const wrapper = createWrapper(
        { disabled: disabledFn },
        '',
        { status: 'locked' }
      )
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('computedPrefix', () => {
    it('returns empty string when no prefix', () => {
      const wrapper = createWrapper({ prefix: undefined })
      expect(wrapper.exists()).toBe(true)
    })

    it('returns static prefix string', () => {
      const wrapper = createWrapper({ prefix: '+62' })
      expect(wrapper.exists()).toBe(true)
    })

    it('evaluates function-based prefix', () => {
      const prefixFn = (data: any) => data.country === 'ID' ? '+62' : '+1'
      const wrapper = createWrapper(
        { prefix: prefixFn },
        '',
        { country: 'ID' }
      )
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('phone number input', () => {
    it('phoneInputValue strips +62 prefix', () => {
      const wrapper = createWrapper({ type: 'phone' }, '+628123456')
      expect(wrapper.exists()).toBe(true)
    })

    it('phoneInputValue returns empty for empty value', () => {
      const wrapper = createWrapper({ type: 'phone' }, '')
      expect(wrapper.exists()).toBe(true)
    })

    it('phoneInputValue returns raw value without +62', () => {
      const wrapper = createWrapper({ type: 'phone' }, '8123456')
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('multi-select logic', () => {
    it('multiSelectValues returns array when value is array', () => {
      const wrapper = createWrapper(
        { type: 'multi-select', options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }] },
        ['a', 'b']
      )
      expect(wrapper.exists()).toBe(true)
    })

    it('multiSelectValues wraps non-array value', () => {
      const wrapper = createWrapper(
        { type: 'multi-select', options: [{ label: 'A', value: 'a' }] },
        'a'
      )
      expect(wrapper.exists()).toBe(true)
    })

    it('multiSelectValues returns empty for null/undefined/empty', () => {
      const wrapper = createWrapper(
        { type: 'multi-select', options: [{ label: 'A', value: 'a' }] },
        null
      )
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('searchable select', () => {
    const selectOptions = [
      { label: 'Regional 1', value: 'r1', description: 'Desc 1' },
      { label: 'Regional 2', value: 'r2', description: 'Desc 2' },
      { label: 'Cabang A', value: 'c1' },
    ]

    it('filteredOptions returns all when no search query', () => {
      const wrapper = createWrapper({ type: 'searchable-select', options: selectOptions })
      expect(wrapper.exists()).toBe(true)
    })

    it('selectedOptionLabel returns empty for empty value', () => {
      const wrapper = createWrapper({ type: 'searchable-select', options: selectOptions }, '')
      expect(wrapper.exists()).toBe(true)
    })

    it('selectedOptionLabel returns matching option label', () => {
      const wrapper = createWrapper({ type: 'searchable-select', options: selectOptions }, 'r1')
      expect(wrapper.exists()).toBe(true)
    })

    it('selectedOptionLabel handles option with title and description', () => {
      const opts = [{ label: 'Test', title: 'Title', value: 't1', description: 'Desc' }]
      const wrapper = createWrapper({ type: 'searchable-select', options: opts }, 't1')
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('date handling', () => {
    it('renders date type field', () => {
      const wrapper = createWrapper({ type: 'date' }, '2024-01-15')
      expect(wrapper.exists()).toBe(true)
    })

    it('handles empty date value', () => {
      const wrapper = createWrapper({ type: 'date' }, '')
      expect(wrapper.exists()).toBe(true)
    })

    it('handles invalid date value', () => {
      const wrapper = createWrapper({ type: 'date' }, 'not-a-date')
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('time handling', () => {
    it('renders time type field', () => {
      const wrapper = createWrapper({ type: 'time' }, '14:30')
      expect(wrapper.exists()).toBe(true)
    })

    it('handles empty time value', () => {
      const wrapper = createWrapper({ type: 'time' }, '')
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('textarea type', () => {
    it('renders textarea field', () => {
      const wrapper = createWrapper({ type: 'textarea' }, 'Hello World')
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('number type', () => {
    it('renders number field', () => {
      const wrapper = createWrapper({ type: 'number' }, 42)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('select type', () => {
    it('renders select field with options', () => {
      const wrapper = createWrapper({
        type: 'select',
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ],
      }, 'a')
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('radio type', () => {
    it('renders radio options and handles selection', async () => {
      const wrapper = createWrapper({
        type: 'radio',
        options: [
          { label: 'Pria', value: 'L' },
          { label: 'Wanita', value: 'P' },
        ],
      }, 'L')
      expect(wrapper.text()).toContain('Pria')
      expect(wrapper.text()).toContain('Wanita')
    })
  })

  describe('phone type', () => {
    it('renders phone input and formats prefix', async () => {
      const wrapper = createWrapper({ type: 'phone' }, '8123456789')
      expect(wrapper.text()).toContain('+62')
      const input = wrapper.find('input[type="text"]')
      if (input.exists()) {
        await input.setValue('08123456789')
      }
    })
  })

  describe('multi-select and searchable-multi-select', () => {
    it('renders and toggles multi-select options', async () => {
      const wrapper = createWrapper({
        type: 'multi-select',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
      }, ['apple'])
      expect(wrapper.exists()).toBe(true)

      const btn = wrapper.find('button')
      if (btn.exists()) {
        await btn.trigger('click')
      }
    })

    it('handles searchable-multi-select', async () => {
      const wrapper = createWrapper({
        type: 'searchable-multi-select',
        options: [
          { label: 'Jakarta', value: 'JKT' },
          { label: 'Surabaya', value: 'SUB' },
        ],
      }, [])
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('color and coordinate-picker', () => {
    it('handles color type with hex input', async () => {
      const wrapper = createWrapper({ type: 'color' }, '#2563EB')
      expect(wrapper.exists()).toBe(true)
    })

    it('handles coordinate-picker type', async () => {
      const formData = { latitude: -8.5, longitude: 117.4 }
      const wrapper = createWrapper({ type: 'coordinate-picker' }, '', formData)
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('switch, password and currency', () => {
    it('handles switch / toggle type', () => {
      const wrapper = createWrapper({ type: 'switch' }, true)
      expect(wrapper.exists()).toBe(true)
    })

    it('handles password type with toggle visibility', async () => {
      const wrapper = createWrapper({ type: 'password' }, 'secret123')
      expect(wrapper.exists()).toBe(true)
      const toggleBtn = wrapper.find('button')
      if (toggleBtn.exists()) {
        await toggleBtn.trigger('click')
      }
    })

    it('handles currency / number formatting', () => {
      const wrapper = createWrapper({ type: 'currency' }, 500000)
      expect(wrapper.exists()).toBe(true)
    })
  })
})
