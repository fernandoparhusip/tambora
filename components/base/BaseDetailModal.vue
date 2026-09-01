<script setup lang="ts">
import { computed } from "vue";
import { VueFinalModal } from "vue-final-modal";

export interface DetailDataItem {
  label: string;
  value?: string | number;
  isStatus?: boolean;
}

export interface ActivityLogItem {
  initial?: string;
  user: string;
  action: string;
  timestamp: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  recordId?: string;
  createdDate?: string;
  createdBy?: string;
  dataItems: DetailDataItem[];
  activityLogs?: ActivityLogItem[];
  variant?: "drawer" | "centered";
}

const props = withDefaults(defineProps<Props>(), {
  title: "View Data Master User",
  subtitle: "Form View Data Master User",
  recordId: "0da6128901-12315217hcabi-1267hxacbakjn",
  createdDate: "Selasa, 18 November 2025 13:20",
  createdBy: "Agung",
  activityLogs: () => [],
  variant: "drawer",
});

const emit = defineEmits<{
  (e: "edit" | "close"): void;
}>();

const isOpen = defineModel<boolean>("isOpen", { default: false });

const activityLogsList = computed(() => {
  if (props.activityLogs && props.activityLogs.length > 0) {
    return props.activityLogs;
  }
  return [
    {
      initial: "A",
      user: "Agung",
      action: "Membuat Master User",
      timestamp: "Selasa, 18 November 2025 16:58",
    },
  ];
});

const closeModal = () => {
  isOpen.value = false;
  emit("close");
};

const handleEdit = () => {
  isOpen.value = false;
  emit("edit");
};
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    overlay-transition="vfm-slide-fade"
    :content-transition="
      variant === 'centered' ? 'vfm-slide-fade' : 'vfm-slide-right'
    "
    :click-to-close="true"
    :esc-to-close="true"
    :class="
      variant === 'centered'
        ? 'fixed inset-0 z-[100] flex items-center justify-center p-4'
        : 'fixed inset-0 z-[100] flex justify-end'
    "
    :content-class="
      variant === 'centered'
        ? 'relative z-[100] bg-[#F6FAFD] w-full max-w-4xl rounded-2xl flex flex-col shadow-2xl border border-gray-200/60 overflow-hidden max-h-[92vh] my-auto'
        : 'absolute z-[100] top-0 right-0 bg-[#F6FAFD] w-4/5 sm:w-3/4 md:w-2/3 lg:w-3/5 h-screen flex flex-col shadow-2xl border-l border-gray-200/60 overflow-hidden'
    "
    overlay-class="fixed inset-0 bg-gray-950/40 backdrop-blur-xs z-[99]"
  >
    <!-- Modal Header -->
    <div
      class="px-6 py-4 bg-white border-b border-gray-200/60 flex items-center justify-between shrink-0"
    >
      <div class="flex items-center gap-3.5">
        <!-- Close Circle Button -->
        <button
          type="button"
          class="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-[#2671D9] flex items-center justify-center transition-colors cursor-pointer"
          @click="closeModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 stroke-[2.5]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div>
          <h3
            class="text-base sm:text-lg font-bold text-[#2C3E50] leading-snug"
          >
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5 font-normal">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Right Action Button: UBAH DATA -->
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2671D9] text-[#2671D9] hover:bg-blue-50 font-bold text-xs tracking-wider transition-colors cursor-pointer"
        @click="handleEdit"
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
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
        <span>UBAH DATA</span>
      </button>
    </div>

    <!-- Modal Body (2 Columns Layout with Smooth Scroll & Bottom Padding) -->
    <div class="flex-1 overflow-y-auto p-6 pb-12 bg-[#F6FAFD] min-h-0">
      <div
        class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-full items-stretch"
      >
        <!-- Left Main Data Card (8 Cols) -->
        <div
          class="lg:col-span-8 bg-white rounded-xl p-6 border border-gray-100 shadow-2xs space-y-5 flex flex-col justify-start min-h-full"
        >
          <!-- Published Title Bar -->
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-1.5 h-5 bg-[#2671D9] rounded-full inline-block" />
              <h4 class="text-base font-bold text-[#2671D9]">Published</h4>
            </div>
            <p class="text-xs font-mono text-gray-400 pl-3.5">
              {{ recordId || "0da6128901-12315217hcabi-1267hxacbakjn" }}
            </p>
          </div>

          <!-- Metadata Badges -->
          <div class="space-y-2">
            <span class="text-xs text-gray-400 block font-normal">Created</span>
            <div class="flex flex-wrap items-center gap-2.5">
              <div
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-[#2671D9] text-xs font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{{
                  createdDate || "Selasa, 18 November 2025 13:20"
                }}</span>
              </div>
              <div
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-[#2671D9] text-xs font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{{ createdBy || "Agung" }}</span>
              </div>
            </div>
          </div>

          <hr class="border-gray-100 my-4" >

          <!-- Key-Value Items List -->
          <div class="space-y-3.5">
            <div
              v-for="(item, index) in dataItems"
              :key="index"
              class="flex items-center justify-between py-0.5 text-xs"
            >
              <span class="text-gray-400 font-normal">{{ item.label }}</span>
              <span
                class="font-bold text-gray-800 text-right flex items-center justify-end gap-1.5"
              >
                <span
                  v-if="item.isStatus"
                  class="w-2 h-2 rounded-full"
                  :class="
                    item.value === 'Aktif' || item.value === 'Tidak Aktif'
                      ? item.value === 'Aktif'
                        ? 'bg-emerald-500'
                        : 'bg-red-500'
                      : 'bg-emerald-500'
                  "
                />
                <span>{{ item.value || "-" }}</span>
              </span>
            </div>
          </div>

          <!-- Extra Content Slot (e.g. Roles, Permissions, Nested Relations) -->
          <slot name="extra" />
        </div>


        <!-- Right Activity Log Card (4 Cols Full Height) -->
        <div
          class="lg:col-span-4 bg-white rounded-xl p-6 border border-gray-100 shadow-2xs flex flex-col min-h-full"
        >
          <h4 class="text-sm font-bold text-gray-800 mb-5">Status</h4>

          <!-- Activity Log Item -->
          <div class="space-y-4">
            <div
              v-for="(log, lIdx) in activityLogsList"
              :key="lIdx"
              class="flex gap-3 relative"
            >
              <!-- Avatar -->
              <div
                class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0"
              >
                {{ log.initial || "A" }}
              </div>
              <div>
                <h5 class="text-xs font-bold text-gray-800">{{ log.user }}</h5>
                <p class="text-[11px] text-blue-600 font-medium mt-0.5">
                  {{ log.action }}
                </p>
                <p class="text-[10px] text-gray-400 mt-1">
                  {{ log.timestamp }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
