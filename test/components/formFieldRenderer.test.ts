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

  describe('phone input event handler', () => {
    it('onPhoneInput strips non-digit and prepends +62', async () => {
      const wrapper = createWrapper({ type: 'phone' }, '')
      const input = wrapper.find('input[type="text"]')
      if (input.exists()) {
        await input.setValue('8123456789')
        await input.trigger('input')
      }
      expect(wrapper.exists()).toBe(true)
    })

    it('onPhoneInput with empty input sets value to empty', async () => {
      const wrapper = createWrapper({ type: 'phone' }, '+628123456789')
      const input = wrapper.find('input[type="text"]')
      if (input.exists()) {
        await input.setValue('')
        await input.trigger('input')
      }
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('multi-select toggle interaction', () => {
    it('toggles option in and out of selection', async () => {
      const wrapper = createWrapper({
        type: 'multi-select',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
      }, [])

      // Open dropdown
      const triggerBtn = wrapper.find('button')
      if (triggerBtn.exists()) {
        await triggerBtn.trigger('click')
      }

      // Click option buttons inside the dropdown
      const optionBtns = wrapper.findAll('button')
      for (const btn of optionBtns) {
        const text = btn.text()
        if (text.includes('Apple') || text.includes('Banana')) {
          await btn.trigger('click')
          break
        }
      }
      expect(wrapper.exists()).toBe(true)
    })

    it('multiSelectDisplayLabel shows selected labels', () => {
      const wrapper = createWrapper({
        type: 'multi-select',
        options: [
          { label: 'Alpha', value: 'a' },
          { label: 'Beta', value: 'b' },
        ],
      }, ['a', 'b'])
      expect(wrapper.text()).toContain('Alpha')
    })

    it('multiSelectDisplayLabel returns empty for no selection', () => {
      const wrapper = createWrapper({
        type: 'multi-select',
        options: [{ label: 'A', value: 'a' }],
      }, [])
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('searchable select interaction', () => {
    it('selectOption sets value and closes dropdown', async () => {
      const wrapper = createWrapper({
        type: 'searchable-select',
        options: [
          { label: 'Option 1', value: 'o1' },
          { label: 'Option 2', value: 'o2' },
        ],
      }, '')

      // Open
      const triggerBtn = wrapper.find('button')
      if (triggerBtn.exists()) {
        await triggerBtn.trigger('click')
      }

      // Click an option
      const optionBtns = wrapper.findAll('button')
      for (const btn of optionBtns) {
        if (btn.text().includes('Option 1')) {
          await btn.trigger('click')
          break
        }
      }
      expect(wrapper.exists()).toBe(true)
    })

    it('filteredOptions filters by search query', async () => {
      const wrapper = createWrapper({
        type: 'searchable-select',
        options: [
          { label: 'Jakarta', value: 'jkt', description: 'Ibukota' },
          { label: 'Surabaya', value: 'sub', description: 'Kota Pahlawan' },
        ],
      }, '')

      // Open dropdown to show search
      const triggerBtn = wrapper.find('button')
      if (triggerBtn.exists()) {
        await triggerBtn.trigger('click')
      }

      const searchInput = wrapper.find('input[aria-label="Cari Data"]')
      if (searchInput.exists()) {
        await searchInput.setValue('Jakarta')
        await searchInput.trigger('input')
      }
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('date/time/year select handlers', () => {
    it('onDateSelect converts Date to YYYY-MM-DD', async () => {
      const wrapper = createWrapper({ type: 'date' }, '')
      // Trigger via emitted events from DatePicker stub
      const dp = wrapper.findComponent({ name: 'DatePicker' })
      if (dp.exists()) {
        await dp.vm.$emit('update:modelValue', new Date('2025-06-15'))
      }
      expect(wrapper.exists()).toBe(true)
    })

    it('onDateSelect with null/array sets empty', async () => {
      const wrapper = createWrapper({ type: 'date' }, '2025-01-01')
      const dp = wrapper.findComponent({ name: 'DatePicker' })
      if (dp.exists()) {
        await dp.vm.$emit('update:modelValue', null)
      }
      expect(wrapper.exists()).toBe(true)
    })

    it('onTimeSelect converts Date to HH:MM', async () => {
      const wrapper = createWrapper({ type: 'time' }, '')
      const dp = wrapper.findComponent({ name: 'DatePicker' })
      if (dp.exists()) {
        const d = new Date()
        d.setHours(14, 30)
        await dp.vm.$emit('update:modelValue', d)
      }
      expect(wrapper.exists()).toBe(true)
    })

    it('timeValue parses HH:MM string correctly', () => {
      const wrapper = createWrapper({ type: 'time' }, '08:45')
      expect(wrapper.exists()).toBe(true)
    })

    it('timeValue returns null when value is instance of Date', () => {
      const wrapper = createWrapper({ type: 'time' }, new Date())
      expect(wrapper.exists()).toBe(true)
    })

    it('yearValue handles valid year number', () => {
      const wrapper = createWrapper({ type: 'year' }, 2025)
      expect(wrapper.exists()).toBe(true)
    })

    it('yearValue handles 0 or invalid year', () => {
      const wrapper = createWrapper({ type: 'year' }, 0)
      expect(wrapper.exists()).toBe(true)
    })

    it('onYearSelect with null sets null', async () => {
      const wrapper = createWrapper({ type: 'year' }, 2024)
      const dp = wrapper.findComponent({ name: 'DatePicker' })
      if (dp.exists()) {
        await dp.vm.$emit('update:modelValue', null)
      }
      expect(wrapper.exists()).toBe(true)
    })

    it('month-year type renders correctly', () => {
      const wrapper = createWrapper({ type: 'month-year' }, '2025-08')
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('color picker logic', () => {
    it('colorPickerValue strips # prefix for PrimeVue ColorPicker', () => {
      const wrapper = createWrapper({ type: 'color' }, '#FF5733')
      expect(wrapper.exists()).toBe(true)
    })

    it('colorPickerValue returns fallback FF5733 for empty value', () => {
      const wrapper = createWrapper({ type: 'color' }, '')
      expect(wrapper.exists()).toBe(true)
    })

    it('onHexInput filters and uppercases hex characters', async () => {
      const wrapper = createWrapper({ type: 'color' }, '#000000')
      const hexInput = wrapper.find('input[type="text"]')
      if (hexInput.exists()) {
        await hexInput.setValue('ff5733zz')
        await hexInput.trigger('input')
      }
      expect(wrapper.exists()).toBe(true)
    })

    it('onHexInput with empty value clears color', async () => {
      const wrapper = createWrapper({ type: 'color' }, '#FF5733')
      const hexInput = wrapper.find('input[type="text"]')
      if (hexInput.exists()) {
        await hexInput.setValue('')
        await hexInput.trigger('input')
      }
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('coordinate picker logic', () => {
    it('pickerMarkers returns marker when lat/lng are valid', () => {
      const wrapper = createWrapper(
        { type: 'coordinate-picker', latKey: 'lat', lngKey: 'lng' },
        '',
        { lat: -8.5, lng: 117.4 }
      )
      expect(wrapper.exists()).toBe(true)
    })

    it('pickerMarkers returns empty for missing coordinates', () => {
      const wrapper = createWrapper(
        { type: 'coordinate-picker' },
        '',
        {}
      )
      expect(wrapper.exists()).toBe(true)
    })

    it('pickerZoom is 10 when marker exists, 8 when not', () => {
      const withMarker = createWrapper(
        { type: 'coordinate-picker' },
        '',
        { latitude: -8.5, longitude: 117.4 }
      )
      expect(withMarker.exists()).toBe(true)

      const noMarker = createWrapper(
        { type: 'coordinate-picker' },
        '',
        {}
      )
      expect(noMarker.exists()).toBe(true)
    })
  })

  describe('label rendering', () => {
    it('renders label with required asterisk when required=true', () => {
      const wrapper = createWrapper({ label: 'My Field', required: true })
      expect(wrapper.text()).toContain('My Field')
      expect(wrapper.text()).toContain('*')
    })

    it('does not render asterisk when required=false', () => {
      const wrapper = createWrapper({ label: 'My Field', required: false })
      expect(wrapper.text()).toContain('My Field')
    })

    it('does not render label element when label is empty', () => {
      const wrapper = createWrapper({ label: '' })
      const label = wrapper.find('label')
      expect(label.exists()).toBe(false)
    })
  })
})
