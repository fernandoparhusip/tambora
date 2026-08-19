<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Style, Circle, Fill } from "ol/style";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import LoadingIndicatorPLN from "~/components/base/LoadingIndicatorPLN.vue";

export interface MapMarkerItem {
  id?: string | number;
  lat: number;
  lng: number;
  color?: string;
  title?: string;
  subtitle?: string;
  [key: string]: any;
}

interface Props {
  /** Map center coordinates [longitude, latitude] */
  center?: [number, number];
  /** Zoom level (default: 8.5) */
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  /** Array of marker items to render */
  markers?: MapMarkerItem[];
  /** Tile server URL template */
  tileUrl?: string;
  /** Custom marker color function or static color */
  markerColor?: string | ((item: any) => string);
  /** Marker circle radius in px */
  markerRadius?: number;
  showZoomControls?: boolean;
  showFullscreenControl?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [117.85, -8.6],
  zoom: 8.5,
  minZoom: 3,
  maxZoom: 18,
  markers: () => [],
  tileUrl:
    "https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png",
  markerColor: "#2563EB",
  markerRadius: 8,
  showZoomControls: true,
  showFullscreenControl: true,
});

const emit = defineEmits<{
  "marker-click": [marker: any];
  "map-click": [];
  "zoom-change": [zoom: number];
  "fullscreen-change": [isFullscreen: boolean];
}>();

// 1. State
const mapWrapperRef = ref<HTMLElement | null>(null);
const mapContainerRef = ref<HTMLElement | null>(null);
const popupContainerRef = ref<HTMLElement | null>(null);
const selectedMarker = ref<any | null>(null);
const isFullscreen = ref<boolean>(false);
const isMapLoading = ref<boolean>(true);

let map: Map | null = null;
let vectorSource: VectorSource | null = null;
let overlay: Overlay | null = null;
let resizeObserver: ResizeObserver | null = null;

// 2. Watchers for reactive props
watch(
  () => props.markers,
  () => {
    updateFeatures();
  },
  { deep: true },
);

watch(
  () => props.center,
  (newCenter) => {
    if (map && newCenter) {
      map.getView().animate({
        center: fromLonLat(newCenter),
        duration: 500,
      });
    }
  },
  { deep: true },
);

watch(
  () => props.zoom,
  (newZoom) => {
    if (map && typeof newZoom === "number") {
      map.getView().animate({
        zoom: newZoom,
        duration: 300,
      });
    }
  },
);

// 3. Methods / handlers
/** Get color string for a marker item */
const getMarkerHexColor = (item: any): string => {
  if (typeof props.markerColor === "function") {
    return props.markerColor(item);
  }
  return item.color || props.markerColor || "#2563EB";
};

/** Convert hex color string to rgba with opacity */
const hexToRgba = (hex: string, opacity: number): string => {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/** Render marker features onto OpenLayers vector source */
const updateFeatures = () => {
  if (!vectorSource) return;
  vectorSource.clear();

  props.markers.forEach((item) => {
    if (typeof item.lat !== "number" || typeof item.lng !== "number") return;

    const feature = new Feature({
      geometry: new Point(fromLonLat([item.lng, item.lat])),
      itemData: item,
    });

    const hexColor = getMarkerHexColor(item);

    // Render halo outer ring + inner solid dot matching Sentral list design
    feature.setStyle([
      new Style({
        image: new Circle({
          radius: props.markerRadius + 4,
          fill: new Fill({ color: hexToRgba(hexColor, 0.25) }),
        }),
      }),
      new Style({
        image: new Circle({
          radius: props.markerRadius,
          fill: new Fill({ color: hexColor }),
        }),
      }),
    ]);

    vectorSource!.addFeature(feature);
  });
};

/** Initialize OpenLayers map instance */
const initMap = async () => {
  if (!mapContainerRef.value) return;
  await nextTick();

  vectorSource = new VectorSource();
  const vectorLayer = new VectorLayer({
    source: vectorSource,
  });

  const rasterLayer = new TileLayer({
    source: new XYZ({
      url: props.tileUrl,
      maxZoom: props.maxZoom,
    }),
  });

  if (popupContainerRef.value) {
    overlay = new Overlay({
      element: popupContainerRef.value,
      autoPan: {
        animation: { duration: 250 },
      },
    });
  }

  map = new Map({
    target: mapContainerRef.value,
    layers: [rasterLayer, vectorLayer],
    view: new View({
      center: fromLonLat(props.center),
      zoom: props.zoom,
      minZoom: props.minZoom,
      maxZoom: props.maxZoom,
    }),
    controls: [],
    overlays: overlay ? [overlay] : [],
  });

  map.once("postrender", () => {
    isMapLoading.value = false;
  });

  setTimeout(() => {
    isMapLoading.value = false;
  }, 400);

  // Handle marker selection / map click
  map.on("click", (evt) => {
    const feature = map?.forEachFeatureAtPixel(evt.pixel, (f) => f);
    if (feature) {
      const item = feature.get("itemData");
      if (item) {
        selectedMarker.value = item;
        const geom = feature.getGeometry() as Point;
        if (overlay) overlay.setPosition(geom.getCoordinates());
        emit("marker-click", item);
      }
    } else {
      selectedMarker.value = null;
      if (overlay) overlay.setPosition(undefined);
      emit("map-click");
    }
  });

  // Pointer hover cursor state
  map.on("pointermove", (evt) => {
    if (!mapContainerRef.value || !map) return;
    const hit = map.hasFeatureAtPixel(evt.pixel);
    mapContainerRef.value.style.cursor = hit ? "pointer" : "";
  });

  // Emit zoom changes
  map.getView().on("change:resolution", () => {
    const currentZoom = map?.getView().getZoom() || props.zoom;
    emit("zoom-change", currentZoom);
  });

  updateFeatures();

  setTimeout(() => {
    map?.updateSize();
  }, 150);
};

/** Zoom Controls */
const zoomIn = () => {
  const view = map?.getView();
  if (view) {
    view.setZoom((view.getZoom() || props.zoom) + 0.5);
  }
};

const zoomOut = () => {
  const view = map?.getView();
  if (view) {
    view.setZoom((view.getZoom() || props.zoom) - 0.5);
  }
};

/** Fullscreen Toggle */
const toggleFullscreen = () => {
  const elem = mapWrapperRef.value;
  if (!elem) return;

  if (!document.fullscreenElement && !(elem as any).webkitFullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {
        isFullscreen.value = !isFullscreen.value;
      });
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else {
      isFullscreen.value = !isFullscreen.value;
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {
        isFullscreen.value = false;
      });
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else {
      isFullscreen.value = false;
    }
  }
};

