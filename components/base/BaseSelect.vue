<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

export interface SelectOption {
  label: string;
  value: any;
  icon?: string;
  badge?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: any;
    options: (string | SelectOption)[];
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    widthClass?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "Pilih...",
    searchable: true,
    disabled: false,
    widthClass: "w-56"
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: any];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const containerRef = ref<HTMLElement | null>(null);

const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map((opt) => {
    if (typeof opt === "string") {
      return { label: opt, value: opt };
    }
    return opt;
  });
});

const selectedLabel = computed(() => {
  const found = normalizedOptions.value.find((o) => o.value === props.modelValue);
  return found ? found.label : props.placeholder;
});

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) return normalizedOptions.value;
  const q = searchQuery.value.toLowerCase();
  return normalizedOptions.value.filter((o) =>
    o.label.toLowerCase().includes(q)
  );
});

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = "";
  }
};

const selectOption = (val: any) => {
  emit("update:modelValue", val);
  isOpen.value = false;
  searchQuery.value = "";
};

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener("click", handleClickOutside);
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener("click", handleClickOutside);
  }
});
</script>

<template>
  <div ref="containerRef" class="relative inline-block" :class="widthClass">
    <!-- Trigger Button (Matches BaseSearchInput h-12 height and design) -->
    <button
      type="button"
      :disabled="disabled"
      class="w-full h-12 bg-white border border-gray-200 rounded-lg px-3.5 flex items-center justify-between text-left text-sm transition-all shadow-2xs cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-[#2563EB] select-none"
      :class="[
        isOpen ? 'border-blue-500 ring-1 ring-[#2563EB]' : 'hover:border-gray-300',
        disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
      ]"
      @click="toggleDropdown"
    >
      <span
        class="truncate pr-2 font-medium"
        :class="modelValue === '' ? 'text-gray-400 font-normal' : 'text-gray-800'"
      >
        {{ selectedLabel }}
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0"
        :class="{ 'rotate-180 text-blue-600': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu Popover -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1.5 max-h-72 flex flex-col"
      >
        <!-- Search Input inside Dropdown (if enabled & items > 5) -->
        <div v-if="searchable && normalizedOptions.length > 5" class="px-2.5 pb-2 pt-1 border-b border-gray-100">
          <div class="relative flex items-center">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari..."
              class="w-full h-8 pl-8 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
              @click.stop
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
        </div>

        <!-- Options Scrollable List -->
        <div class="flex-1 overflow-y-auto max-h-56 py-1 scrollbar-thin">
          <div
            v-if="filteredOptions.length === 0"
            class="px-4 py-3 text-xs text-gray-400 text-center"
          >
            Tidak ada opsi yang sesuai
          </div>

          <button
            v-for="opt in filteredOptions"
            :key="String(opt.value)"
            type="button"
            class="w-full px-3.5 py-2.5 text-xs flex items-center justify-between text-left transition-colors cursor-pointer"
            :class="[
              modelValue === opt.value
                ? 'bg-blue-50/80 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="selectOption(opt.value)"
          >
            <span class="truncate">{{ opt.label }}</span>
            <svg
              v-if="modelValue === opt.value"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-blue-600 shrink-0 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
