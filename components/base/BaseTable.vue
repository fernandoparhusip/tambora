<script setup lang="ts">
export interface TableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  stickyLeft?: boolean;
  stickyRight?: boolean;
}

defineProps<{
  columns: TableColumn[];
  rows: any[];
  loading?: boolean;
}>();
</script>

<template>
  <div class="w-full flex flex-col flex-1 overflow-hidden">
    <!-- Table Wrapper: Scrollable flex-1 -->
    <div
      class="flex-1 overflow-auto rounded-xl border border-gray-100 bg-white"
    >
      <table class="w-full text-left border-collapse min-w-[800px]">
        <!-- Table Header -->
        <thead class="sticky top-0 bg-white border-b border-gray-100 z-20">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 select-none whitespace-nowrap"
              :class="[
                col.align === 'right'
                  ? 'text-right'
                  : col.align === 'center'
                    ? 'text-center'
                    : 'text-left',
                col.stickyLeft
                  ? 'sticky left-0 bg-white z-30 shadow-[6px_0_10px_-4px_rgba(0,0,0,0.06)]'
                  : '',
                col.key === 'actions' || col.stickyRight
                  ? 'sticky right-0 bg-white z-30 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]'
                  : '',
              ]"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-gray-50">
          <!-- Loading State -->
          <tr v-if="loading">
            <td
              :colspan="columns.length"
              class="py-12 text-center text-gray-400 text-xs"
            >
              <div class="flex items-center justify-center gap-2">
                <svg
                  class="animate-spin h-4 w-4 text-[#2563EB]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Memuat data...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="rows.length === 0">
            <td
              :colspan="columns.length"
              class="py-12 text-center text-gray-400 text-xs"
            >
              Tidak ada data tersedia.
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-for="(row, idx) in rows"
            v-else
            :key="row.id || idx"
            class="hover:bg-[#F6FAFD] transition-colors group"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="py-3.5 px-4 text-xs text-gray-700 whitespace-nowrap"
              :class="[
                col.align === 'right'
                  ? 'text-right'
                  : col.align === 'center'
                    ? 'text-center'
                    : 'text-left',
                col.stickyLeft
                  ? 'sticky left-0 bg-white group-hover:bg-[#F6FAFD] transition-colors z-10 shadow-[6px_0_10px_-4px_rgba(0,0,0,0.06)]'
                  : '',
                col.key === 'actions' || col.stickyRight
                  ? 'sticky right-0 bg-white group-hover:bg-[#F6FAFD] transition-colors z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]'
                  : '',
              ]"
            >
              <!-- Dynamic slot per column (e.g. #status-data, #actions-data, #statusLogin-data) -->
              <slot :name="`${col.key}-data`" :row="row" :index="idx">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
