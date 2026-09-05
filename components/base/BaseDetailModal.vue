<script setup lang="ts">
import { computed } from "vue";
import { VueFinalModal } from "vue-final-modal";
import { formatAppDateTime } from "~/utils/formatDate";

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
  history?: any[];
  variant?: "drawer" | "centered";
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Detail Data",
  subtitle: "Form View Detail Data",
  recordId: "-",
  createdDate: "-",
  createdBy: "Admin",
  activityLogs: () => [],
  history: () => [],
  variant: "drawer",
  loading: false,
});

const emit = defineEmits<{
  (e: "edit" | "close"): void;
}>();

const isOpen = defineModel<boolean>("isOpen", { default: false });

const activityLogsList = computed<ActivityLogItem[]>(() => {
  if (props.activityLogs && props.activityLogs.length > 0) {
    return props.activityLogs;
  }
  if (props.history && Array.isArray(props.history) && props.history.length > 0) {
    return props.history.map((item: any) => {
      const userName = item.user_name || item.user || "Admin";
      const initial = (userName || "A").charAt(0).toUpperCase();
      const actionText =
        item.title ||
        (item.action === "CREATE"
          ? `Membuat ${props.title?.replace(/^Detail\s+/i, "") || "Data"}`
          : item.action === "UPDATE"
            ? `Mengubah ${props.title?.replace(/^Detail\s+/i, "") || "Data"}`
            : item.action || "Aktivitas");
      const dt = item.created_at ? formatAppDateTime(item.created_at) : "-";
      return {
        initial,
        user: userName,
        action: actionText,
        timestamp: dt,
      };
    });
  }
  if (
    (props.createdBy && props.createdBy !== "Admin") ||
    (props.createdDate && props.createdDate !== "-")
  ) {
    const user = props.createdBy || "Admin";
    return [
      {
        initial: user.charAt(0).toUpperCase(),
        user,
        action: `Membuat ${props.title?.replace(/^Detail\s+/i, "") || "Data"}`,
        timestamp: props.createdDate || "-",
      },
    ];
  }
  return [];
});

const closeModal = () => {
  isOpen.value = false;
  emit("close");
};

useModalEsc(isOpen, closeModal);

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
    :esc-to-close="false"
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

    <!-- Modal Body (2 Columns Layout with Independent Card Scrolling) -->
    <div
      class="flex-1 overflow-y-auto lg:overflow-hidden p-6 bg-[#F6FAFD] min-h-0 flex flex-col"
    >
      <div
        class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 lg:h-full"
      >
        <!-- Left Main Data Card (8 Cols) -->
        <div
          class="lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-2xs flex flex-col flex-1 min-h-0 max-lg:min-h-[380px] lg:h-full overflow-hidden"
        >
          <div
            class="flex-1 overflow-y-auto overscroll-contain p-6 space-y-5 min-h-0"
          >
            <!-- Published Title Bar -->
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="w-1.5 h-5 bg-[#2671D9] rounded-full inline-block"
                />
                <h4 class="text-base font-bold text-[#2671D9]">Published</h4>
              </div>
              <p class="text-xs font-mono text-gray-400 pl-3.5">
                {{ recordId || "0da6128901-12315217hcabi-1267hxacbakjn" }}
              </p>
            </div>

            <!-- Metadata Badges -->
            <div class="space-y-2">
              <span class="text-xs text-gray-400 block font-normal"
                >Created</span
              >
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
                  <span>{{ createdBy || "Admin" }}</span>
                </div>
              </div>
            </div>

            <hr class="border-gray-100 my-4" />

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
        </div>

        <!-- Right Activity Log Card (4 Cols Full Height) -->
        <div
          class="lg:col-span-4 bg-white rounded-xl border border-gray-100 shadow-2xs flex flex-col flex-1 min-h-0 max-lg:min-h-[300px] lg:h-full p-6 overflow-hidden"
        >
          <div class="flex items-center justify-between mb-4 shrink-0">
            <h4 class="text-sm font-bold text-gray-800">Status</h4>
            <span
              v-if="loading"
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-medium border border-blue-100/80 animate-pulse"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Menyinkronkan...
            </span>
          </div>

          <!-- Activity Log Items (Independent Scroll) -->
          <div
            class="flex-1 overflow-y-auto overscroll-contain min-h-0 pr-1 space-y-4"
          >
            <!-- Skeleton Loading State when loading and activityLogsList is empty -->
            <template v-if="loading && activityLogsList.length === 0">
              <div
                v-for="i in 2"
                :key="'skel-' + i"
                class="flex gap-3 animate-pulse"
              >
                <div class="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                <div class="space-y-1.5 flex-1">
                  <div class="h-3 bg-gray-200 rounded w-24" />
                  <div class="h-2.5 bg-gray-100 rounded w-36" />
                  <div class="h-2 bg-gray-100 rounded w-20" />
                </div>
              </div>
            </template>

            <template v-else-if="activityLogsList.length === 0">
              <div class="flex flex-col items-center justify-center py-8 text-gray-400 text-xs text-center">
                <svg class="w-7 h-7 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Belum ada riwayat status</span>
              </div>
            </template>

            <template v-else>
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
            </template>
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
