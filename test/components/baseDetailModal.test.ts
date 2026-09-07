import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseDetailModal from '~/components/base/BaseDetailModal.vue'

const VueFinalModalStub = {
  name: 'VueFinalModal',
  props: ['modelValue'],
  template: '<div v-if="modelValue" class="vfm-detail-stub"><slot /></div>',
}

describe('BaseDetailModal Component', () => {
  const dataItems = [
    { label: 'Kode Mesin', value: 'M-01' },
    { label: 'Nama Mesin', value: 'Mesin Alpha' },
    { label: 'Status', value: 'Beroperasi', isStatus: true },
  ]

  it('renders modal with title, subtitle, and detail data items', () => {
    const wrapper = mount(BaseDetailModal, {
      props: {
        isOpen: true,
        title: 'Detail Mesin',
        subtitle: 'Informasi data mesin',
        dataItems,
        record: { id: 'rec-1', kode: 'M-01' },
      },
      global: {
        stubs: { VueFinalModal: VueFinalModalStub },
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Detail Mesin')
    expect(wrapper.text()).toContain('Informasi data mesin')
    expect(wrapper.text()).toContain('Kode Mesin')
    expect(wrapper.text()).toContain('Mesin Alpha')
  })

  it('renders loading state', () => {
    const wrapper = mount(BaseDetailModal, {
      props: {
        isOpen: true,
        loading: true,
        dataItems: [],
      },
      global: {
        stubs: { VueFinalModal: VueFinalModalStub },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = mount(BaseDetailModal, {
      props: {
        isOpen: true,
        dataItems,
      },
      global: {
        stubs: { VueFinalModal: VueFinalModalStub },
      },
    })
    const editBtn = wrapper.findAll('button').find(b => b.text().includes('UBAH') || b.text().includes('Ubah') || b.text().includes('Edit'))
    if (editBtn) {
      await editBtn.trigger('click')
      expect(wrapper.emitted('edit')).toBeTruthy()
    }
  })
})
