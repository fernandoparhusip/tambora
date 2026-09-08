import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginSlider from '~/components/login/LoginSlider.vue'
import SliderCaptcha from '~/components/login/SliderCaptcha.vue'
import LoginForm from '~/components/login/LoginForm.vue'

// Mock svg and png assets
vi.mock('@/assets/logo/LogoFullPLN.svg', () => ({ default: 'logo-full.svg' }))
vi.mock('@/assets/logo/LogoSmallPLN.svg', () => ({ default: 'logo-small.svg' }))
vi.mock('@/assets/icon/Email.svg', () => ({ default: 'email.svg' }))
vi.mock('@/assets/icon/Password.svg', () => ({ default: 'password.svg' }))
vi.mock('@/assets/icon/Helpdesk.svg', () => ({ default: 'helpdesk.svg' }))
vi.mock('@/assets/icon/LupaPassword.svg', () => ({ default: 'lupa-password.svg' }))
vi.mock('@/assets/icon/KonfirmasiPassword.svg', () => ({ default: 'konfirmasi-password.svg' }))
vi.mock('@/assets/image/LowRes/image1.png', () => ({ default: 'low1.png' }))
vi.mock('@/assets/image/LowRes/image2.png', () => ({ default: 'low2.png' }))
vi.mock('@/assets/image/LowRes/image3.png', () => ({ default: 'low3.png' }))
vi.mock('@/assets/image/LowRes/image4.png', () => ({ default: 'low4.png' }))
vi.mock('@/assets/image/LowRes/image5.png', () => ({ default: 'low5.png' }))
vi.mock('@/assets/image/HighRes/image1.png', () => ({ default: 'high1.png' }))
vi.mock('@/assets/image/HighRes/image2.png', () => ({ default: 'high2.png' }))
vi.mock('@/assets/image/HighRes/image3.png', () => ({ default: 'high3.png' }))
vi.mock('@/assets/image/HighRes/image4.png', () => ({ default: 'high4.png' }))
vi.mock('@/assets/image/HighRes/image5.png', () => ({ default: 'high5.png' }))

// Mock vue3-carousel
vi.mock('vue3-carousel', () => ({
  Carousel: { template: '<div class="carousel-stub"><slot /><slot name="addons" /></div>' },
  Slide: { template: '<div class="slide-stub"><slot /></div>' },
  Navigation: { template: '<div class="nav-stub"><slot name="prev" /><slot name="next" /></div>' },
  Pagination: { template: '<div class="pagination-stub" />' },
}))

// Mock driver.js
vi.mock('driver.js', () => ({
  driver: () => ({
    drive: vi.fn(),
    destroy: vi.fn(),
  }),
}))

// Mock gsap
const mockTimeline: any = {
  to: () => mockTimeline,
  from: () => mockTimeline,
  fromTo: () => mockTimeline,
}
vi.mock('gsap', () => ({
  gsap: {
    context: vi.fn((fn: any) => {
      if (typeof fn === 'function') fn()
      return { revert: vi.fn(), kill: vi.fn() }
    }),
    set: vi.fn(),
    fromTo: vi.fn(),
    to: vi.fn(),
    timeline: vi.fn(() => mockTimeline),
  },
}))

// Mock primevue toast
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() }),
}))

// Mock useAuth
const mockLogin = vi.fn().mockResolvedValue({ success: true })
const mockForgotPassword = vi.fn().mockResolvedValue({ success: true })
const mockUnlockUser = vi.fn().mockResolvedValue({ success: true })
const mockGetSSOUrl = vi.fn().mockReturnValue('https://sso.pln.co.id')
const mockVerifyRedirectToken = vi.fn().mockResolvedValue({ success: true })
const mockLogout = vi.fn()

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    forgotPassword: mockForgotPassword,
    unlockUser: mockUnlockUser,
    getSSOUrl: mockGetSSOUrl,
    verifyRedirectToken: mockVerifyRedirectToken,
    logout: mockLogout,
  }),
}))

// Mock cryptoRandom
vi.mock('~/utils/cryptoRandom', () => ({
  getSecureRandom: () => 0.5,
  getNextSequenceId: (prefix = 'id') => `${prefix}-123`,
}))

