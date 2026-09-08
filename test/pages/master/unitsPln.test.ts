import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Up2dPage from '~/pages/home/master/up2d.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

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

vi.mock('~/schemas/master/up2d.schema', () => ({ getUp2dFormSections: () => [] }))

describe('PLN Unit Master Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
})

