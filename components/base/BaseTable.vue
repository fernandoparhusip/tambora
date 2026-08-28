<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { gsap } from "gsap";
import type { TableColumn } from "~/types";

interface Props {
  columns: TableColumn[];
  rows: any[];
  loading?: boolean;
  enableColumnToggle?: boolean;
  tableId?: string; // Optional id to persist column visibility preferences
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  enableColumnToggle: true,
  tableId: "",
});

// Table body ref for GSAP row stagger animations
const tbodyRef = ref<HTMLTableSectionElement | null>(null);

const animateRows = () => {
  if (!import.meta.client || !tbodyRef.value) return;
  nextTick(() => {
    const rowEls = tbodyRef.value?.querySelectorAll("tr.table-data-row");
    if (rowEls && rowEls.length > 0) {
      gsap.fromTo(
        rowEls,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.24,
          stagger: 0.02,
          ease: "power2.out",
          clearProps: "transform,opacity",
        }
      );
    }
  });
};

watch(
  () => props.rows,
  () => {
    if (!props.loading) {
      animateRows();
    }
  },
  { deep: true }
);

watch(
  () => props.loading,
  (isLoading) => {
    if (!isLoading) {
      animateRows();
    }
  }
);

onMounted(() => {
  if (!props.loading && props.rows.length > 0) {
    animateRows();
  }
});

