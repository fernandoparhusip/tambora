<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    total: number;
    currentPage?: number;
    pageSize?: number;
  }>(),
  {
    currentPage: 1,
    pageSize: 5,
  },
);

const emit = defineEmits<{
  "update:currentPage": [page: number];
  "update:pageSize": [size: number];
}>();

const pageSizeOptions = [5, 10, 20];
const showDropdown = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);
const pageSizeInput = ref(String(props.pageSize));

watch(
  () => props.pageSize,
  (newVal) => {
    pageSizeInput.value = String(newVal);
  },
  { immediate: true },
);

// Restrict keyboard input to numbers and navigation keys only
const handleKeyDown = (e: KeyboardEvent) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];
  if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
    return;
  }
  // Block non-numeric characters
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

// Handle number typing
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const cleanVal = target.value.replace(/\D/g, "");
  pageSizeInput.value = cleanVal;

  const num = parseInt(cleanVal, 10);
  if (!isNaN(num) && num > 0) {
    emit("update:pageSize", num);
    emit("update:currentPage", 1);
  }
};

// Fallback when blurred empty
const handleBlur = () => {
  const num = parseInt(pageSizeInput.value, 10);
  if (isNaN(num) || num <= 0) {
    const fallback = props.pageSize || 5;
    pageSizeInput.value = String(fallback);
    emit("update:pageSize", fallback);
    emit("update:currentPage", 1);
  }
};

// Select dropdown option
const selectOption = (opt: number) => {
  pageSizeInput.value = String(opt);
  emit("update:pageSize", opt);
  emit("update:currentPage", 1);
  showDropdown.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const totalPages = computed(() => Math.ceil(props.total / props.pageSize) || 1);

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit("update:currentPage", page);
  }
};

const visiblePages = computed(() => {
  const totalP = totalPages.value;
  const curr = props.currentPage;

  if (totalP <= 7) {
    return Array.from({ length: totalP }, (_, i) => i + 1);
  }

  if (curr <= 4) {
    return [1, 2, 3, 4, 5, "...", totalP];
  }

  if (curr >= totalP - 3) {
    return [1, "...", totalP - 4, totalP - 3, totalP - 2, totalP - 1, totalP];
  }

  return [1, "...", curr - 1, curr, curr + 1, "...", totalP];
});
</script>

<template>
  <div
    class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-gray-500 select-none border-t border-gray-50"
  >
    <!-- Left: Page size control & Total info -->
    <div class="flex items-center gap-2">
      <span>Menampilkan</span>

      <!-- Custom Page Size Input + Dropdown -->
      <div ref="dropdownRef" class="relative inline-flex items-center">
        <div
          class="inline-flex items-center bg-gray-100 hover:bg-gray-200/60 border border-gray-200 rounded-md focus-within:bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
        >
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            :value="pageSizeInput"
            class="w-9 h-[30px] text-center font-semibold text-gray-700 bg-transparent border-none focus:outline-none text-xs"
            title="Ketik jumlah data per halaman (khusus angka)"
            @keydown="handleKeyDown"
            @input="handleInput"
            @blur="handleBlur"
            @focus="showDropdown = true"
          >
          <button
            type="button"
            class="pr-1.5 pl-0.5 text-gray-400 hover:text-blue-600 focus:outline-none cursor-pointer"
            title="Pilih opsi data per halaman"
            @click.stop="showDropdown = !showDropdown"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3 h-3 stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <!-- Dropdown Popup Options (5, 10, 20) -->
        <div
          v-if="showDropdown"
          class="absolute bottom-full left-0 mb-1 w-24 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30"
        >
          <div
            class="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-0.5"
          >
            Opsi Data
          </div>
          <button
            v-for="opt in pageSizeOptions"
            :key="opt"
            type="button"
            class="w-full px-2.5 py-1 text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer"
            :class="
              props.pageSize === opt
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            "
            @click="selectOption(opt)"
          >
            <span>{{ opt }} Data</span>
            <span v-if="props.pageSize === opt" class="text-blue-600 font-bold"
              >✓</span
            >
          </button>
        </div>
      </div>

      <span
        >dari
        <strong class="text-gray-700 font-semibold">{{ total }}</strong>
        Data</span
      >
    </div>

    <!-- Right: Page numbers navigation -->
    <div class="flex items-center gap-1">
      <!-- Previous button -->
      <button
        type="button"
        class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer text-gray-600"
        :disabled="currentPage <= 1"
        @click="changePage(currentPage - 1)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <!-- Pages list -->
      <button
        v-for="p in visiblePages"
        :key="p"
        type="button"
        class="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer"
        :class="
          currentPage === p
            ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
            : typeof p === 'number'
              ? 'hover:bg-gray-100 text-gray-600'
              : 'text-gray-400 cursor-default'
        "
        @click="typeof p === 'number' && changePage(p)"
      >
        {{ p }}
      </button>

      <!-- Next button -->
      <button
        type="button"
        class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer text-gray-600"
        :disabled="currentPage >= totalPages"
        @click="changePage(currentPage + 1)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
