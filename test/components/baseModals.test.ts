import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import BaseConfirmDialog from '~/components/base/BaseConfirmDialog.vue'
import BaseSuccessModal from '~/components/base/BaseSuccessModal.vue'
import BaseSessionExpiredModal from '~/components/base/BaseSessionExpiredModal.vue'
import BaseIdleWarningModal from '~/components/base/BaseIdleWarningModal.vue'

// Global stub for VueFinalModal
const VueFinalModalStub = {
  name: 'VueFinalModal',
  props: ['modelValue'],
  template: '<div v-if="modelValue" class="vfm-stub"><slot /></div>',
}

// Mock useIdleTimer
const mockShowExpired = ref(true)
const mockExpiredRemainingSeconds = ref(7)
const mockConfirmExpiredLogout = vi.fn()

const mockShowWarning = ref(true)
const mockRemainingSeconds = ref(45)
const mockFormattedCountdown = ref('00:45')
const mockExtendSession = vi.fn().mockResolvedValue(undefined)
const mockHandleTimeout = vi.fn()

vi.mock('~/composables/useIdleTimer', () => ({
  useIdleTimer: () => ({
    showExpired: mockShowExpired,
    expiredRemainingSeconds: mockExpiredRemainingSeconds,
    confirmExpiredLogout: mockConfirmExpiredLogout,
    showWarning: mockShowWarning,
    remainingSeconds: mockRemainingSeconds,
    formattedCountdown: mockFormattedCountdown,
    extendSession: mockExtendSession,
    handleTimeout: mockHandleTimeout,
  }),
}))

describe('Base Modal Components', () => {
  describe('BaseConfirmDialog', () => {
    it('renders with default labels and confirms', async () => {
      const wrapper = mount(BaseConfirmDialog, {
        props: { isOpen: true, title: 'Hapus Item', message: 'Yakin hapus?' },
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      expect(wrapper.text()).toContain('Hapus Item')
      expect(wrapper.text()).toContain('Yakin hapus?')

      const buttons = wrapper.findAll('button')
      const confirmBtn = buttons.find(b => b.text().includes('HAPUS'))
      expect(confirmBtn).toBeDefined()

      await confirmBtn!.trigger('click')
      expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('cancels and emits cancel', async () => {
      const wrapper = mount(BaseConfirmDialog, {
        props: { isOpen: true },
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      const buttons = wrapper.findAll('button')
      const cancelBtn = buttons.find(b => b.text().includes('BATAL'))
      expect(cancelBtn).toBeDefined()

      await cancelBtn!.trigger('click')
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('renders loading state and disables actions', () => {
      const wrapper = mount(BaseConfirmDialog, {
        props: { isOpen: true, loading: true },
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      expect(wrapper.text()).toContain('MEMPROSES...')
    })

    it('supports warning variant icon and styling', () => {
      const wrapper = mount(BaseConfirmDialog, {
        props: { isOpen: true, variant: 'warning' },
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('BaseSuccessModal', () => {
    it('renders custom title and subtitle', () => {
      const wrapper = mount(BaseSuccessModal, {
        props: { isOpen: true, title: 'Sukses Tambah', subtitle: 'Data baru berhasil ditambahkan' },
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      expect(wrapper.text()).toContain('Sukses Tambah')
      expect(wrapper.text()).toContain('Data baru berhasil ditambahkan')
    })
  })

  describe('BaseSessionExpiredModal', () => {
    it('renders session expired title and remaining seconds', () => {
      const wrapper = mount(BaseSessionExpiredModal, {
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      expect(wrapper.text()).toContain('Sesi Anda Telah Kedaluwarsa')
      expect(wrapper.text()).toContain('7s')
    })

    it('calls confirmExpiredLogout on button click', async () => {
      const wrapper = mount(BaseSessionExpiredModal, {
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      const btn = wrapper.find('button')
      await btn.trigger('click')
      expect(mockConfirmExpiredLogout).toHaveBeenCalled()
    })
  })

  describe('BaseIdleWarningModal', () => {
    it('renders idle warning title and countdown', () => {
      const wrapper = mount(BaseIdleWarningModal, {
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      expect(wrapper.text()).toContain('Sesi Anda Segera Berakhir')
      expect(wrapper.text()).toContain('00:45')
    })

    it('handles extend session on click', async () => {
      const wrapper = mount(BaseIdleWarningModal, {
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      const extendBtn = wrapper.findAll('button').find(b => b.text().includes('Lanjutkan Sesi'))
      expect(extendBtn).toBeDefined()
      await extendBtn!.trigger('click')
      expect(mockExtendSession).toHaveBeenCalled()
    })

    it('handles timeout on click', async () => {
      const wrapper = mount(BaseIdleWarningModal, {
        global: { stubs: { VueFinalModal: VueFinalModalStub } },
      })
      const timeoutBtn = wrapper.findAll('button').find(b => b.text().includes('Keluar Sekarang'))
      expect(timeoutBtn).toBeDefined()
      await timeoutBtn!.trigger('click')
      expect(mockHandleTimeout).toHaveBeenCalled()
    })
  })
})
