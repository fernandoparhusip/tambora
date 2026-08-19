import { ref, computed } from "vue";
import {
  calculateStatusCounts,
  filterSentralByStatus,
  type SentralItem,
} from "~/utils/operasiPembangkitUtils";

export function useOperasiPembangkit() {
  const selectedTab = ref<string>("operasi");
  const selectedDate = ref<Date | null>(new Date());
  const selectedStatusFilter = ref<string>("semua");

  const systemSummary = ref({
    title: "Sistem Tambora",
    statusBadge: "Normal",
    dmn: "240.2",
    dmp: "179,76",
    bebanSistem: "155.60",
    unitMax: "17.69",
    cadTotal: "24.16",
    cadPutar: "-",
  });

  const sentralList = ref<SentralItem[]>([
    {
      id: "1",
      name: "PLTU Sumbawa",
      status: "operasi",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.49,
      lng: 117.43,
    },
    {
      id: "2",
      name: "PLTU Sumbawa Barat",
      status: "operasi",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.76,
      lng: 116.82,
    },
    {
      id: "3",
      name: "PLTMH Mamak",
      status: "operasi",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.62,
      lng: 117.51,
    },
    {
      id: "4",
      name: "PLTMG Sumbawa",
      status: "gangguan",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.51,
      lng: 117.41,
    },
    {
      id: "5",
      name: "PLTMG Bima",
      status: "derating",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.46,
      lng: 118.73,
    },
    {
      id: "6",
      name: "PLTD SW Taliwang (PT NP Services)",
      status: "pemeliharaan",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.74,
      lng: 116.85,
    },
    {
      id: "7",
      name: "PLTD SW Woha (PT NP Services)",
      status: "standby",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.58,
      lng: 118.72,
    },
    {
      id: "8",
      name: "PLTD Dompu",
      status: "operasi",
      dmn: 8,
      dmp: 4,
      beban: 4,
      pomo: "PO",
      foder: "-",
      lat: -8.53,
      lng: 118.46,
    },
    {
      id: "9",
      name: "PLTS Sumbawa",
      status: "operasi",
      dmn: 5,
      dmp: 3,
      beban: 3,
      pomo: "PO",
      foder: "-",
      lat: -8.47,
      lng: 117.45,
    },
    {
      id: "10",
      name: "PLTD Sape",
      status: "operasi",
      dmn: 6,
      dmp: 3,
      beban: 3,
      pomo: "PO",
      foder: "-",
      lat: -8.57,
      lng: 119.0,
    },
    {
      id: "11",
      name: "PLTM Sanap",
      status: "operasi",
      dmn: 4,
      dmp: 2,
      beban: 2,
      pomo: "PO",
      foder: "-",
      lat: -8.68,
      lng: 117.1,
    },
    {
      id: "12",
      name: "PLTD Alas",
      status: "operasi",
      dmn: 5,
      dmp: 3,
      beban: 3,
      pomo: "PO",
      foder: "-",
      lat: -8.52,
      lng: 116.98,
    },
    {
      id: "13",
      name: "PLTD Empang",
      status: "operasi",
      dmn: 6,
      dmp: 4,
      beban: 4,
      pomo: "PO",
      foder: "-",
      lat: -8.78,
      lng: 117.95,
    },
    {
      id: "14",
      name: "PLTD Plampang",
      status: "operasi",
      dmn: 5,
      dmp: 3,
      beban: 3,
      pomo: "PO",
      foder: "-",
      lat: -8.75,
      lng: 117.78,
    },
    {
      id: "15",
      name: "PLTD Pekat",
      status: "operasi",
      dmn: 4,
      dmp: 2,
      beban: 2,
      pomo: "PO",
      foder: "-",
      lat: -8.3,
      lng: 117.7,
    },
    {
      id: "16",
      name: "PLTD Sanggar",
      status: "operasi",
      dmn: 4,
      dmp: 2,
      beban: 2,
      pomo: "PO",
      foder: "-",
      lat: -8.32,
      lng: 118.3,
    },
    {
      id: "17",
      name: "PLTD Calabai",
      status: "operasi",
      dmn: 4,
      dmp: 2,
      beban: 2,
      pomo: "PO",
      foder: "-",
      lat: -8.23,
      lng: 117.9,
    },
    {
      id: "18",
      name: "PLTD Hu'u",
      status: "operasi",
      dmn: 5,
      dmp: 3,
      beban: 3,
      pomo: "PO",
      foder: "-",
      lat: -8.77,
      lng: 118.42,
    },
    {
      id: "19",
      name: "PLTD Kwangko",
      status: "operasi",
      dmn: 4,
      dmp: 2,
      beban: 2,
      pomo: "PO",
      foder: "-",
      lat: -8.65,
      lng: 118.22,
    },
    {
      id: "20",
      name: "PLTD Raba",
      status: "gangguan",
      dmn: 8,
      dmp: 4,
      beban: 0,
      pomo: "MO",
      foder: "-",
      lat: -8.47,
      lng: 118.75,
    },
    {
      id: "21",
      name: "PLTD Sumbawa City",
      status: "standby",
      dmn: 6,
      dmp: 3,
      beban: 0,
      pomo: "PO",
      foder: "-",
      lat: -8.5,
      lng: 117.42,
    },
    {
      id: "22",
      name: "PLTD Taliwang 2",
      status: "standby",
      dmn: 5,
      dmp: 2,
      beban: 0,
      pomo: "PO",
      foder: "-",
      lat: -8.75,
      lng: 116.84,
    },
    {
      id: "23",
      name: "PLTD Woha 2",
      status: "standby",
      dmn: 5,
      dmp: 2,
      beban: 0,
      pomo: "PO",
      foder: "-",
      lat: -8.59,
      lng: 118.71,
    },
    {
      id: "24",
      name: "PLTS Bima",
      status: "standby",
      dmn: 4,
      dmp: 2,
      beban: 0,
      pomo: "PO",
      foder: "-",
      lat: -8.45,
      lng: 118.74,
    },
  ]);

  const statusCounts = computed(() => calculateStatusCounts(sentralList.value));

  const filteredSentralList = computed(() =>
    filterSentralByStatus(sentralList.value, selectedStatusFilter.value),
  );

  const setStatusFilter = (status: string) => {
    selectedStatusFilter.value = status;
  };

  // State khusus Tab Energi
  const selectedSentralFilter = ref<string>("all");
  const selectedTimeRange = ref<string>("1D");
  const selectedInterval = ref<string>("5m");

  const timeRangeOptions = ["1D", "3D", "7D", "30D", "1Y", "ALL"];
  const intervalOptions = ["5m", "30m"];

  const fuelContributionList = ref([
    { name: "Batubara", energi: 4000, kontribusi: 40, color: "#334155" },
    { name: "Gas", energi: 2000, kontribusi: 20, color: "#F59E0B" },
    { name: "Minyak", energi: 3000, kontribusi: 30, color: "#EF4444" },
    { name: "Biomassa", energi: 1000, kontribusi: 10, color: "#10B981" },
  ]);

  const fuelSummary = ref({
    net: 10000,
    renewables: 5000,
    renewablesPercent: 50.0,
    totalBebanMW: "38.8 MW",
  });

  const generationMinMaxStats = ref([
    {
      label: "Demand (MWh)",
      min: 50,
      minDate: "2 Oktober 2025, 17:00 WIB",
      max: 50,
      maxDate: "2 Oktober 2025, 17:00 WIB",
    },
    {
      label: "Renewables (%)",
      min: 50,
      minDate: "2 Oktober 2025, 17:00 WIB",
      max: 50,
      maxDate: "2 Oktober 2025, 17:00 WIB",
    },
  ]);

  // ECharts Option for Generation Stacked Area Chart
  const energiGenerationChartOption = computed(() => {
    const times = [
      "14:00",
      "17:00",
      "20:00",
      "23:00",
      "02:00",
      "05:00",
      "08:00",
    ];
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: {
            color: "#94a3b8",
            width: 1,
            type: "dashed",
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#cbd5e1",
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: "#1e293b", fontSize: 11 },
      },
      grid: {
        top: 25,
        left: 20,
        right: 25,
        bottom: 25,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: times,
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: { color: "#64748b", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
      },
      series: [
        {
          name: "Biomassa",
          type: "line",
          stack: "Total",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1.5, color: "#10B981" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(16, 185, 129, 0.55)" },
                { offset: 1, color: "rgba(16, 185, 129, 0.1)" },
              ],
            },
          },
          data: [1000, 850, 900, 1200, 650, 900, 800],
        },
        {
          name: "Minyak",
          type: "line",
          stack: "Total",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1.5, color: "#EF4444" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(239, 68, 68, 0.5)" },
                { offset: 1, color: "rgba(239, 68, 68, 0.1)" },
              ],
            },
          },
          data: [800, 650, 700, 950, 450, 700, 600],
        },
        {
          name: "Gas",
          type: "line",
          stack: "Total",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1.5, color: "#F59E0B" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(245, 158, 11, 0.5)" },
                { offset: 1, color: "rgba(245, 158, 11, 0.1)" },
              ],
            },
          },
          data: [700, 600, 560, 850, 400, 600, 500],
        },
        {
          name: "Batubara",
          type: "line",
          stack: "Total",
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1.5, color: "#334155" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(51, 65, 85, 0.55)" },
                { offset: 1, color: "rgba(51, 65, 85, 0.1)" },
              ],
            },
          },
          data: [1500, 1200, 1100, 1550, 900, 1100, 1000],
        },
      ],
    };
  });

  // ECharts Option for Fuel Contribution Donut Chart
  const energiDonutChartOption = computed(() => {
    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} MWh ({d}%)",
      },
      series: [
        {
          name: "Kontribusi Energi",
          type: "pie",
          radius: ["68%", "88%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 3,
            borderColor: "#ffffff",
            borderWidth: 3,
          },
          label: {
            show: false,
          },
          data: [
            { value: 4000, name: "Batubara", itemStyle: { color: "#334155" } },
            { value: 2000, name: "Gas", itemStyle: { color: "#F59E0B" } },
            { value: 3000, name: "Minyak", itemStyle: { color: "#EF4444" } },
            { value: 1000, name: "Biomassa", itemStyle: { color: "#10B981" } },
          ],
        },
      ],
    };
  });

  return {
    selectedTab,
    selectedDate,
    selectedStatusFilter,
    systemSummary,
    sentralList,
    statusCounts,
    filteredSentralList,
    setStatusFilter,
    // Tab Energi Exports
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
  };
}