// Dropdown popover state
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Initialize visible column keys
const getInitialVisibleKeys = (): string[] => {
  if (props.tableId && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`tambora_table_cols_${props.tableId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure mandatory columns (like actions) are always included
          const validKeys = props.columns.map((c) => c.key);
          const filtered = parsed.filter((k) => validKeys.includes(k));
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return props.columns
    .filter((col) => !col.defaultHidden)
    .map((col) => col.key);
};

const visibleKeys = ref<string[]>(getInitialVisibleKeys());

// Keep visibleKeys in sync if columns prop changes
watch(
  () => props.columns,
  (newCols) => {
    const allNewKeys = newCols.map((c) => c.key);
    const existing = visibleKeys.value.filter((k) => allNewKeys.includes(k));
    const missing = newCols
      .filter((c) => !c.defaultHidden && !existing.includes(c.key))
      .map((c) => c.key);
    visibleKeys.value = [...existing, ...missing];
  },
  { deep: true }
);

// Save to localStorage when changed
watch(
  visibleKeys,
  (newKeys) => {
    if (props.tableId && typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `tambora_table_cols_${props.tableId}`,
          JSON.stringify(newKeys)
        );
      } catch {
        // Ignore localStorage errors
      }
    }
  },
  { deep: true }
);

// Filter visible columns for table rendering
const visibleColumns = computed(() => {
  return props.columns.filter((col) => visibleKeys.value.includes(col.key));
});

// Helper to check if a column cannot be hidden (e.g. actions or explicitly hideable: false)
const isColumnLocked = (col: TableColumn) => {
  if (col.hideable === false) return true;
  if (col.key === "actions") return true;
  return false;
};

// Toggle column visibility
const toggleColumn = (col: TableColumn) => {
  if (isColumnLocked(col)) return;

  const key = col.key;
  if (visibleKeys.value.includes(key)) {
    // Prevent hiding all columns
    if (visibleKeys.value.length <= 1) return;
    visibleKeys.value = visibleKeys.value.filter((k) => k !== key);
  } else {
    visibleKeys.value.push(key);
  }
};

// Quick actions
const selectAllColumns = () => {
  visibleKeys.value = props.columns.map((c) => c.key);
};

const resetDefaultColumns = () => {
  visibleKeys.value = props.columns
    .filter((col) => !col.defaultHidden)
    .map((col) => col.key);
};

// Click outside handler for dropdown
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("click", handleClickOutside);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("click", handleClickOutside);
  }
});
</script>

<template>
  <div class="w-full flex flex-col flex-1 overflow-hidden">
    <!-- Top Table Header Toolbar (if Column Toggle is enabled) -->
    <div
      v-if="enableColumnToggle && columns.length > 0"
      class="flex items-center justify-between pb-2.5 px-1"
    >
      <div class="flex items-center gap-2">
        <slot name="toolbar-left" />
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <slot name="toolbar-right" />

        <!-- Column Visibility Dropdown Trigger -->
        <div ref="dropdownRef" class="relative">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200/80 rounded-lg shadow-2xs transition-all cursor-pointer select-none"
            :class="{ 'border-blue-500 text-blue-600 ring-1 ring-blue-500/20': isDropdownOpen }"
            title="Kelola visibilitas kolom tabel"
            @click.stop="isDropdownOpen = !isDropdownOpen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="M15 3v18" />
            </svg>
            <span>Kolom</span>
            <span
              class="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-gray-100 text-gray-600"
            >
              {{ visibleColumns.length }}/{{ columns.length }}
            </span>
          </button>

          <!-- Column Visibility Popover Menu -->
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-200/80 z-50 py-2 divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-100"
            @click.stop
          >
            <div class="px-3 py-1.5 flex items-center justify-between">
              <span class="text-xs font-bold text-[#2C3E50]">Tampilkan Kolom</span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  @click="selectAllColumns"
                >
                  Semua
                </button>
                <span class="text-gray-300 text-xs">|</span>
                <button
                  type="button"
                  class="text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer"
                  @click="resetDefaultColumns"
                >
                  Reset
                </button>
              </div>
            </div>

            <!-- List of columns with checkboxes -->
            <div class="max-h-60 overflow-y-auto px-1 py-1 space-y-0.5">
              <label
                v-for="col in columns"
                :key="col.key"
                class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors select-none"
                :class="[
                  isColumnLocked(col)
                    ? 'opacity-60 cursor-not-allowed text-gray-400'
                    : 'cursor-pointer text-gray-700',
                ]"
              >
                <input
                  type="checkbox"
                  class="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-gray-300 transition-colors"
                  :checked="visibleKeys.includes(col.key)"
                  :disabled="isColumnLocked(col)"
                  @change="toggleColumn(col)"
                >
                <span class="truncate flex-1 font-medium">{{ col.label }}</span>
                <span
                  v-if="isColumnLocked(col)"
                  class="text-[9px] text-gray-400 uppercase font-semibold tracking-wider"
                >
                  Terkunci
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Wrapper: Scrollable flex-1 -->
    <div
      class="flex-1 overflow-auto rounded-xl border border-gray-100 bg-white"
    >
      <table class="w-full text-left border-collapse min-w-[800px]">
        <!-- Table Header -->
        <thead class="sticky top-0 bg-white border-b border-gray-100 z-20">
          <tr>
            <th
              v-for="col in visibleColumns"
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
        <tbody ref="tbodyRef" class="divide-y divide-gray-50">
          <!-- Shimmer Skeleton Loading State (5 animated skeleton rows) -->
          <template v-if="loading">
            <tr
              v-for="sIdx in 5"
              :key="`skeleton-${sIdx}`"
              class="animate-pulse"
            >
              <td
                v-for="col in visibleColumns"
                :key="`skel-col-${col.key}`"
                class="py-4 px-4 whitespace-nowrap"
              >
                <div
                  class="h-3.5 bg-gradient-to-r from-gray-100 via-gray-200/70 to-gray-100 rounded-md"
                  :style="{
                    width: col.key === 'actions' ? '60px' : col.key === 'id' || col.key === 'no' ? '28px' : `${40 + (sIdx * 11) % 45}%`,
                  }"
                />
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <tr v-else-if="rows.length === 0">
            <td
              :colspan="visibleColumns.length"
              class="py-12 text-center text-gray-400 text-xs"
            >
              Tidak ada data tersedia.
            </td>
          </tr>

          <!-- Data Rows (GSAP Stagger Animated) -->
          <tr
            v-for="(row, idx) in rows"
            v-else
            :key="row.id || idx"
            class="table-data-row hover:bg-[#F6FAFD] transition-colors group"
          >
            <td
              v-for="col in visibleColumns"
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
