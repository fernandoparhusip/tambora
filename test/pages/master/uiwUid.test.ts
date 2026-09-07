import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import UiwUidPage from '~/pages/home/master/uiw-uid.vue'
import { pageComponentStubs } from '../../helpers/pageMocks'

vi.mock('~/composables/master/useUiwUid', () => ({
  useUiwUid: () => ({
    uiwUids: ref([
      { id: 'u1', kode: 'UIW-01', nama: 'UIW Jawa Barat', alamat: 'Bandung', keterangan: '' },
    ]),
    loading: ref(false), detailLoading: ref(false),
    fetchUiwUids: vi.fn().mockResolvedValue([]),
    getUiwUidById: vi.fn().mockResolvedValue({}),
    createUiwUid: vi.fn().mockResolvedValue({}),
    updateUiwUid: vi.fn().mockResolvedValue({}),
    deleteUiwUid: vi.fn().mockResolvedValue({}),
  })
}))
vi.mock('~/composables/useAsyncDetail', () => ({
  useAsyncDetail: () => ({
    isDetailModalOpen: ref(false), detailRecord: ref(null), detailLoading: ref(false),
    handleView: vi.fn(), closeDetailModal: vi.fn(), openEditFromDetail: vi.fn(),
  })
}))
describe('UIW/UID Page', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('mounts without errors and exercises CRUD flows', async () => {
    const wrapper = mount(UiwUidPage, { global: { stubs: pageComponentStubs } })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-table').exists()).toBe(true)

    // Search
    const searchInput = wrapper.find('input[type="text"]')
    if (searchInput.exists()) {
      await searchInput.setValue('UIW')
    }

    // Create & Submit
    const createBtn = wrapper.find('.stub-create')
    if (createBtn.exists()) await createBtn.trigger('click')

    const submitBtn = wrapper.find('.stub-modal-submit')
    if (submitBtn.exists()) await submitBtn.trigger('click')

    // Edit
    const editBtn = wrapper.find('.stub-table-edit') || wrapper.find('.stub-action-edit')
    if (editBtn.exists()) {
      await editBtn.trigger('click')
      if (submitBtn.exists()) await submitBtn.trigger('click')
    }

    // View detail
    const viewBtn = wrapper.find('.stub-table-view') || wrapper.find('.stub-action-view')
    if (viewBtn.exists()) await viewBtn.trigger('click')

    const detailEdit = wrapper.find('.stub-detail-edit')
    if (detailEdit.exists()) await detailEdit.trigger('click')

    const detailClose = wrapper.find('.stub-detail-close')
    if (detailClose.exists()) await detailClose.trigger('click')

    // Delete
    const deleteBtn = wrapper.find('.stub-table-delete') || wrapper.find('.stub-action-delete')
    if (deleteBtn.exists()) await deleteBtn.trigger('click')

    const confirmBtn = wrapper.find('.stub-confirm-ok')
    if (confirmBtn.exists()) await confirmBtn.trigger('click')

    // Export
    const exportBtn = wrapper.find('.stub-export')
    if (exportBtn.exists()) await exportBtn.trigger('click')
  })
})
