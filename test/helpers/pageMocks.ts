/**
 * Shared test helpers and mock factories for Vue page tests.
 * Pages use heavily auto-imported composables, so we centralize mocking.
 */
import { vi } from 'vitest'
import { ref } from 'vue'

// ────────────────────────────────────────────────────────────────────────────────
// Factory: creates a mock CRUD composable (useRegional, useAsset, etc.)
// ────────────────────────────────────────────────────────────────────────────────
export function createMockCrudComposable(listData: any[] = []) {
  return () => ({
    loading: ref(false),
    detailLoading: ref(false),
    total: ref(listData.length),
    error: ref(null),
    // Generic list refs — callers override the key name if needed
    ...Object.fromEntries(
      ['assets', 'regionalList', 'organizations', 'sentralList', 'rantingList',
       'cabangList', 'systems', 'machineConditions', 'uiwUids', 'aksesGrups',
       'aksesLevels', 'scopeTypeOptions', 'permissions', 'drivers',
       'uikList', 'unitLayanans', 'up2dList', 'upkList', 'users', 'menuList',
       'sentrals', 'currentSentral'].map(k => [k, ref(listData)])
    ),
    // CRUD functions
    fetchAssets: vi.fn().mockResolvedValue(listData),
    fetchRegional: vi.fn().mockResolvedValue(listData),
    fetchOrganizations: vi.fn().mockResolvedValue(listData),
    fetchSentral: vi.fn().mockResolvedValue(listData),
    fetchSentrals: vi.fn().mockResolvedValue(listData),
    fetchRanting: vi.fn().mockResolvedValue(listData),
    fetchCabang: vi.fn().mockResolvedValue(listData),
    fetchSystems: vi.fn().mockResolvedValue(listData),
    fetchMachineConditions: vi.fn().mockResolvedValue(listData),
    fetchUiwUids: vi.fn().mockResolvedValue(listData),
    fetchAksesGrups: vi.fn().mockResolvedValue(listData),
    fetchAksesLevels: vi.fn().mockResolvedValue(listData),
    fetchScopeTypeCombo: vi.fn().mockResolvedValue([]),
    fetchPermissions: vi.fn().mockResolvedValue(listData),
    fetchDrivers: vi.fn().mockResolvedValue(listData),
    fetchUik: vi.fn().mockResolvedValue(listData),
    fetchUnitLayanan: vi.fn().mockResolvedValue(listData),
    fetchUp2d: vi.fn().mockResolvedValue(listData),
    fetchUpk: vi.fn().mockResolvedValue(listData),
    fetchUsers: vi.fn().mockResolvedValue(listData),
    fetchMenus: vi.fn().mockResolvedValue(listData),
    // Get by ID
    getAssetById: vi.fn().mockResolvedValue(listData[0] || {}),
    getRegionalById: vi.fn().mockResolvedValue(listData[0] || {}),
    getOrganizationById: vi.fn().mockResolvedValue(listData[0] || {}),
    getSentralById: vi.fn().mockResolvedValue(listData[0] || {}),
    getRantingById: vi.fn().mockResolvedValue(listData[0] || {}),
    getUiwUidById: vi.fn().mockResolvedValue(listData[0] || {}),
    getAksesGrupById: vi.fn().mockResolvedValue(listData[0] || {}),
    getAksesLevelById: vi.fn().mockResolvedValue(listData[0] || {}),
    // Mutators
    createAsset: vi.fn().mockResolvedValue({}),
    updateAsset: vi.fn().mockResolvedValue({}),
    deleteAsset: vi.fn().mockResolvedValue({}),
    createRegional: vi.fn().mockResolvedValue({}),
    updateRegional: vi.fn().mockResolvedValue({}),
    deleteRegional: vi.fn().mockResolvedValue({}),
    createOrganization: vi.fn().mockResolvedValue({}),
    updateOrganization: vi.fn().mockResolvedValue({}),
    deleteOrganization: vi.fn().mockResolvedValue({}),
    createSentral: vi.fn().mockResolvedValue({}),
    updateSentral: vi.fn().mockResolvedValue({}),
    deleteSentral: vi.fn().mockResolvedValue({}),
    approveSentral: vi.fn().mockResolvedValue({}),
    createRanting: vi.fn().mockResolvedValue({}),
    updateRanting: vi.fn().mockResolvedValue({}),
    deleteRanting: vi.fn().mockResolvedValue({}),
    createUiwUid: vi.fn().mockResolvedValue({}),
    updateUiwUid: vi.fn().mockResolvedValue({}),
    deleteUiwUid: vi.fn().mockResolvedValue({}),
    createAksesGrup: vi.fn().mockResolvedValue({}),
    updateAksesGrup: vi.fn().mockResolvedValue({}),
    deleteAksesGrup: vi.fn().mockResolvedValue({}),
    createAksesLevel: vi.fn().mockResolvedValue({}),
    updateAksesLevel: vi.fn().mockResolvedValue({}),
    deleteAksesLevel: vi.fn().mockResolvedValue({}),
  })
}

