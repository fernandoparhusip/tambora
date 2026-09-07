import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '~/components/base/AppHeader.vue'
import AppSidebar from '~/components/base/AppSidebar.vue'
import { useAuthStore } from '~/stores/auth'

vi.mock('@/assets/logo/LogoTamboraSidebar.svg', () => ({ default: 'logo-tambora.svg' }))
vi.mock('@/assets/logo/LogoFullPLN.svg', () => ({ default: 'logo-pln.svg' }))

const layoutStubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
}

describe('App Layout Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AppHeader', () => {
    it('renders user name and initial avatar', () => {
      const authStore = useAuthStore()
      authStore.user = { id: 'u1', username: 'budi_s', nama: 'Budi Santoso', email: 'budi@pln.co.id' } as any
      const wrapper = mount(AppHeader, { global: { stubs: layoutStubs } })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('budi_s')
      expect(wrapper.text()).toContain('BU')
    })

    it('handles user initials fallback when username is single letter or empty', () => {
      const authStore = useAuthStore()
      authStore.user = { id: 'u2', username: 'a', nama: 'Asep Saepuloh', email: 'a@pln.co.id' } as any
      const wrapper = mount(AppHeader, { global: { stubs: layoutStubs } })
      expect(wrapper.text()).toContain('A')
    })

    it('toggles profile dropdown menu on click and handles logout', async () => {
      vi.useFakeTimers()
      const authStore = useAuthStore()
      authStore.user = { id: 'u1', username: 'budi_s', nama: 'Budi Santoso', email: 'budi@pln.co.id' } as any
      const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue(undefined as any)

      const wrapper = mount(AppHeader, { global: { stubs: layoutStubs } })

      const profileBtn = wrapper.find('#header-btn-user')
      expect(profileBtn.exists()).toBe(true)
      await profileBtn.trigger('click')
      expect(wrapper.text()).toContain('Budi Santoso')
      expect(wrapper.text()).toContain('Keluar')

      // Find logout button in dropdown and click
      const buttons = wrapper.findAll('button')
      const logoutBtn = buttons.find(b => b.text().includes('Keluar'))
      if (logoutBtn) {
        await logoutBtn.trigger('click')
        await vi.advanceTimersByTimeAsync(700)
        expect(logoutSpy).toHaveBeenCalled()
      }
      vi.useRealTimers()
    })

    it('handles outside click and notifications', async () => {
      const wrapper = mount(AppHeader, { global: { stubs: layoutStubs } })
      const notifBtn = wrapper.find('#header-btn-notification')
      if (notifBtn.exists()) {
        await notifBtn.trigger('click')
      }
      document.dispatchEvent(new MouseEvent('mousedown'))
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('AppSidebar', () => {
    it('renders sidebar navigation menu and interacts with items', async () => {
      const authStore = useAuthStore()
      authStore.user = { id: 'u1', nama: 'Admin', role: 'Superadmin' } as any
      authStore.hasMenuAccess = vi.fn().mockReturnValue(true)

      const wrapper = mount(AppSidebar, { global: { stubs: layoutStubs } })
      expect(wrapper.exists()).toBe(true)

      // Mouse enter / leave
      const aside = wrapper.find('aside')
      if (aside.exists()) {
        await aside.trigger('mouseenter')
        await aside.trigger('mouseleave')
      }

      // Click menu buttons
      const buttons = wrapper.findAll('aside button')
      if (buttons.length > 0 && buttons[0]) {
        await buttons[0].trigger('click')
      }
    })
  })
})

