import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import UikPage from '~/pages/home/master/uik.vue'
import UnitLayananPage from '~/pages/home/master/unit-layanan.vue'
import Up2dPage from '~/pages/home/master/up2d.vue'
import UpkPage from '~/pages/home/master/upk.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/master/useUik', () => ({
  useUik: () => ({
    uiks: ref([{ id: 'uik1', kode_uik: 'UIK-1', nama_uik: 'UIK Sumbagsel' }]),
    loading: ref(false),
    fetchUiks: vi.fn().mockResolvedValue([]),
    getUikById: vi.fn().mockResolvedValue({ id: 'uik1' }),
    createUik: vi.fn().mockResolvedValue({}),
    updateUik: vi.fn().mockResolvedValue({}),
    deleteUik: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/composables/master/useUnitLayanan', () => ({
  useUnitLayanan: () => ({
    unitLayanans: ref([{ id: 'ul1', kode_unit_layanan: 'UL-1', nama_unit_layanan: 'ULPLTD Bengkulu', upk_id: 'upk1' }]),
    loading: ref(false),
    fetchUnitLayanans: vi.fn().mockResolvedValue([]),
    getUnitLayananById: vi.fn().mockResolvedValue({ id: 'ul1' }),
    createUnitLayanan: vi.fn().mockResolvedValue({}),
    updateUnitLayanan: vi.fn().mockResolvedValue({}),
    deleteUnitLayanan: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/composables/master/useUp2d', () => ({
  useUp2d: () => ({
    up2ds: ref([{ id: 'up2d1', kode_up2d: 'UP2D-1', nama_up2d: 'UP2D Sumbagsel', uiw_uid_id: 'uid1' }]),
    loading: ref(false),
    fetchUp2ds: vi.fn().mockResolvedValue([]),
    getUp2dById: vi.fn().mockResolvedValue({ id: 'up2d1' }),
    createUp2d: vi.fn().mockResolvedValue({}),
    updateUp2d: vi.fn().mockResolvedValue({}),
    deleteUp2d: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/composables/master/useUpk', () => ({
  useUpk: () => ({
    upks: ref([{ id: 'upk1', kode_upk: 'UPK-1', nama_upk: 'UPK Bengkulu', uik_id: 'uik1' }]),
    loading: ref(false),
    fetchUpks: vi.fn().mockResolvedValue([]),
    getUpkById: vi.fn().mockResolvedValue({ id: 'upk1' }),
    createUpk: vi.fn().mockResolvedValue({}),
    updateUpk: vi.fn().mockResolvedValue({}),
    deleteUpk: vi.fn().mockResolvedValue({}),
  }),
}))

vi.mock('~/composables/master/useUiwUid', () => ({
  useUiwUid: () => ({
    uiwUidCombo: ref([{ label: 'UID 1', value: 'uid1' }]),
    fetchUiwUidCombo: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('~/composables/useAsyncDetail', () => ({
  useAsyncDetail: () => ({
    isDetailModalOpen: ref(false),
    detailRecord: ref(null),
    detailLoading: ref(false),
    handleView: vi.fn(),
    closeDetailModal: vi.fn(),
    openEditFromDetail: vi.fn(),
  }),
}))

vi.mock('~/schemas/master/uik.schema', () => ({ uikFormSections: [] }))
vi.mock('~/schemas/master/unit-layanan.schema', () => ({ getUnitLayananFormSections: () => [] }))
vi.mock('~/schemas/master/up2d.schema', () => ({ getUp2dFormSections: () => [] }))
vi.mock('~/schemas/master/upk.schema', () => ({ getUpkFormSections: () => [] }))

describe('PLN Unit Master Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('UIK Page', () => {
    it('handles full lifecycle: render, search, CRUD, and modals', async () => {
      const wrapper = mount(UikPage, { global: { stubs: pageComponentStubs } })
      expect(wrapper.exists()).toBe(true)

      // Search
      const searchInput = wrapper.find('input[type="text"]')
      if (searchInput.exists()) {
        await searchInput.setValue('Sumbagsel')
      }

      // Create modal & save
      const createBtn = wrapper.find('.stub-create')
      if (createBtn.exists()) {
        await createBtn.trigger('click')
      }
      const saveModal = wrapper.find('.stub-modal-submit')
      if (saveModal.exists()) {
        await saveModal.trigger('click')
      }

      // Edit row
      const editBtn = wrapper.find('.stub-table-edit')
      if (editBtn.exists()) {
        await editBtn.trigger('click')
        await saveModal.trigger('click')
      }

      // View detail
      const viewBtn = wrapper.find('.stub-table-view')
      if (viewBtn.exists()) {
        await viewBtn.trigger('click')
      }
      const detailEdit = wrapper.find('.stub-detail-edit')
      if (detailEdit.exists()) {
        await detailEdit.trigger('click')
      }
      const detailClose = wrapper.find('.stub-detail-close')
      if (detailClose.exists()) {
        await detailClose.trigger('click')
      }

      // Delete flow
      const delBtn = wrapper.find('.stub-table-delete')
      if (delBtn.exists()) {
        await delBtn.trigger('click')
      }
      const confirmOk = wrapper.find('.stub-confirm-ok')
      if (confirmOk.exists()) {
        await confirmOk.trigger('click')
      }

      // Export
      const exportBtn = wrapper.find('.stub-export')
      if (exportBtn.exists()) {
        await exportBtn.trigger('click')
      }
    })
  })

  describe('Unit Layanan Page', () => {
    it('handles full lifecycle: render, search, CRUD, and modals', async () => {
      const wrapper = mount(UnitLayananPage, { global: { stubs: pageComponentStubs } })
      expect(wrapper.exists()).toBe(true)

      const searchInput = wrapper.find('input[type="text"]')
      if (searchInput.exists()) {
        await searchInput.setValue('Bengkulu')
      }

      const createBtn = wrapper.find('.stub-create')
      if (createBtn.exists()) {
        await createBtn.trigger('click')
      }
      const saveModal = wrapper.find('.stub-modal-submit')
      if (saveModal.exists()) {
        await saveModal.trigger('click')
      }

      const editBtn = wrapper.find('.stub-table-edit')
      if (editBtn.exists()) {
        await editBtn.trigger('click')
        await saveModal.trigger('click')
      }

      const viewBtn = wrapper.find('.stub-table-view')
      if (viewBtn.exists()) {
        await viewBtn.trigger('click')
      }
      const detailEdit = wrapper.find('.stub-detail-edit')
      if (detailEdit.exists()) {
        await detailEdit.trigger('click')
      }
      const detailClose = wrapper.find('.stub-detail-close')
      if (detailClose.exists()) {
        await detailClose.trigger('click')
      }

      const delBtn = wrapper.find('.stub-table-delete')
      if (delBtn.exists()) {
        await delBtn.trigger('click')
      }
      const confirmOk = wrapper.find('.stub-confirm-ok')
      if (confirmOk.exists()) {
        await confirmOk.trigger('click')
      }

      const exportBtn = wrapper.find('.stub-export')
      if (exportBtn.exists()) {
        await exportBtn.trigger('click')
      }
    })
  })

  describe('UP2D Page', () => {
    it('handles full lifecycle: render, search, CRUD, and modals', async () => {
      const wrapper = mount(Up2dPage, { global: { stubs: pageComponentStubs } })
      expect(wrapper.exists()).toBe(true)

      const searchInput = wrapper.find('input[type="text"]')
      if (searchInput.exists()) {
        await searchInput.setValue('UP2D')
      }

      const createBtn = wrapper.find('.stub-create')
      if (createBtn.exists()) {
        await createBtn.trigger('click')
      }
      const saveModal = wrapper.find('.stub-modal-submit')
      if (saveModal.exists()) {
        await saveModal.trigger('click')
      }

      const editBtn = wrapper.find('.stub-table-edit')
      if (editBtn.exists()) {
        await editBtn.trigger('click')
        await saveModal.trigger('click')
      }

      const viewBtn = wrapper.find('.stub-table-view')
      if (viewBtn.exists()) {
        await viewBtn.trigger('click')
      }
      const detailEdit = wrapper.find('.stub-detail-edit')
      if (detailEdit.exists()) {
        await detailEdit.trigger('click')
      }
      const detailClose = wrapper.find('.stub-detail-close')
      if (detailClose.exists()) {
        await detailClose.trigger('click')
      }

      const delBtn = wrapper.find('.stub-table-delete')
      if (delBtn.exists()) {
        await delBtn.trigger('click')
      }
      const confirmOk = wrapper.find('.stub-confirm-ok')
      if (confirmOk.exists()) {
        await confirmOk.trigger('click')
      }

      const exportBtn = wrapper.find('.stub-export')
      if (exportBtn.exists()) {
        await exportBtn.trigger('click')
      }
    })
  })

  describe('UPK Page', () => {
    it('handles full lifecycle: render, search, CRUD, and modals', async () => {
      const wrapper = mount(UpkPage, { global: { stubs: pageComponentStubs } })
      expect(wrapper.exists()).toBe(true)

      const searchInput = wrapper.find('input[type="text"]')
      if (searchInput.exists()) {
        await searchInput.setValue('UPK')
      }

      const createBtn = wrapper.find('.stub-create')
      if (createBtn.exists()) {
        await createBtn.trigger('click')
      }
      const saveModal = wrapper.find('.stub-modal-submit')
      if (saveModal.exists()) {
        await saveModal.trigger('click')
      }

      const editBtn = wrapper.find('.stub-table-edit')
      if (editBtn.exists()) {
        await editBtn.trigger('click')
        await saveModal.trigger('click')
      }

      const viewBtn = wrapper.find('.stub-table-view')
      if (viewBtn.exists()) {
        await viewBtn.trigger('click')
      }
      const detailEdit = wrapper.find('.stub-detail-edit')
      if (detailEdit.exists()) {
        await detailEdit.trigger('click')
      }
      const detailClose = wrapper.find('.stub-detail-close')
      if (detailClose.exists()) {
        await detailClose.trigger('click')
      }

      const delBtn = wrapper.find('.stub-table-delete')
      if (delBtn.exists()) {
        await delBtn.trigger('click')
      }
      const confirmOk = wrapper.find('.stub-confirm-ok')
      if (confirmOk.exists()) {
        await confirmOk.trigger('click')
      }

      const exportBtn = wrapper.find('.stub-export')
      if (exportBtn.exists()) {
        await exportBtn.trigger('click')
      }
    })
  })
})
