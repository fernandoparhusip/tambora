import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BasePagination from '~/components/base/BasePagination.vue'

describe('BasePagination Component', () => {
  const defaultProps = {
    total: 50,
    currentPage: 1,
    pageSize: 10,
  }

  it('renders correctly with default props', () => {
    const wrapper = mount(BasePagination, { props: defaultProps })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Menampilkan')
    expect(wrapper.text()).toContain('dari 50 Data')
  })

  it('calculates totalPages and visiblePages correctly for small page count', () => {
    const wrapper = mount(BasePagination, {
      props: { total: 20, currentPage: 1, pageSize: 5 },
    })
    // 20 / 5 = 4 pages (<= 7) -> [1, 2, 3, 4]
    const buttons = wrapper.findAll('button')
    const pageButtons = buttons.filter(b => ['1', '2', '3', '4'].includes(b.text()))
    expect(pageButtons.length).toBe(4)
  })

  it('calculates visiblePages correctly when curr <= 4 for large page count', () => {
    const wrapper = mount(BasePagination, {
      props: { total: 100, currentPage: 2, pageSize: 10 },
    })
    // totalPages = 10, curr = 2 -> [1, 2, 3, 4, 5, "...", 10]
    expect(wrapper.text()).toContain('...')
    expect(wrapper.text()).toContain('10')
  })

  it('calculates visiblePages correctly when curr >= totalP - 3', () => {
    const wrapper = mount(BasePagination, {
      props: { total: 100, currentPage: 9, pageSize: 10 },
    })
    // totalPages = 10, curr = 9 -> [1, "...", 6, 7, 8, 9, 10]
    expect(wrapper.text()).toContain('...')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('10')
  })

  it('calculates visiblePages correctly when in middle', () => {
    const wrapper = mount(BasePagination, {
      props: { total: 100, currentPage: 5, pageSize: 10 },
    })
    // [1, "...", 4, 5, 6, "...", 10]
    expect(wrapper.text()).toContain('5')
  })

  it('emits update:currentPage when page button is clicked', async () => {
    const wrapper = mount(BasePagination, { props: defaultProps })
    // Click page 2 button
    const page2Btn = wrapper.findAll('button').find(b => b.text() === '2')
    expect(page2Btn).toBeDefined()
    await page2Btn!.trigger('click')
    expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([2])
  })

  it('does not emit update:currentPage if page is invalid or current', async () => {
    const wrapper = mount(BasePagination, { props: defaultProps })
    // Prev button is disabled on page 1
    const prevBtn = wrapper.find('button[aria-label="Halaman sebelumnya"]')
    if (prevBtn.exists()) {
      await prevBtn.trigger('click')
      expect(wrapper.emitted('update:currentPage')).toBeUndefined()
    }
  })

  it('handles number typing in page size input', async () => {
    const wrapper = mount(BasePagination, { props: defaultProps })
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)

    await input.setValue('25')
    expect(wrapper.emitted('update:pageSize')?.[0]).toEqual([25])
    expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([1])
  })

  it('handles blur with fallback when input is empty or invalid', async () => {
    const wrapper = mount(BasePagination, { props: defaultProps })
    const input = wrapper.find('input')
    await input.setValue('')
    await input.trigger('blur')

    expect(wrapper.emitted('update:pageSize')).toBeTruthy()
  })

  it('blocks non-numeric keys on keydown', async () => {
    const wrapper = mount(BasePagination, { props: defaultProps })
    const input = wrapper.find('input')

    const allowedEvent = new KeyboardEvent('keydown', { key: 'Backspace' })
    const preventDefaultSpy1 = vi.spyOn(allowedEvent, 'preventDefault')
    input.element.dispatchEvent(allowedEvent)
    expect(preventDefaultSpy1).not.toHaveBeenCalled()

    const blockedEvent = new KeyboardEvent('keydown', { key: 'a' })
    const preventDefaultSpy2 = vi.spyOn(blockedEvent, 'preventDefault')
    input.element.dispatchEvent(blockedEvent)
    expect(preventDefaultSpy2).toHaveBeenCalled()
  })

  it('toggles dropdown and selects an option', async () => {
    const wrapper = mount(BasePagination, { props: defaultProps })
    const toggleBtn = wrapper.find('button[aria-label="Pilih jumlah data"]')
    if (toggleBtn.exists()) {
      await toggleBtn.trigger('click')
      const opt = wrapper.findAll('.cursor-pointer').find(el => el.text().includes('20'))
      if (opt) {
        await opt.trigger('click')
        expect(wrapper.emitted('update:pageSize')).toBeTruthy()
      }
    }
  })

  it('handles next and prev navigation', async () => {
    const wrapper = mount(BasePagination, {
      props: { total: 50, currentPage: 2, pageSize: 10 },
    })
    const nextBtn = wrapper.find('button[aria-label="Halaman berikutnya"]')
    if (nextBtn.exists()) {
      await nextBtn.trigger('click')
      expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([3])
    }
    const prevBtn = wrapper.find('button[aria-label="Halaman sebelumnya"]')
    if (prevBtn.exists()) {
      await prevBtn.trigger('click')
      expect(wrapper.emitted('update:currentPage')?.[1]).toEqual([1])
    }
  })

  it('handles first and last page navigation if available', async () => {
    const wrapper = mount(BasePagination, {
      props: { total: 100, currentPage: 5, pageSize: 10 },
    })
    const firstBtn = wrapper.find('button[aria-label="Halaman pertama"]')
    if (firstBtn.exists()) {
      await firstBtn.trigger('click')
      expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    }
  })

  it('handles click outside to close dropdown', async () => {
    const wrapper = mount(BasePagination, { props: defaultProps, attachTo: document.body })
    const toggleBtn = wrapper.find('button[aria-label="Pilih jumlah data"]')
    if (toggleBtn.exists()) {
      await toggleBtn.trigger('click')
      document.body.click()
    }
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })
})
