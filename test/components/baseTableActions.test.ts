import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseTableActions from '~/components/base/BaseTableActions.vue'

// Stub child component
const BaseActionButton = {
  name: 'BaseActionButton',
  template: '<button @click="$emit(\'click\')"><slot /></button>',
  props: ['type', 'resource', 'title', 'disabled'],
  emits: ['click'],
}

describe('BaseTableActions', () => {
  const createWrapper = (props = {}) => {
    return mount(BaseTableActions, {
      props,
      global: {
        stubs: { BaseActionButton },
      },
    })
  }

  it('renders all three action buttons by default', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAllComponents(BaseActionButton)
    expect(buttons).toHaveLength(3)
  })

  it('hides view button when showView is false', () => {
    const wrapper = createWrapper({ showView: false })
    const buttons = wrapper.findAllComponents(BaseActionButton)
    expect(buttons).toHaveLength(2)
  })

  it('hides edit button when showEdit is false', () => {
    const wrapper = createWrapper({ showEdit: false })
    const buttons = wrapper.findAllComponents(BaseActionButton)
    expect(buttons).toHaveLength(2)
  })

  it('hides delete button when showDelete is false', () => {
    const wrapper = createWrapper({ showDelete: false })
    const buttons = wrapper.findAllComponents(BaseActionButton)
    expect(buttons).toHaveLength(2)
  })

  it('hides all buttons when all show props are false', () => {
    const wrapper = createWrapper({ showView: false, showEdit: false, showDelete: false })
    const buttons = wrapper.findAllComponents(BaseActionButton)
    expect(buttons).toHaveLength(0)
  })

  it('emits view event when view button is clicked', async () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAllComponents(BaseActionButton)
    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('view')).toBeTruthy()
  })

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAllComponents(BaseActionButton)
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
  })

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAllComponents(BaseActionButton)
    await buttons[2]!.trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
  })

  it('passes resource prop to edit and delete buttons', () => {
    const wrapper = createWrapper({ resource: 'ASSET' })
    const buttons = wrapper.findAllComponents(BaseActionButton)
    // edit button (index 1) and delete button (index 2) should have resource
    expect(buttons[1]!.props('resource')).toBe('ASSET')
    expect(buttons[2]!.props('resource')).toBe('ASSET')
  })

  it('passes custom titles to action buttons', () => {
    const wrapper = createWrapper({
      viewTitle: 'Lihat Detail',
      editTitle: 'Ubah Data',
      deleteTitle: 'Hapus Data',
    })
    const buttons = wrapper.findAllComponents(BaseActionButton)
    expect(buttons[0]!.props('title')).toBe('Lihat Detail')
    expect(buttons[1]!.props('title')).toBe('Ubah Data')
    expect(buttons[2]!.props('title')).toBe('Hapus Data')
  })

  it('passes disabled state to edit and delete buttons', () => {
    const wrapper = createWrapper({ disabledEdit: true, disabledDelete: true })
    const buttons = wrapper.findAllComponents(BaseActionButton)
    expect(buttons[1]!.props('disabled')).toBe(true)
    expect(buttons[2]!.props('disabled')).toBe(true)
  })

  it('renders extra slot content', () => {
    const wrapper = mount(BaseTableActions, {
      global: { stubs: { BaseActionButton } },
      slots: { extra: '<button class="custom-btn">Custom</button>' },
    })
    expect(wrapper.find('.custom-btn').exists()).toBe(true)
  })

  it('renders with default empty resource prop', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAllComponents(BaseActionButton)
    expect(buttons[1]!.props('resource')).toBe('')
  })
})