// ────────────────────────────────────────────────────────────────────────────────
// Global stubs for child components used in pages
// ────────────────────────────────────────────────────────────────────────────────
export const pageComponentStubs = {
  BasePageHeader: { template: '<div class="stub-header" />' },
  BaseSearchInput: { template: '<input class="stub-search" />', props: ['modelValue'] },
  BaseCreateButton: { template: '<button class="stub-create" @click="$emit(\'click\')" />', props: ['resource'], emits: ['click'] },
  BaseTable: {
    template: `
      <div class="stub-table">
        <slot />
        <button class="stub-table-view" @click="$emit('view', rows?.[0] || { id: 'test-1' })" />
        <button class="stub-table-edit" @click="$emit('edit', rows?.[0] || { id: 'test-1' })" />
        <button class="stub-table-delete" @click="$emit('delete', rows?.[0] || { id: 'test-1' })" />
      </div>
    `,
    props: ['columns', 'rows', 'loading'],
    emits: ['view', 'edit', 'delete'],
  },
  BasePagination: { template: '<div class="stub-pagination" />', props: ['total', 'currentPage', 'pageSize'] },
  BaseFormModal: {
    template: `
      <div class="stub-form-modal">
        <button class="stub-modal-submit" @click="$emit('submit', formData || {})" />
        <button class="stub-modal-close" @click="$emit('close')" />
      </div>
    `,
    props: ['isOpen', 'formData', 'title', 'subtitle', 'sections', 'submitting'],
    emits: ['submit', 'close'],
  },
  BaseConfirmDialog: {
    template: `
      <div class="stub-confirm">
        <button class="stub-confirm-ok" @click="$emit('confirm')" />
        <button class="stub-confirm-cancel" @click="$emit('cancel')" />
      </div>
    `,
    props: ['isOpen', 'title', 'message', 'loading'],
    emits: ['confirm', 'cancel'],
  },
  BaseSuccessModal: { template: '<div class="stub-success" />', props: ['isOpen'] },
  BaseDetailModal: {
    template: `
      <div class="stub-detail">
        <button class="stub-detail-close" @click="$emit('close')" />
        <button class="stub-detail-edit" @click="$emit('edit', record)" />
      </div>
    `,
    props: ['isOpen', 'title', 'subtitle', 'record', 'dataItems', 'loading'],
    emits: ['close', 'edit'],
  },
  BaseTableActions: {
    template: `
      <div class="stub-actions">
        <button class="stub-action-view" @click="$emit('view')" />
        <button class="stub-action-edit" @click="$emit('edit')" />
        <button class="stub-action-delete" @click="$emit('delete')" />
      </div>
    `,
    props: ['resource'],
    emits: ['view', 'edit', 'delete'],
  },
  BaseTabFilter: { template: '<div class="stub-tab" />' },
  BaseExportButton: { template: '<button class="stub-export" @click="$emit(\'click\')" />', emits: ['click'] },
  BaseDateFilter: { template: '<div class="stub-date-filter" />' },
  BaseSelect: { template: '<div class="stub-select" />' },
  BaseBadge: { template: '<span class="stub-badge"><slot /></span>' },
  BaseActionButton: { template: '<button class="stub-action-btn"><slot /></button>' },
  ClientOnly: { template: '<div><slot /></div>' },
  NuxtLink: { template: '<a><slot /></a>', props: ['to'] },
}
