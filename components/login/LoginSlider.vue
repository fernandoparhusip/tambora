<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import imageLowRes1 from "@/assets/image/LowRes/image1.png";
import imageLowRes2 from "@/assets/image/LowRes/image2.png";
import imageLowRes3 from "@/assets/image/LowRes/image3.png";
import imageLowRes4 from "@/assets/image/LowRes/image4.png";
import imageLowRes5 from "@/assets/image/LowRes/image5.png";
import imageHighRes1 from "@/assets/image/HighRes/image1.png";
import imageHighRes2 from "@/assets/image/HighRes/image2.png";
import imageHighRes3 from "@/assets/image/HighRes/image3.png";
import imageHighRes4 from "@/assets/image/HighRes/image4.png";
import imageHighRes5 from "@/assets/image/HighRes/image5.png";
import "vue3-carousel/carousel.css";
import { Carousel, Slide, Navigation, Pagination } from "vue3-carousel";
import { ChevronLeft, ChevronRight } from "@lucide/vue";

const isFastConnection = ref(false);
const hasCheckedSpeed = ref(false);
let connectionRef: any = null;

const slidesLow = [
  imageLowRes1,
  imageLowRes2,
  imageLowRes3,
  imageLowRes4,
  imageLowRes5,
];
const slidesHigh = [
  imageHighRes1,
  imageHighRes2,
  imageHighRes3,
  imageHighRes4,
  imageHighRes5,
];

function getConnection() {
  if (!import.meta.client) return null;
  const nav = typeof navigator !== "undefined" ? navigator : null;
  if (!nav) return null;
  return (
    (nav as any).connection ||
    (nav as any).mozConnection ||
    (nav as any).webkitConnection ||
    null
  );
}

function updateConnection() {
  if (!connectionRef) return;
  const anyConnection = connectionRef;
  if (anyConnection.effectiveType) {
    isFastConnection.value = anyConnection.effectiveType === "4g";
  } else if (typeof anyConnection.downlink === "number") {
    isFastConnection.value = anyConnection.downlink >= 5;
  }
  hasCheckedSpeed.value = true;
}

async function runSpeedTestFallback() {
  const testUrl = imageLowRes1;
  const start = performance.now();
  try {
    const response = await fetch(testUrl);
    await response.blob();
    const duration = performance.now() - start;
    isFastConnection.value = duration < 400;
  } catch (error) {
    isFastConnection.value = false;
  } finally {
    hasCheckedSpeed.value = true;
  }
}

onMounted(() => {
  connectionRef = getConnection();
  if (
    connectionRef &&
    (connectionRef.effectiveType || typeof connectionRef.downlink === "number")
  ) {
    updateConnection();
    if (connectionRef.addEventListener) {
      connectionRef.addEventListener("change", updateConnection);
    }
  } else {
    runSpeedTestFallback();
  }
});

onBeforeUnmount(() => {
  if (connectionRef && connectionRef.removeEventListener) {
    connectionRef.removeEventListener("change", updateConnection);
  }
});

const slides = computed(() => {
  if (!hasCheckedSpeed.value) {
    return slidesLow;
  }
  return isFastConnection.value ? slidesHigh : slidesLow;
});

const carouselConfig = {
  itemsToShow: 1.05,
  snapAlign: "start" as const,
  wrapAround: true,
  autoplay: 5000,
  pauseAutoplayOnHover: true,
  mouseDrag: true,
  touchDrag: true,
};
</script>

<template>
  <div class="flex h-full w-full items-center justify-center">
    <Carousel v-bind="carouselConfig" class="h-full w-full overflow-hidden">
      <Slide v-for="(image, index) in slides" :key="index">
        <div class="relative h-full w-full rounded-[24px] overflow-hidden">
          <img
            :src="image"
            alt="Slider Image"
            class="w-full h-full object-cover"
          >
          <div class="absolute inset-0 bg-black/30"/>
        </div>
      </Slide>

      <template #addons>
        <Navigation>
          <template #prev>
            <button
              class="p-3 ml-10 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-white transition border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] focus:outline-none"
            >
              <ChevronLeft class="w-6 h-6" />
            </button>
          </template>

          <template #next>
            <button
              class="p-3 mr-24 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-white transition border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] focus:outline-none"
            >
              <ChevronRight class="w-6 h-6" />
            </button>
          </template>
        </Navigation>
        <Pagination />
      </template>
    </Carousel>
  </div>
</template>

<style scoped>
.carousel {
  height: 100%;
}

.carousel__viewport {
  height: 100%;
  padding-top: 0;
  padding-bottom: 0;
}

.carousel__track {
  height: 100%;
}

.carousel__slide {
  height: 100%;
  padding-right: 0.5rem;
  padding-left: 0;
}

.carousel__prev,
.carousel__next {
  top: 50%;
  transform: translateY(-50%);
}

.carousel__prev {
  left: 1.25rem;
}

.carousel__next {
  right: 1.25rem;
}

:deep(.carousel__pagination) {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.4rem;
}

:deep(.carousel__pagination-item) {
  margin: 0;
}

:deep(.carousel__pagination-button) {
  width: 1.2rem;
  height: 0.35rem;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  padding: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
  transition: all 0.25s ease;
}

:deep(.carousel__pagination-item--active .carousel__pagination-button),
:deep(.carousel__pagination-button--active) {
  width: 2.2rem;
  background-color: #2671d9 !important;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.7);
}
</style>
