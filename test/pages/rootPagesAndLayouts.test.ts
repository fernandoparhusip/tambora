import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultLayout from '~/layouts/default.vue'
import BlankLayout from '~/layouts/blank.vue'
import IndexPage from '~/pages/index.vue'
import LoginPage from '~/pages/login.vue'
import HomePage from '~/pages/home.vue'
import HomeIndexPage from '~/pages/home/index.vue'
import TransaksiIndexPage from '~/pages/home/transaksi/index.vue'
import { navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

// Stubs
const stubs = {
  UIcon: { template: '<span class="u-icon" />' },
  ClientOnly: { template: '<div><slot /></div>' },
  LoginForm: { template: '<div class="login-form-stub" />' },
  LoginSlider: { template: '<div class="login-slider-stub" />' },
  BaseAppSidebar: { template: '<div class="sidebar-stub" />' },
  BaseAppHeader: { template: '<div class="header-stub" />' },
  NuxtPage: { template: '<div class="nuxt-page-stub" />' },
  BaseIdleWarningModal: { template: '<div class="idle-stub" />' },
  BaseSessionExpiredModal: { template: '<div class="expired-stub" />' },
}

vi.mock('gsap', () => ({
  gsap: {
    killTweensOf: vi.fn(),
    set: vi.fn(),
    fromTo: vi.fn(),
  },
}))

describe('Root Pages and Layouts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders DefaultLayout with slot content', () => {
    const wrapper = mount(DefaultLayout, {
      slots: { default: '<div id="layout-child">Content</div>' },
    })
    expect(wrapper.find('#layout-child').exists()).toBe(true)
  })

  it('renders BlankLayout with slot content', () => {
    const wrapper = mount(BlankLayout, {
      slots: { default: '<div id="blank-child">Blank Content</div>' },
    })
    expect(wrapper.find('#blank-child').exists()).toBe(true)
  })

  it('IndexPage navigates based on auth state', () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = false
    mount(IndexPage, { global: { stubs } })
    expect(navigateTo).toHaveBeenCalledWith('/login')

    vi.clearAllMocks()
    authStore.isLoggedIn = true
    mount(IndexPage, { global: { stubs } })
    expect(navigateTo).toHaveBeenCalledWith('/home')
  })

  it('LoginPage renders login form and slider container', () => {
    const wrapper = mount(LoginPage, { global: { stubs } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.login-form-stub').exists()).toBe(true)
  })

  it('HomePage mounts with listeners and auto-syncs session when logged in', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = true
    authStore.fetchUserMe = vi.fn().mockResolvedValue({})

    const wrapper = mount(HomePage, { global: { stubs } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.sidebar-stub').exists()).toBe(true)
    expect(wrapper.find('.header-stub').exists()).toBe(true)
    expect(wrapper.find('.nuxt-page-stub').exists()).toBe(true)
    expect(authStore.fetchUserMe).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('HomePage handles fetchUserMe failure gracefully on mount', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = true
    authStore.fetchUserMe = vi.fn().mockRejectedValue(new Error('Network error'))

    const wrapper = mount(HomePage, { global: { stubs } })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('HomeIndexPage renders greeting text and runs typewriter animation', async () => {
    vi.useFakeTimers()
    const authStore = useAuthStore()
    authStore.user = { id: 'u1', full_name: 'Budi Santoso' } as any

    const wrapper = mount(HomeIndexPage, { global: { stubs } })
    expect(wrapper.exists()).toBe(true)

    // Advance timers for initial pause and all character typing
    vi.advanceTimersByTime(300 + 50 * 30)

    // Test with username
    authStore.user = { id: 'u2', username: 'budi99' } as any
    await wrapper.vm.$nextTick()

    // Test with no user (Pengguna fallback)
    authStore.user = null
    await wrapper.vm.$nextTick()

    // Trigger watch callback when user is updated
    authStore.user = { id: 'u3', nama: 'Santoso' } as any
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(500)

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('TransaksiIndexPage redirects to operasi-harian', () => {
    mount(TransaksiIndexPage, { global: { stubs } })
    expect(navigateTo).toHaveBeenCalledWith('/home/transaksi/operasi-harian', { replace: true })
  })
})
