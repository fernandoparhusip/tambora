<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { DetailDataItem } from '~/types/master.types';
import { exportToExcel } from '~/utils/exportExcel'
import type { TableColumn, PermissionItem } from '~/types'

const { permissions, loading, fetchPermissions } = usePermission()

const searchQuery = ref('')
const selectedResource = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Detail Modal State
const isDetailModalOpen = ref(false)
const detailRecord = ref<PermissionItem | null>(null)

const permissionColumns: TableColumn[] = [
  { key: 'no', label: 'No' },
  { key: 'permission_key', label: 'Permission Key' },
  { key: 'resource_name', label: 'Resource' },
  { key: 'action_name', label: 'Aksi' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'actions', label: 'Aksi' },
]

onMounted(async () => {
  await fetchPermissions()
})

// Dynamic Resource unique options
const resourceList = computed(() => {
  const set = new Set<string>()
  permissions.value.forEach((p) => {
    if (p.resource_code) set.add(p.resource_code)
  })
  return Array.from(set).sort()
})

const resourceSelectOptions = computed(() => [
  { label: 'Semua Resource', value: '' },
  ...resourceList.value.map(r => ({ label: r, value: r })),
])

// Reset pagination
watch([searchQuery, selectedResource], () => {
  currentPage.value = 1
})

const filteredRows = computed(() => {
  let list = permissions.value
  if (selectedResource.value) {
    list = list.filter(p => p.resource_code === selectedResource.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      p =>
        p.permission_key.toLowerCase().includes(q)
        || p.description.toLowerCase().includes(q)
        || (p.resource_name && p.resource_name.toLowerCase().includes(q)),
    )
  }
  return list
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const handleExport = () => {
  exportToExcel(permissionColumns, filteredRows.value, {
    fileName: 'Katalog_Hak_Akses_PLN',
  })
}

const handleView = (row: PermissionItem) => {
  detailRecord.value = row
  isDetailModalOpen.value = true
}

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return []
  return [
    { label: 'Permission Key', value: detailRecord.value.permission_key },
    { label: 'Resource', value: detailRecord.value.resource_name || detailRecord.value.resource_code },
    { label: 'Resource Code', value: detailRecord.value.resource_code },
    {
      label: 'Action',
      value: detailRecord.value.action_name || detailRecord.value.action_code,
      isStatus: true,
    },
    { label: 'Deskripsi', value: detailRecord.value.description || '-' },
    { label: 'ID Permission', value: detailRecord.value.id },
  ]
})
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#F4F7FE]">
    <!-- Top White Page Header -->
    <BasePageHeader />

    <!-- Container Padding -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <!-- White Main Card Container -->
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Action Header Bar -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Key atau Resource..." />

            <!-- Modern Premium BaseSelect Component -->
            <BaseSelect
              v-model="selectedResource"
              :options="resourceSelectOptions"
              placeholder="Semua Resource"
              width-class="w-60"
            />
            <BaseExportButton @click="handleExport" />
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 font-medium">
              Total: {{ filteredRows.length }} Hak Akses
            </span>
          </div>
        </div>

        <!-- Permission Table -->
        <BaseTable
          :columns="permissionColumns"
          :rows="paginatedRows"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #permission_key-data="{ row }">
            <BaseBadge variant="primary">
              {{ row.permission_key }}
            </BaseBadge>
          </template>

          <template #resource_name-data="{ row }">
            <div class="flex flex-col">
              <span class="text-xs text-gray-900 font-medium">{{ row.resource_name || row.resource_code }}</span>
              <span class="text-[10px] text-gray-400 font-mono">{{ row.resource_code }}</span>
            </div>
          </template>

          <template #action_name-data="{ row }">
            <BaseBadge
              :variant="
                row.action_code === 'CREATE'
                  ? 'success'
                  : row.action_code === 'UPDATE' || row.action_code === 'EDIT'
                    ? 'warning'
                    : row.action_code === 'DELETE'
                      ? 'danger'
                      : 'info'
              "
            >
              {{ row.action_name || row.action_code }}
            </BaseBadge>
          </template>

          <template #description-data="{ row }">
            <span class="text-xs text-gray-600 font-normal">
              {{ row.description || '-' }}
            </span>
          </template>

          <!-- View Action Button -->
          <template #actions-data="{ row }">
            <div class="flex items-center justify-end">
              <BaseActionButton type="view" title="Lihat Detail Permission" @click="handleView(row)" />
            </div>
          </template>
        </BaseTable>

        <!-- Pagination -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredRows.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- View Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Hak Akses (Permission)"
      subtitle="Katalog Definisi Resource & Action RBAC"
      :data-items="detailDataItems"
    />
  </div>
</template>
