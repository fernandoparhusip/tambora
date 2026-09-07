import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseSelect from '~/components/base/BaseSelect.vue'

describe('BaseSelect Component', () => {
  const stringOptions = ['Option 1', 'Option 2', 'Option 3']
  const objectOptions = [
    { label: 'Item A', value: 'a', badge: 'New' },
    { label: 'Item B', value: 'b' },
  ]
  const manyOptions = Array.from({ length: 8 }, (_, i) => ({
    label: `Option ${i + 1}`,
    value: `opt_${i + 1}`,
  }))

  it('renders with placeholder and closed dropdown by default', () => {
    const wrapper = mount(BaseSelect, {
      props: { options: stringOptions, placeholder: 'Pilih data...' },
    })
    expect(wrapper.text()).toContain('Pilih data...')
  })

  it('renders selected value for primitive options', () => {
    const wrapper = mount(BaseSelect, {
      props: { options: stringOptions, modelValue: 'Option 2' },
    })
    expect(wrapper.text()).toContain('Option 2')
  })

  it('renders selected value for object options with badge', () => {
    const wrapper = mount(BaseSelect, {
      props: { options: objectOptions, modelValue: 'a' },
    })
    expect(wrapper.text()).toContain('Item A')
  })

  it('disables dropdown toggle when disabled prop is true', async () => {
    const wrapper = mount(BaseSelect, {
      props: { options: objectOptions, disabled: true },
    })
    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('emits update:modelValue when an option is selected', async () => {
    const wrapper = mount(BaseSelect, {
      props: { options: objectOptions, modelValue: '' },
    })
    // Open dropdown
    await wrapper.find('button').trigger('click')
    // Options are rendered as buttons inside dropdown
    const optionButtons = wrapper.findAll('div.flex-1 button')
    expect(optionButtons.length).toBe(2)

    await optionButtons[0]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a'])
  })

  it('shows search input when searchable and options > 5', async () => {
    const wrapper = mount(BaseSelect, {
      props: { options: manyOptions, modelValue: '', searchable: true },
    })
    await wrapper.find('button').trigger('click')
    const searchInput = wrapper.find('input[type="text"]')
    expect(searchInput.exists()).toBe(true)

    await searchInput.setValue('Option 6')
    const optionButtons = wrapper.findAll('div.flex-1 button')
    expect(optionButtons.length).toBe(1)
    expect(optionButtons[0]!.text()).toContain('Option 6')
  })

  it('displays empty state message when no options match search query', async () => {
    const wrapper = mount(BaseSelect, {
      props: { options: manyOptions, modelValue: '', searchable: true },
    })
    await wrapper.find('button').trigger('click')
    const searchInput = wrapper.find('input[type="text"]')
    await searchInput.setValue('Nonexistent item')

    expect(wrapper.text()).toContain('Tidak ada opsi yang sesuai')
  })

  it('closes dropdown when clicking outside', async () => {
    const wrapper = mount(BaseSelect, {
      props: { options: stringOptions, modelValue: '' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Option 1')

    ;(wrapper.vm as any).handleClickOutside({ target: document.body })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('Option 1')
  })
})
