<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";

export interface TabItem {
  key?: string;
  kode?: string;
  label?: string;
  nama?: string;
  icon?: string;
}

interface IndicatorState {
  width: number;
  left: number;
}

const props = withDefaults(
  defineProps<{
    items: TabItem[];
    modelValue?: string | number;
    activeTab?: string | number;
    containerBgColor?: string;
    indicatorBgColor?: string;
    activeTextColor?: string;
    inactiveTextColor?: string;
    equalWidth?: boolean;
  }>(),
  {
    items: () => [],
    modelValue: "",
    activeTab: "",
    containerBgColor: "#F3F3F3",
    indicatorBgColor: "#2671D9",
    activeTextColor: "#FFFFFF",
    inactiveTextColor: "#636363",
    equalWidth: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  "update:activeTab": [value: string | number];
  tabChange: [value: string | number];
}>();

// Referensi ke container dan map tombol tab
const tabContainer = ref<HTMLElement | null>(null);
const tabButtonRefs = ref(new Map<string | number, HTMLElement>());

// State posisi & dimensi indikator
const indicator = ref<IndicatorState | null>(null);

// Normalisasi items agar mendukung key/kode dan label/nama
const normalizedItems = computed(() => {
  return props.items.map((item) => ({
    key: item.kode ?? item.key ?? "",
    label: item.nama ?? item.label ?? "",
    icon: item.icon,
  }));
});

// Tab aktif saat ini (mendukung modelValue & activeTab)
const currentActiveTab = computed(() => {
  if (props.activeTab !== undefined && props.activeTab !== "") {
    return props.activeTab;
  }
  return props.modelValue ?? "";
});

/**
 * Update posisi dan dimensi indikator tab aktif
 */
const updateIndicator = () => {
  if (!normalizedItems.value || normalizedItems.value.length === 0) {
    indicator.value = null;
    return;
  }

  const activeButton = tabButtonRefs.value.get(currentActiveTab.value);

  if (!activeButton || !tabContainer.value) {
    indicator.value = null;
    return;
  }

  // Dapatkan posisi dan dimensi sebenarnya dari tombol aktif
  const buttonRect = activeButton.getBoundingClientRect();
  const containerRect = tabContainer.value.getBoundingClientRect();

  indicator.value = {
    width: buttonRect.width,
    left: buttonRect.left - containerRect.left,
  };
};

let resizeObserver: ResizeObserver | null = null;

/**
 * Handle tab change event
 */
const handleTabChange = (key: string | number) => {
  emit("update:modelValue", key);
  emit("update:activeTab", key);
  emit("tabChange", key);
};

// Pantau perubahan tab aktif
watch(
  () => currentActiveTab.value,
  async () => {
    await nextTick();
    updateIndicator();
  },
);

// Pantau perubahan items
watch(
  () => props.items,
  async () => {
    tabButtonRefs.value = new Map();
    await nextTick();
    updateIndicator();
  },
  { immediate: true },
);

onMounted(async () => {
  await nextTick();
  updateIndicator();

  if (import.meta.client) {
    resizeObserver = new ResizeObserver(() => {
      updateIndicator();
    });

    if (tabContainer.value) {
      resizeObserver.observe(tabContainer.value);
    }
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div
    ref="tabContainer"
    class="h-[48px] rounded-[8px] p-[4px] flex relative overflow-hidden select-none shrink-0"
    :style="{ backgroundColor: containerBgColor }"
  >
    <!-- Animasi indikator tab aktif -->
    <div
      v-if="normalizedItems.length > 0 && indicator"
      class="absolute h-[40px] rounded-[8px] transition-all duration-300 ease-in-out"
      :style="{
        width: indicator.width + 'px',
        left: indicator.left + 'px',
        backgroundColor: indicatorBgColor,
      }"
    />

    <!-- Tab items -->
    <button
      v-for="item in normalizedItems"
      :key="item.key"
      :ref="
        (el) => {
          if (el) tabButtonRefs.set(item.key, el as HTMLElement);
        }
      "
      type="button"
      class="h-full px-[16px] py-[8px] rounded-[8px] transition-colors duration-300 relative cursor-pointer"
      :class="[
        { 'bg-transparent': currentActiveTab !== item.key },
        { 'flex-1 min-w-0': equalWidth },
      ]"
      @click="handleTabChange(item.key)"
    >
      <div class="flex items-center justify-center">
        <img
          v-if="item.icon"
          :src="item.icon"
          :alt="item.label || item.key"
          class="w-5 h-5"
        />
        <p
          v-else
          class="flex justify-center whitespace-nowrap text-[14px] font-medium transition-colors duration-300"
          :style="{
            color:
              currentActiveTab === item.key
                ? activeTextColor
                : inactiveTextColor,
          }"
        >
          {{ item.label }}
        </p>
      </div>
    </button>
  </div>
</template>
