<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { ChevronDown, Check, Layers } from "@lucide/vue";

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
    class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-gray-500 select-none border-t border-gray-100/80"
  >
    <!-- Left: Page size control & Total info -->
    <div class="flex items-center gap-2">
      <span class="text-gray-500 text-xs font-medium">Menampilkan</span>

      <!-- Custom Page Size Input + Dropdown -->
      <div ref="dropdownRef" class="relative inline-flex items-center">
        <div
          data-testid="page-size-trigger"
          class="group inline-flex items-center bg-white hover:bg-gray-50/80 border rounded-lg shadow-2xs transition-all cursor-pointer"
          :class="
            showDropdown
              ? 'border-blue-500 ring-2 ring-blue-500/15'
              : 'border-gray-200 hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15'
          "
        >
          <input
            data-testid="page-size-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            :value="pageSizeInput"
            class="w-8 h-8 text-center font-semibold text-gray-800 bg-transparent border-none focus:outline-none text-xs tracking-tight"
            title="Ketik jumlah baris per halaman"
            @keydown="handleKeyDown"
            @input="handleInput"
            @blur="handleBlur"
            @focus="showDropdown = true"
          >
          <button
            type="button"
            class="h-8 pr-2 pl-0.5 flex items-center justify-center text-gray-400 group-hover:text-gray-600 focus:outline-none cursor-pointer transition-colors"
            title="Pilih opsi data per halaman"
            aria-label="Pilih opsi data per halaman"
            :aria-expanded="showDropdown"
            @click.stop="showDropdown = !showDropdown"
          >
            <ChevronDown
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="showDropdown ? 'rotate-180 text-blue-600' : 'text-gray-400 group-hover:text-gray-600'"
            />
          </button>
        </div>

        <!-- Dropdown Popup Options (5, 10, 20) -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="transform scale-95 opacity-0 translate-y-1"
          enter-to-class="transform scale-100 opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="transform scale-100 opacity-100 translate-y-0"
          leave-to-class="transform scale-95 opacity-0 translate-y-1"
        >
          <div
            v-if="showDropdown"
            data-testid="page-size-dropdown"
            class="absolute bottom-full left-0 mb-1.5 w-32 bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl shadow-gray-900/10 ring-1 ring-black/5 p-1.5 z-40"
          >
            <!-- Dropdown Header -->
            <div
              class="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1 select-none"
            >
              <Layers class="w-3 h-3 text-gray-400" />
              <span>Opsi Data</span>
            </div>

            <!-- Options list -->
            <div class="space-y-0.5">
              <button
                v-for="opt in pageSizeOptions"
                :key="opt"
                :data-testid="`page-size-option-${opt}`"
                type="button"
                class="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer group"
                :class="
                  props.pageSize === opt
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                "
                @click="selectOption(opt)"
              >
                <span class="flex items-center gap-1.5">
                  <span
                    class="w-1.5 h-1.5 rounded-full transition-colors"
                    :class="props.pageSize === opt ? 'bg-blue-600' : 'bg-transparent group-hover:bg-gray-300'"
                  />
                  <span>{{ opt }} Data</span>
                </span>
                <Check
                  v-if="props.pageSize === opt"
                  class="w-3.5 h-3.5 text-blue-600 stroke-[2.5]"
                />
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <span class="text-gray-500 text-xs font-medium"
        >dari
        <strong class="text-gray-800 font-semibold">{{ total }}</strong>
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