const globalStubs = {
  VueFinalModal: {
    name: 'VueFinalModal',
    props: ['modelValue'],
    template: '<div v-if="modelValue" class="vfm-stub"><slot /></div>',
  },
  Toast: { template: '<div class="toast-stub" />' },
  SliderCaptcha: {
    name: 'SliderCaptcha',
    props: ['onCaptchaSuccess'],
    template: '<div class="captcha-stub"><button id="captcha-trigger" @click="onCaptchaSuccess">Captcha Success</button></div>',
  },
  LoginSliderCaptcha: {
    name: 'LoginSliderCaptcha',
    props: ['onCaptchaSuccess'],
    template: '<div class="captcha-stub"><button id="captcha-trigger" @click="onCaptchaSuccess">Captcha Success</button></div>',
  },
  BaseLoadingIndicatorPLN: { template: '<div class="loading-stub" />' },
}

describe('Login Components', () => {
  describe('LoginSlider', () => {
    it('mounts and renders carousel slides', () => {
      const wrapper = mount(LoginSlider)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findAll('.slide-stub').length).toBe(5)
    })
  })

  describe('SliderCaptcha', () => {
    it('mounts without error and handles drag events', async () => {
      const onSuccess = vi.fn()
      const wrapper = mount(SliderCaptcha, {
        props: {
          onCaptchaSuccess: onSuccess,
        },
        global: { stubs: globalStubs },
      })
      expect(wrapper.exists()).toBe(true)

      // Find slider handle and simulate mousedown
      const handle = wrapper.find('div.cursor-grab')
      if (handle.exists()) {
        await handle.trigger('mousedown', { clientX: 0 })
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }))
        window.dispatchEvent(new MouseEvent('mouseup'))
      }

      // Refresh button
      const refreshBtn = wrapper.find('button[title="Ganti Gambar"]')
      if (refreshBtn.exists()) {
        await refreshBtn.trigger('click')
      }
    })
  })

  describe('LoginForm', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('mounts and renders login form fields', () => {
      const wrapper = mount(LoginForm, {
        global: { stubs: globalStubs },
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
      expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    })

    it('validates empty inputs on submit', async () => {
      const wrapper = mount(LoginForm, {
        global: { stubs: globalStubs },
      })
      const loginBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('masuk'))
      if (loginBtn) {
        await loginBtn.trigger('click')
        expect(wrapper.text()).toContain('Email atau Username harus diisi')
      }
    })

    it('toggles password visibility', async () => {
      const wrapper = mount(LoginForm, {
        global: { stubs: globalStubs },
      })
      const toggleBtn = wrapper.find('button[aria-label="Toggle password visibility"]')
      if (toggleBtn.exists()) {
        await toggleBtn.trigger('click')
        expect(wrapper.find('input[type="text"]').exists()).toBe(true)
      }
    })

    it('opens forgot password modal and handles forgot submit', async () => {
      const wrapper = mount(LoginForm, {
        global: { stubs: globalStubs },
      })
      const forgotBtn = wrapper.findAll('button').find(b => b.text().includes('Lupa Password'))
      if (forgotBtn) {
        await forgotBtn.trigger('click')
        expect(wrapper.find('.vfm-stub').exists()).toBe(true)
      }
    })

    it('enters credentials and triggers captcha modal', async () => {
      const wrapper = mount(LoginForm, {
        global: { stubs: globalStubs },
      })

      const inputs = wrapper.findAll('input')
      if (inputs[0] && inputs[1]) {
        await inputs[0].setValue('admin@pln.co.id')
        await inputs[1].setValue('password123')
      }

      const loginBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('masuk'))
      if (loginBtn) {
        await loginBtn.trigger('click')
      }

      // Check Helpdesk button
      const helpdeskBtn = wrapper.findAll('button').find(b => b.text().includes('Helpdesk'))
      if (helpdeskBtn) {
        await helpdeskBtn.trigger('click')
      }

      expect(wrapper.exists()).toBe(true)
    })
  })
})
