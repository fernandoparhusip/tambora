<script setup lang="ts">
import { computed, resolveComponent } from "vue";
import {
  getStatusMeta,
  type SentralItem,
} from "~/utils/operasiPembangkitUtils";
import BaseTabFilter, {
  type TabItem,
} from "~/components/base/BaseTabFilter.vue";
import type { FormFieldConfig } from "~/types";

// 1. State
const tabItems = [
  { key: "operasi", label: "Operasi" },
  { key: "energi", label: "Energi" },
];

const detailQuickLinks = [
  {
    key: "langgam-beban",
    title: "Langgam Beban",
    icon: resolveComponent("LucideAreaChart"),
  },
  {
    key: "grafik-status-beban",
    title: "Grafik Status Beban",
    icon: resolveComponent("LucideBarChart3"),
  },
  {
    key: "rekap-laporan-produksi",
    title: "Rekap Laporan Produksi",
    icon: resolveComponent("LucideFileText"),
  },
];

// 2. Composable calls
const {
  selectedTab,
  selectedDate,
  selectedStatusFilter,
  systemSummary,
  sentralList,
  statusCounts,
  filteredSentralList,
  setStatusFilter,
  selectedSentralFilter,
  selectedTimeRange,
  selectedInterval,
  timeRangeOptions,
  intervalOptions,
  fuelContributionList,
  fuelSummary,
  generationMinMaxStats,
  energiGenerationChartOption,
  energiDonutChartOption,
} = useOperasiPembangkit();

// 3. Computed
const legendItems = computed(() => [
  {
    key: "semua",
    label: "Semua Status",
    count: statusCounts.value.semua || 0,
    color: "#2563EB",
  },
  {
    key: "gangguan",
    label: "Gangguan",
    count: statusCounts.value.gangguan || 0,
    color: "#EF4444",
  },
  {
    key: "derating",
    label: "Derating",
    count: statusCounts.value.derating || 0,
    color: "#F59E0B",
  },
  {
    key: "pemeliharaan",
    label: "Pemeliharaan",
    count: statusCounts.value.pemeliharaan || 0,
    color: "#0EA5E9",
  },
  {
    key: "standby",
    label: "Standby",
    count: statusCounts.value.standby || 0,
    color: "#64748B",
  },
  {
    key: "rusak_permanen",
    label: "Rusak Permanen",
    count: statusCounts.value.rusak_permanen || 0,
    color: "#8B5CF6",
  },
  {
    key: "operasi",
    label: "Operasi",
    count: statusCounts.value.operasi || 0,
    color: "#10B981",
  },
]);

const summaryMetrics = computed(() => [
  { label: "DMN", value: systemSummary.value.dmn, unit: "MW" },
  { label: "DMP", value: systemSummary.value.dmp, unit: "MW" },
  { label: "Beban Sistem", value: systemSummary.value.bebanSistem, unit: "MW" },
  { label: "Unit Max", value: systemSummary.value.unitMax, unit: "MW" },
  { label: "Cad. Total", value: systemSummary.value.cadTotal, unit: "MW" },
  { label: "Cad. Putar", value: systemSummary.value.cadPutar, unit: "MW" },
]);

const sentralSelectOptions = computed(() => [
  { label: "All Sentral", value: "all" },
  ...sentralList.value.map((item) => ({
    label: item.name,
    value: item.id,
  })),
]);

const sentralFieldConfig = computed<FormFieldConfig>(() => ({
  key: "sentral_filter",
  label: "",
  type: "searchable-select",
  placeholder: "All Sentral",
  required: false,
  options: sentralSelectOptions.value,
}));

const timeRangeTabItems = computed<TabItem[]>(() =>
  timeRangeOptions.map((item) => ({ key: item, label: item })),
);

const intervalTabItems = computed<TabItem[]>(() =>
  intervalOptions.map((item) => ({ key: item, label: item })),
);

// 4. Methods / handlers
const getMarkerColor = (item: SentralItem) => {
  return getStatusMeta(item.status).hexColor;
};
</script>

