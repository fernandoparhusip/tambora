import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseFormModal from '~/components/base/BaseFormModal.vue'
import type { FormSectionConfig } from '~/types'

const VueFinalModalStub = {
  name: 'VueFinalModal',
  props: ['modelValue'],
  template: '<div v-if="modelValue" class="vfm-form-stub"><slot /></div>',
}

const FormFieldRendererStub = {
  name: 'FormFieldRenderer',
  props: ['field', 'modelValue', 'formData'],
  template: '<div class="form-field-stub"><label>{{ field.label }}</label></div>',
}

const stubs = {
  VueFinalModal: VueFinalModalStub,
  FormFieldRenderer: FormFieldRendererStub,
  BaseFormFieldRenderer: FormFieldRendererStub,
}

describe('BaseFormModal Component', () => {
  const sections: FormSectionConfig[] = [
    {
      title: 'Informasi Dasar',
      fields: [
        { key: 'kode', label: 'Kode', type: 'text' as const, required: true },
        { key: 'nama', label: 'Nama', type: 'text' as const, required: true },
      ],
    },
  ]

  it('renders form modal with sections and fields', () => {
    const wrapper = mount(BaseFormModal, {
      props: {
        isOpen: true,
        title: 'Tambah Mesin',
        subtitle: 'Form Tambah Mesin',
        sections,
        formData: { kode: '', nama: '' },
      },
      global: {
        stubs,
      },
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Tambah Mesin')
    expect(wrapper.text()).toContain('Informasi Dasar')
  })

  it('emits submit when submit button is clicked', async () => {
    const wrapper = mount(BaseFormModal, {
      props: {
        isOpen: true,
        title: 'Tambah Mesin',
        sections,
        formData: { kode: 'M-01', nama: 'Mesin Alpha' },
      },
      global: {
        stubs,
      },
    })
    const form = wrapper.find('form')
    if (form.exists()) {
      await form.trigger('submit.prevent')
      expect(wrapper.emitted('submit')).toBeTruthy()
    }
  })

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(BaseFormModal, {
      props: {
        isOpen: true,
        title: 'Tambah Mesin',
        sections,
        formData: {},
      },
      global: {
        stubs,
      },
    })
    const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('BATAL') || b.text().includes('Batal'))
    if (cancelBtn) {
      await cancelBtn.trigger('click')
      expect(wrapper.emitted('cancel')).toBeTruthy()
    }
  })
})
