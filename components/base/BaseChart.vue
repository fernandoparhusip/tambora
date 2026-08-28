<script setup lang="ts">
import { computed } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
} from "echarts/components";
import VChart from "vue-echarts";

// Register ECharts modules
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
]);

interface Props {
  option: Record<string, any>;
  loading?: boolean;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: "h-[350px]",
});

const isEmpty = computed(() => {
  if (!props.option) return true;
  // Simple check for series data
  const series = props.option.series;
  if (!series) return true;
  if (Array.isArray(series)) {
    if (series.length === 0) return true;
    return series.every((s) => !s.data || s.data.length === 0);
  }
  return !series.data || series.data.length === 0;
});

// Customizable loading appearance matching our dashboard theme
const loadingOptions = computed(() => ({
  text: "Memuat data...",
  color: "#0284c7", // Tailwind Sky 600
  textColor: "#4b5563",
  maskColor: "rgba(255, 255, 255, 0.4)",
  zlevel: 0,
}));
</script>

<template>
  <div class="relative w-full min-h-[200px]" :class="height">
    <!-- Chart Container -->
    <ClientOnly>
      <v-chart
        class="w-full h-full"
        :option="option"
        :loading="loading"
        :loading-options="loadingOptions"
        :autoresize="true"
      />
      <template #fallback>
        <div class="w-full h-full flex items-center justify-center bg-slate-50/60 rounded-lg">
          <span class="text-xs text-slate-400">Menyiapkan grafik...</span>
        </div>
      </template>
    </ClientOnly>

    <!-- Empty/No Data overlay -->
    <div
      v-if="!loading && isEmpty"
      class="absolute inset-0 flex flex-col items-center justify-center bg-white/80"
    >
      <UIcon
        name="i-heroicons-chart-bar"
        class="w-10 h-10 text-gray-400 mb-2"
      />
      <span class="text-sm text-gray-500"
        >Tidak ada data untuk ditampilkan</span
      >
    </div>
  </div>
</template>

<style scoped>
/* Ensure chart uses full layout sizing */
.echarts {
  width: 100%;
  height: 100%;
}
</style>