const handleFullscreenChange = () => {
  const elem = mapWrapperRef.value;
  const isFs =
    document.fullscreenElement === elem ||
    (document as any).webkitFullscreenElement === elem;
  isFullscreen.value = isFs;
  emit("fullscreen-change", isFs);

  nextTick(() => {
    setTimeout(() => {
      map?.updateSize();
    }, 100);
  });
};

// 4. Lifecycle hooks
onMounted(() => {
  if (import.meta.client) {
    initMap();

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    if (mapContainerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        map?.updateSize();
      });
      resizeObserver.observe(mapContainerRef.value);
    }
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange,
    );
  }
  resizeObserver?.disconnect();
  map?.setTarget(undefined);
  map = null;
});

defineExpose({
  map,
  zoomIn,
  zoomOut,
  toggleFullscreen,
  updateFeatures,
});
</script>

<template>
  <div
    ref="mapWrapperRef"
    class="relative w-full h-full min-h-0 bg-slate-100 rounded-lg overflow-hidden shadow-xs border border-gray-200/80 flex flex-col transition-all duration-200"
    :class="{
      'fixed inset-0 z-50 rounded-none border-none max-w-none max-h-none':
        isFullscreen,
    }"
  >
    <!-- OpenLayers Map Container -->
    <div ref="mapContainerRef" class="absolute inset-0 w-full h-full z-0" />

    <!-- Centered Loading Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMapLoading"
        class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-100/90 backdrop-blur-xs pointer-events-none rounded-lg"
      >
        <LoadingIndicatorPLN />
        <span class="mt-2 text-xs font-semibold text-slate-500">Memuat Peta...</span>
      </div>
    </Transition>

    <!-- Popup Container Slot / Overlay -->
    <div
      ref="popupContainerRef"
      class="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-xs font-sans text-slate-800 min-w-[200px]"
      :style="{ display: selectedMarker ? 'block' : 'none' }"
    >
      <slot name="popup" :marker="selectedMarker">
        <div v-if="selectedMarker">
          <div class="font-bold text-sm mb-1 text-slate-900">
            {{ selectedMarker.title || selectedMarker.name || "Detail Lokasi" }}
          </div>
          <div
            v-if="selectedMarker.subtitle"
            class="text-slate-500 text-xs mb-1"
          >
            {{ selectedMarker.subtitle }}
          </div>
        </div>
      </slot>
    </div>

    <!-- Top Left Overlay (Legend / Filter Slot) -->
    <div
      v-if="$slots['top-left'] || $slots.legend"
      class="absolute top-4 left-4 z-10 max-w-[calc(100%-4rem)] overflow-x-auto custom-horizontal-scrollbar"
    >
      <slot name="top-left">
        <slot name="legend" />
      </slot>
    </div>

    <!-- Top Center Overlay Slot -->
    <div
      v-if="$slots['top-center']"
      class="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-[calc(100%-2rem)] flex justify-center pointer-events-auto"
    >
      <slot name="top-center" />
    </div>

    <!-- Top Right Custom Controls Slot -->
    <div v-if="$slots['top-right']" class="absolute top-4 right-4 z-10">
      <slot name="top-right" />
    </div>

    <!-- Bottom Right Map Controls (Zoom In, Zoom Out, Fullscreen) -->
    <div
      class="absolute bottom-6 right-5 z-10 flex flex-col bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-gray-200/80 overflow-hidden divide-y divide-gray-100"
    >
      <!-- Fullscreen Toggle -->
      <button
        v-if="showFullscreenControl"
        type="button"
        class="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        :title="isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Fullscreen)'"
        @click="toggleFullscreen"
      >
        <!-- Compress Icon (Exit Fullscreen) -->
        <svg
          v-if="isFullscreen"
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25"
          />
        </svg>
        <!-- Expand Icon (Enter Fullscreen) -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      </button>

      <!-- Zoom In -->
      <button
        v-if="showZoomControls"
        type="button"
        class="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="Perbesar (Zoom In)"
        @click="zoomIn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>

      <!-- Zoom Out -->
      <button
        v-if="showZoomControls"
        type="button"
        class="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        title="Perkecil (Zoom Out)"
        @click="zoomOut"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 12h-15"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-horizontal-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-horizontal-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.6);
  border-radius: 4px;
}
</style>