<template>
  <div class="h-full w-full flex flex-col overflow-hidden mx-auto box-border">
    <!-- Top Header Bar Component -->
    <BaseDashboardHeader
      v-model:tab-value="selectedTab"
      v-model:date-value="selectedDate"
      :title="
        selectedTab === 'energi'
          ? 'Dashboard Kondisi Sistem Energi'
          : 'Operasi Pembangkit Sistem Tambora'
      "
      :tabs="tabItems"
      date-picker-view="year"
    />

    <!-- TAB 1: OPERASI PEMBANGKIT (Map & Sentral Details) -->
    <div
      v-if="selectedTab === 'operasi' || !selectedTab"
      class="p-4 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-7 gap-3 items-stretch overflow-hidden"
    >
      <!-- Left Column: Map Container (60% width on lg: col-span-4 out of 7) -->
      <div class="lg:col-span-4 h-full min-h-0 flex flex-col">
        <ClientOnly>
          <LazyBaseMap
            :center="[117.85, -8.6]"
            :zoom="8.5"
            :markers="filteredSentralList"
            :marker-color="getMarkerColor"
            :show-zoom-controls="true"
            :show-fullscreen-control="true"
          >
            <!-- Top Center Legend Status Filter Pills Slot -->
            <template #top-center>
              <div
                class="bg-[#EBEBEB]/90 backdrop-blur-md p-1 rounded-lg shadow-md border border-slate-300/60 flex items-center text-xs font-medium text-slate-700 whitespace-nowrap overflow-x-auto max-w-full custom-horizontal-scrollbar shrink-0 gap-0.5"
              >
                <template v-for="(item, index) in legendItems" :key="item.key">
                  <span
                    v-if="
                      index > 0 &&
                      selectedStatusFilter !== item.key &&
                      selectedStatusFilter !== legendItems[index - 1]?.key
                    "
                    class="h-3.5 w-px bg-slate-300/80 shrink-0 mx-0.5"
                  />
                  <button
                    type="button"
                    class="flex items-center gap-1.5 px-2.5 py-1 transition-all cursor-pointer shrink-0 rounded-lg text-[11px]"
                    :class="
                      selectedStatusFilter === item.key
                        ? 'bg-white text-slate-800 font-semibold shadow-xs border border-slate-200/80'
                        : 'hover:bg-slate-200/60 text-slate-700'
                    "
                    @click="setStatusFilter(item.key)"
                  >
                    <span
                      class="w-2 h-2 rounded-full shrink-0"
                      :style="{ backgroundColor: item.color }"
                    />
                    <span>{{ item.count }} {{ item.label }}</span>
                  </button>
                </template>
              </div>
            </template>

            <!-- Marker Popup Card Slot -->
            <template #popup="{ marker }">
              <div v-if="marker">
                <div class="font-bold text-sm mb-1 text-slate-900">
                  {{ marker.name }}
                </div>
                <div class="flex items-center gap-1.5 mb-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full"
                    :style="{
                      backgroundColor: getStatusMeta(marker.status).hexColor,
                    }"
                  />
                  <span class="font-semibold text-slate-600">
                    {{ getStatusMeta(marker.status).label }}
                  </span>
                </div>
                <div
                  class="grid grid-cols-2 gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100"
                >
                  <div>
                    DMN: <b class="text-slate-700">{{ marker.dmn }} MW</b>
                  </div>
                  <div>
                    DMP: <b class="text-slate-700">{{ marker.dmp }} MW</b>
                  </div>
                  <div>
                    Beban: <b class="text-slate-700">{{ marker.beban }} MW</b>
                  </div>
                  <div>
                    PO/MO: <b class="text-slate-700">{{ marker.pomo }}</b>
                  </div>
                </div>
              </div>
            </template>
          </LazyBaseMap>
          <template #fallback>
            <div
              class="w-full h-full min-h-[350px] bg-slate-100/90 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-200/80 shadow-xs"
            >
              <div
                class="absolute inset-0 flex flex-col items-center justify-center gap-2"
              >
                <BaseLoadingIndicatorPLN />
                <span class="text-xs font-semibold text-slate-500"
                  >Memuat Peta Tambora...</span
                >
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Right Column: Stats, Quick Links, and Sentral List wrapped in a rounded white card container (40% width on lg: col-span-3 out of 7) -->
      <div
        class="lg:col-span-3 h-full min-h-0 bg-white rounded-lg p-5 border border-slate-100 shadow-sm flex flex-col gap-4 overflow-hidden"
      >
        <!-- System Tambora Summary Card -->
        <div
          class="bg-gradient-to-r from-[#EEF7FF] via-[#E2F2FF] to-[#D4ECFF] p-3.5 rounded-lg border border-sky-100/80 shrink-0 shadow-[2px_0px_25px_0px_rgba(0,67,101,0.08)]"
        >
          <div class="flex items-center justify-between mb-3">
            <h2
              class="text-base md:text-lg font-bold text-slate-800 tracking-tight"
            >
              {{ systemSummary.title }}
            </h2>
            <span
              class="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-600 shadow-2xs"
            >
              {{ systemSummary.statusBadge }}
            </span>
          </div>

          <div class="grid grid-cols-6 gap-1.5">
            <div
              v-for="item in summaryMetrics"
              :key="item.label"
              class="bg-white px-3 py-2 rounded-lg border border-dashed border-blue-200/90 shadow-2xs text-left flex flex-col justify-center min-w-0"
            >
              <span
                class="text-[7px] font-medium text-slate-400 whitespace-nowrap truncate"
              >
                {{ item.label }}
              </span>
              <div
                class="text-xs font-bold text-slate-800 tracking-tight whitespace-nowrap mt-0.5"
              >
                <span>{{ item.value }}</span>
                <span class="ml-1 text-[9px] font-normal text-slate-400">
                  {{ item.unit }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Detail Links -->
        <div class="space-y-2 shrink-0">
          <div
            class="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider after:flex-1 after:h-px after:bg-slate-200/80"
          >
            <span>Detail Data Operasi Sistem Tambora</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="link in detailQuickLinks"
              :key="link.key"
              class="bg-slate-50/80 p-3.5 rounded-lg hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-2 shadow-[2px_0px_25px_0px_rgba(0,67,101,0.1)]"
            >
              <div class="flex items-center justify-center gap-1.5">
                <p class="text-[10px] font-bold text-slate-700">
                  {{ link.title }}
                </p>
                <component
                  :is="link.icon"
                  class="w-4 h-4 text-blue-500 shrink-0"
                />
              </div>
              <button
                type="button"
                class="text-[8px] font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center cursor-pointer"
              >
                <span class="underline text-xs font-medium">Lihat Detail</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sentral List with Status Badges -->
        <div class="flex-1 min-h-0 flex flex-col space-y-2.5 overflow-hidden">
          <div
            class="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 after:flex-1 after:h-px after:bg-slate-200/80"
          >
            <span>Daftar Sentral Sistem Tambora</span>
          </div>

          <div
            class="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 pr-1 custom-vertical-scrollbar"
          >
            <div
              v-for="item in filteredSentralList"
              :key="item.id"
              class="py-2.5 px-1 hover:bg-slate-50/60 rounded-lg transition-all space-y-1.5"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    :class="getStatusMeta(item.status).haloBg"
                  >
                    <span
                      class="w-3.5 h-3.5 rounded-full"
                      :class="getStatusMeta(item.status).dotColor"
                    />
                  </span>
                  <span class="text-xs font-bold text-slate-800 truncate">
                    {{ item.name }}
                  </span>
                </div>

                <span
                  class="shrink-0 px-3 py-0.5 rounded-full text-xs font-medium border"
                  :class="[
                    getStatusMeta(item.status).badgeBg,
                    getStatusMeta(item.status).badgeBorder,
                    getStatusMeta(item.status).badgeText,
                  ]"
                >
                  {{ getStatusMeta(item.status).label }}
                </span>
              </div>

              <div
                class="flex items-center justify-between gap-2 text-[11px] text-slate-400 font-normal pl-8 pr-2"
              >
                <span
                  >DMN :
                  <b class="font-bold text-slate-800"
                    >{{ item.dmn }} MW</b
                  ></span
                >
                <span
                  >DMP :
                  <b class="font-bold text-slate-800"
                    >{{ item.dmp }} MW</b
                  ></span
                >
                <span
                  >Beban Saat Ini :
                  <b class="font-bold text-slate-800"
                    >{{ item.beban }} MW</b
                  ></span
                >
                <span
                  >PO/MO :
                  <b class="font-bold text-slate-800">{{ item.pomo }}</b></span
                >
                <span
                  >Foder :
                  <b class="font-bold text-slate-800"
                    >{{ item.foder }} MW</b
                  ></span
                >
              </div>
            </div>

            <div
              v-if="filteredSentralList.length === 0"
              class="p-6 text-center text-xs text-slate-400 bg-white rounded-lg border border-dashed border-gray-200"
            >
              Tidak ada data sentral untuk filter ini.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: KONDISI SISTEM ENERGI (Stacked Area & Donut Charts) -->
    <div
      v-else-if="selectedTab === 'energi'"
      class="p-4 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-7 gap-4 items-stretch overflow-y-auto custom-vertical-scrollbar"
    >
      <!-- Left Column: Filter Controls & Stacked Area Chart (60% width -> lg:col-span-4) -->
      <div
        class="lg:col-span-4 flex flex-col gap-3 min-h-0 bg-white rounded-lg p-4 border border-slate-100 shadow-xs"
      >
        <!-- Top Filter Bar: Sentral Dropdown, Time Range, Granularity Pills -->
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 shrink-0"
        >
          <!-- Sentral Selector Searchable Select Component -->
          <div class="w-48 text-xs font-semibold">
            <FormFieldRenderer
              v-model="selectedSentralFilter"
              :field="sentralFieldConfig"
            />
          </div>

          <!-- Time Range & Granularity Filter Pills using BaseTabFilter -->
          <div class="flex items-center gap-2 flex-wrap">
            <BaseTabFilter
              v-model="selectedTimeRange"
              :items="timeRangeTabItems"
              container-bg-color="#F1F5F9"
              indicator-bg-color="#FFFFFF"
              active-text-color="#1E293B"
              inactive-text-color="#64748B"
            />

            <BaseTabFilter
              v-model="selectedInterval"
              :items="intervalTabItems"
              container-bg-color="#F1F5F9"
              indicator-bg-color="#FFFFFF"
              active-text-color="#1E293B"
              inactive-text-color="#64748B"
            />
          </div>
        </div>

        <!-- Chart Title Bar & Live Tooltip Badge -->
        <div class="flex items-center justify-between px-1 shrink-0">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <span
              >Generation
              <span class="text-slate-400 font-normal">MW</span></span
            >
          </div>

          <!-- Live Hover Status Badge -->
          <div
            class="flex items-center gap-2 text-[11px] bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60 text-slate-600"
          >
            <span class="font-medium text-slate-500">5 Oct 2025, 7:30 PM</span>
            <span class="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
            <span class="font-bold text-slate-700">Biomassa 38.8 MW</span>
            <span class="text-slate-400"
              >Total <b class="text-slate-700">38.8 MW</b></span
            >
          </div>
        </div>

        <!-- Generation MW ECharts Stacked Area Chart -->
        <div class="flex-1 min-h-[380px] w-full pt-1">
          <ClientOnly>
            <LazyBaseChart
              :option="energiGenerationChartOption"
              height="h-full min-h-[360px]"
            />
            <template #fallback>
              <div
                class="w-full h-[360px] bg-slate-50 rounded-lg flex items-center justify-center text-xs text-slate-400"
              >
                Memuat Grafik Generasi Energi...
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <!-- Right Column: Fuel Table, Donut Chart & Min/Max Stats (40% width -> lg:col-span-3) -->
      <div class="lg:col-span-3 flex flex-col gap-4">
        <!-- 1. Fuel Type Contribution Table -->
        <div
          class="bg-white rounded-lg p-4 border border-slate-100 shadow-xs space-y-3 shrink-0"
        >
          <div
            class="grid grid-cols-12 text-[11px] font-bold text-slate-400 border-b border-slate-100 pb-2"
          >
            <span class="col-span-5 text-left">Jenis Bahan Bakar</span>
            <span class="col-span-3 text-right">Energi (MWh)</span>
            <span class="col-span-4 text-right pr-1">Kontribusi (MWh)</span>
          </div>

          <div class="space-y-2.5 text-xs font-medium text-slate-700">
            <div
              v-for="fuel in fuelContributionList"
              :key="fuel.name"
              class="grid grid-cols-12 items-center"
            >
              <div class="col-span-5 flex items-center gap-2 min-w-0">
                <span
                  class="w-3 h-3 rounded-xs shrink-0"
                  :style="{ backgroundColor: fuel.color }"
                />
                <span
                  class="truncate font-semibold text-slate-800 text-[11px]"
                  >{{ fuel.name }}</span
                >
              </div>
              <div
                class="col-span-3 text-right font-bold text-slate-700 text-[11px]"
              >
                {{ fuel.energi.toLocaleString("id-ID") }}
              </div>
              <div class="col-span-4 flex items-center justify-end gap-2 pl-2">
                <span
                  class="text-[11px] text-slate-500 font-normal min-w-[30px] text-right"
                  >{{ fuel.kontribusi }}%</span
                >
                <div
                  class="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0"
                >
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :style="{
                      width: `${fuel.kontribusi}%`,
                      backgroundColor: fuel.color,
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- Summary Rows (Net & Renewables) -->
            <div class="border-t border-slate-200/80 pt-2.5 space-y-2">
              <div
                class="flex items-center justify-between text-xs font-bold text-slate-800 px-1"
              >
                <div class="flex items-center gap-2">
                  <span class="w-3 h-1 bg-slate-600 rounded-full" />
                  <span>Net</span>
                </div>
                <span>{{ fuelSummary.net.toLocaleString("id-ID") }}</span>
              </div>

              <div
                class="flex items-center justify-between text-xs font-bold text-slate-800 px-1"
              >
                <div class="flex items-center gap-2">
                  <span class="w-3 h-1 bg-emerald-500 rounded-full" />
                  <span>Renewables</span>
                </div>
                <div class="flex items-center gap-3">
                  <span>{{
                    fuelSummary.renewables.toLocaleString("id-ID")
                  }}</span>
                  <span
                    class="text-[11px] font-normal text-slate-500 min-w-[40px] text-right"
                    >{{ fuelSummary.renewablesPercent }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Donut Chart with Center Text (38.8 MW) -->
        <div
          class="bg-white rounded-lg p-4 border border-slate-100 shadow-xs flex items-center justify-center relative min-h-[210px] shrink-0"
        >
          <ClientOnly>
            <LazyBaseChart :option="energiDonutChartOption" height="h-[190px]" />
            <template #fallback>
              <div
                class="w-full h-[190px] flex items-center justify-center text-xs text-slate-400"
              >
                Memuat Donut Chart...
              </div>
            </template>
          </ClientOnly>
          <!-- Center Text Badge inside Donut -->
          <div
            class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          >
            <span class="text-xl font-extrabold text-slate-800 tracking-tight">
              {{ fuelSummary.totalBebanMW }}
            </span>
          </div>
        </div>

        <!-- 3. Generation Min / Max Stats Table -->
        <div
          class="bg-white rounded-lg p-4 border border-slate-100 shadow-xs space-y-3 shrink-0"
        >
          <div
            class="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-100 pb-2"
          >
            <span>Generation</span>
            <span class="text-[10px] text-slate-400 font-normal"
              >02 Oktober 2025, 17:00 WIB - 07 Oktober 2025, 17:00 WIB</span
            >
          </div>

          <!-- Column Header for Min & Max -->
          <div
            class="grid grid-cols-12 text-[10px] font-bold text-slate-700 pr-1"
          >
            <span class="col-span-6" />
            <span class="col-span-3 text-right">Min.</span>
            <span class="col-span-3 text-right">Max.</span>
          </div>

          <div class="space-y-3 text-xs">
            <div
              v-for="stat in generationMinMaxStats"
              :key="stat.label"
              class="space-y-1 border-b border-slate-100/60 pb-2.5 last:border-none last:pb-0"
            >
              <div
                class="grid grid-cols-12 text-slate-700 font-medium items-center"
              >
                <span
                  class="col-span-6 font-semibold text-slate-700 text-[11px]"
                  >{{ stat.label }}</span
                >
                <span
                  class="col-span-3 text-right font-bold text-slate-800 text-[11px]"
                  >{{ stat.min }}</span
                >
                <span
                  class="col-span-3 text-right font-bold text-slate-800 text-[11px]"
                  >{{ stat.max }}</span
                >
              </div>
              <div class="grid grid-cols-12 text-[9px] text-slate-400">
                <span class="col-span-6" />
                <span class="col-span-3 text-right truncate pr-0.5">{{
                  stat.minDate
                }}</span>
                <span class="col-span-3 text-right truncate">{{
                  stat.maxDate
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-vertical-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-vertical-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
