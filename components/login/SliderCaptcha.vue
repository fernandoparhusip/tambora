<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { VueFinalModal } from "vue-final-modal";
import "vue-final-modal/style.css";
import { RefreshCcw, ShieldCheck } from "@lucide/vue";

// Define props
const props = defineProps({
  onCaptchaSuccess: {
    type: Function,
    default: () => {},
  },
  // Tambahkan prop untuk mode debug
  debug: {
    type: Boolean,
    default: false,
  },
});

// Define image list for random selection (High-speed CDN)
const imageList = [
  "https://images.unsplash.com/photo-1509390144018-eeaf65052242?auto=format&fit=crop&w=800&h=450&q=80", // Solar/Energy
  "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&h=450&q=80", // Wind turbine/Power
  "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&h=450&q=80", // Green energy
  "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&h=450&q=80", // Forest/Nature
  "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&h=450&q=80", // Mountain
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&h=450&q=80", // Landscape
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&h=450&q=80", // Night city
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&h=450&q=80", // Foggy hills
];

const fallbackImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/></svg>'
)}`;

// Reactive state
const imageSrc = ref("");
const sliderContainer = ref(null);
const imageContainer = ref(null);
const sliderHandle = ref(null);
const sliderWidth = 400; // Base slider width (will be responsive)
const pieceSize = 48; // Size of puzzle piece
let maxX = sliderWidth - pieceSize; // Akan diupdate saat rendering berdasarkan ukuran container sebenarnya

// Random target position (within reasonable limits)
const targetPosition = () => Math.floor(Math.random() * (maxX - 100) + 50);
const targetX = ref(targetPosition());
const tolerance = 25; // Ditingkatkan untuk toleransi yang lebih besar agar puzzle yang sudah benar tidak dianggap salah

// UI state
const pieceX = ref(0);
const dragging = ref(false);
const offsetX = ref(0);
const success = ref(false);
const fail = ref(false);
const isLoading = ref(false); // State untuk loading
const imageLoading = ref(false);
const imageError = ref(false);
const imageLoadToken = ref(0);
const imageWidth = ref(400); // Default lebar gambar, akan diupdate setelah mounting
const imageHeight = ref(225);
const debugInfo = ref({
  attempts: 0,
  lastDistance: 0,
  targetUpdates: 0,
  dimensionUpdates: 0,
});

function preloadImage(src, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      resolve(src);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("load-error"));
    };
    img.src = src;
  });
}

function getShuffledImages() {
  return [...imageList].sort(() => Math.random() - 0.5);
}

async function assignRandomImage() {
  const token = ++imageLoadToken.value;
  imageLoading.value = true;
  imageError.value = false;

  for (const src of getShuffledImages()) {
    try {
      await preloadImage(src, 2000);
      if (token !== imageLoadToken.value) return;
      imageSrc.value = src;
      imageLoading.value = false;
      nextTick(calculateDimensions);
      return;
    } catch {
      continue;
    }
  }

  if (token !== imageLoadToken.value) return;
  imageSrc.value = fallbackImage;
  imageError.value = true;
  imageLoading.value = false;
  nextTick(calculateDimensions);
}

function onImageLoad() {
  imageLoading.value = false;
  calculateDimensions();
}

function onImageError() {
  assignRandomImage();
}

// Computed styles
const targetImageX = computed(() => {
  const safeMaxX = Math.max(maxX, 1);
  const maxImageX = Math.max(imageWidth.value - pieceSize, 0);
  const relativePos = targetX.value / safeMaxX;
  return Math.max(0, Math.min(maxImageX, relativePos * maxImageX));
});

const targetImageY = computed(() =>
  Math.max((imageHeight.value - pieceSize) / 2, 0),
);

const shadowStyle = computed(() => {
  return {
    left: `${targetImageX.value}px`,
    width: `${pieceSize}px`,
    height: `${pieceSize}px`,
    opacity: 0.5,
    pointerEvents: "none",
    // Tambahkan border untuk membantu visualisasi target yang lebih jelas
    border: "1px dashed rgba(255,255,255,0.5)",
  };
});

const pieceStyle = computed(() => {
  const safeMaxX = Math.max(maxX, 1);
  const maxImageX = Math.max(imageWidth.value - pieceSize, 0);
  const relativePos = pieceX.value / safeMaxX;
  const imagePositionX = relativePos * maxImageX;

  return {
    left: `${imagePositionX}px`,
    transform: "translateY(-50%)",
    top: "50%",
    width: `${pieceSize}px`,
    height: `${pieceSize}px`,
    cursor: success.value ? "default" : "grab",
    transition: dragging.value ? "none" : "all 0.3s ease",
    pointerEvents: success.value ? "none" : "auto",
    // Tambahkan outline untuk membantu visualisasi posisi puzzle
    outline: dragging.value ? "2px solid rgba(59, 130, 246, 0.5)" : "none",
  };
});

const sliderButtonStyle = computed(() => ({
  left: `${Math.min(pieceX.value, maxX)}px`, // Pastikan tidak melebihi batas kanan
  transition: dragging.value
    ? "none"
    : "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", // Animasi yang lebih smooth
  cursor: success.value ? "default" : "grab",
  pointerEvents: success.value ? "none" : "auto",
  transform: "translateX(0)", // Mencegah slider keluar dari container
}));

// Event handlers
function startDrag(e) {
  if (success.value) return;

  // Prevent scrolling on mobile when dragging
  e.preventDefault();

  dragging.value = true;
  offsetX.value = (e.touches ? e.touches[0].clientX : e.clientX) - pieceX.value;

  // Add event listeners
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("touchmove", onDrag, { passive: false });
  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("touchend", stopDrag);
}

function onDrag(e) {
  if (!dragging.value) return;

  // Prevent default to stop scrolling on mobile
  if (e.cancelable) {
    e.preventDefault();
  }

  let clientX = e.touches ? e.touches[0].clientX : e.clientX;

  // Dapatkan bounding rectangle dari container slider
  if (sliderContainer.value) {
    const containerRect = sliderContainer.value.getBoundingClientRect();
    const handleWidth = 32; // Sesuaikan dengan ukuran handle yang sebenarnya (w-8)

    // Recalculate maxX based on container width
    const containerWidth = containerRect.width;
    // Mengupdate nilai untuk memastikan slider bisa mencapai ujung kanan container
    maxX = containerWidth - handleWidth;

    // Pastikan client tidak keluar dari batas container
    if (clientX < containerRect.left) clientX = containerRect.left;
    if (clientX > containerRect.right) clientX = containerRect.right;
  }

  let newX = clientX - offsetX.value;

  // Constrain within bounds - memastikan slidernya tetap dalam batas
  newX = Math.max(0, Math.min(maxX, newX));
  pieceX.value = newX;

  // Perbarui perhitungan jarak secara real-time untuk debugging
  const distance = Math.abs(pieceX.value - targetX.value);
  if (distance < tolerance * 1.5) {
    // Berikan visual feedback saat mendekati target
    sliderHandle.value?.classList.add("bg-blue-100");
  } else {
    sliderHandle.value?.classList.remove("bg-blue-100");
  }
}

async function stopDrag() {
  if (!dragging.value) return;
  dragging.value = false;

  // Update debug info
  debugInfo.value.attempts++;

  // Sesuaikan perhitungan dengan posisi relatif antara slider dan gambar
  // Karena slider dan puzzle piece bergerak dengan rasio yang sama
  const distance = Math.abs(pieceX.value - targetX.value);
  debugInfo.value.lastDistance = distance;

  // Implementasi algoritma verifikasi yang lebih akurat
  // Jika jarak sangat dekat (dalam 10px), anggap sebagai match sempurna
  // Jika jarak dalam toleransi, anggap sebagai match yang cukup baik
  const isPerfectMatch = distance < 10;
  const isGoodMatch = distance < tolerance;

  if (isPerfectMatch || isGoodMatch) {
    // Success case
    pieceX.value = targetX.value; // Snap to exact position
    success.value = true;
    fail.value = false;

    // Tampilkan indikator loading setelah berhasil
    isLoading.value = true;

    try {
      // Panggil langsung fungsi success handler dari prop
      if (props.onCaptchaSuccess) {
        await props.onCaptchaSuccess();
      }

      // Tunggu sebentar untuk UX yang lebih baik
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch {
      // Captcha handler error fallback
    } finally {
      // Matikan loading dan tutup modal
      isLoading.value = false;
      emit("close");
    }
  } else {
    // Fail case
    fail.value = true;
    setTimeout(() => {
      fail.value = false;
      // Reset slider position with animation
      pieceX.value = 0;
    }, 1000);
  }

  // Clean up event listeners
  removeEventListeners();
}

async function reset() {
  pieceX.value = 0;
  success.value = false;
  fail.value = false;

  await assignRandomImage();

  nextTick(() => {
    calculateDimensions();
    targetX.value = targetPosition();
  });
}

function removeEventListeners() {
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("touchmove", onDrag);
  window.removeEventListener("mouseup", stopDrag);
  window.removeEventListener("touchend", stopDrag);
}

// Define component events
const emit = defineEmits(["success", "close"]);

// Calculate slider and image dimensions
function calculateDimensions() {
  // Update debug counter
  debugInfo.value.dimensionUpdates++;

  // Get slider container dimensions
  if (sliderContainer.value) {
    const containerRect = sliderContainer.value.getBoundingClientRect();
    maxX = containerRect.width - pieceSize;
  }

  // Get image container dimensions
  if (imageContainer.value) {
    imageWidth.value = imageContainer.value.offsetWidth;
    imageHeight.value = imageContainer.value.offsetHeight;
    // Update targetX position to ensure consistency
    targetX.value = targetPosition();
    debugInfo.value.targetUpdates++;
  }
}

// Lifecycle hooks
onMounted(() => {
  reset();

  // Add keyboard escape key handler for accessibility
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", calculateDimensions);

  // Update dimensions after component is mounted and rendered
  nextTick(() => {
    calculateDimensions();

    // Tambahkan penundaan untuk memastikan semua perhitungan telah selesai
    setTimeout(calculateDimensions, 300);
  });
});

onUnmounted(() => {
  // Clean up all event listeners when component is destroyed
  removeEventListeners();
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("resize", calculateDimensions);
});

// Handle ESC key to close modal
function handleKeyDown(e) {
  if (e.key === "Escape") {
    emit("close");
  }
}
</script>

<template>
  <VueFinalModal
    :model-value="true"
    class="flex justify-center items-center z-[9999]"
    content-class="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-[2px_0px_25px_0px_rgba(0,67,101,0.1)] overflow-hidden border border-gray-100 z-[9999]"
    overlay-class="bg-black bg-opacity-50 z-[9998]"
    :lock-scroll="true"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    @update:model-value="
      (val) => {
        if (!val) emit('close');
      }
    "
  >
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white"
    >
      <LoadingIndicatorPLN />
      <p class="mt-4 text-gray-700 font-medium">Memproses verifikasi...</p>
    </div>
    <!-- Simplified modern header -->
    <div class="px-6 py-5 flex justify-between items-center border-b">
      <div class="flex items-center">
        <ShieldCheck class="w-4 h-4 text-[#8181A5] mr-2" />
        <span class="text-[#8181A5] font-medium">Verifikasi Captcha</span>
      </div>
      <button
        class="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
        aria-label="Tutup"
        @click="$emit('close')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="p-6 space-y-5">
      <!-- Captcha image area with puzzle piece -->
      <div
        ref="imageContainer"
        class="relative w-full aspect-video bg-gray-50 rounded-xl overflow-hidden shadow-sm"
      >
        <div
          v-if="imageLoading"
          class="absolute inset-0 z-20 flex items-center justify-center bg-white/80"
        >
          <div
            class="w-6 h-6 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"
          />
        </div>
        <img
          :src="imageSrc"
          alt="captcha"
          class="w-full h-full object-cover"
          decoding="async"
          loading="eager"
          @load="onImageLoad"
          @error="onImageError"
        >

        <!-- Puzzle piece shadow -->
        <div
          class="absolute top-1/2 left-[60%] -translate-y-1/2"
          :style="shadowStyle"
        >
          <svg width="48" height="48" viewBox="0 0 48 48">
            <path
              d="M8 8 h32 v32 h-32 z m16 0 a8 8 0 0 1 0 16 a8 8 0 0 1 0 -16"
              fill="rgba(0,0,0,0.5)"
            />
          </svg>
        </div>

        <!-- Draggable puzzle piece -->
        <div
          class="absolute top-1/2 z-10 cursor-grab active:cursor-grabbing"
          :style="pieceStyle"
          @mousedown.prevent="startDrag"
          @touchstart.prevent="startDrag"
        >
          <svg width="48" height="48" viewBox="0 0 48 48">
            <defs>
              <clipPath id="piece-shape">
                <path
                  d="M8 8 h32 v32 h-32 z m16 0 a8 8 0 0 1 0 16 a8 8 0 0 1 0 -16"
                />
              </clipPath>
            </defs>
            <image
              :href="imageSrc"
              :x="-targetImageX"
              :y="-targetImageY"
              :width="imageWidth"
              :height="imageHeight"
              clip-path="url(#piece-shape)"
            />
          </svg>
        </div>
      </div>

      <!-- Slider control -->
      <div class="flex items-center gap-3 mt-6">
        <button
          class="text-gray-400 hover:text-gray-600 p-2 rounded-full transition-all duration-300 focus:outline-none"
          title="Muat ulang gambar"
          @click="reset"
        >
          <RefreshCcw class="w-4 h-4" />
        </button>
        <div
          ref="sliderContainer"
          class="relative flex-1 h-12 bg-gray-100 rounded-full flex items-center"
        >
          <!-- Track indicator that fills as slider moves -->
          <div
            class="absolute left-0 h-full bg-gray-200 rounded-full z-0"
            :style="{
              width: `${Math.min((pieceX / maxX) * 100, 100)}%`,
              transition: dragging
                ? 'width 0.05s cubic-bezier(0.16, 1, 0.3, 1)'
                : 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }"
          />

          <!-- Slider handle -->
          <div
            class="absolute top-0 h-full flex items-center justify-center z-20 slider-handle overflow-visible"
            :style="sliderButtonStyle"
            @mousedown="startDrag"
            @touchstart="startDrag"
          >
            <div
              ref="sliderHandle"
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                success
                  ? 'bg-teal-500 shadow-md shadow-teal-200'
                  : 'bg-white shadow-md hover:shadow-[2px_0px_25px_0px_rgba(0,67,101,0.1)]',
              ]"
            >
              <svg
                v-if="success"
                class="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Status messages -->
      <div class="min-h-[24px] mt-3">
        <div
          v-if="success"
          class="flex items-center justify-center text-green-400 text-xs"
        >
          <span>✓ Verifikasi berhasil</span>
        </div>
        <div
          v-else-if="fail"
          class="flex items-center justify-center text-red-400 text-xs"
        >
          <span>Posisi tidak tepat, coba lagi</span>
        </div>
        <div v-else class="text-xs text-center text-gray-400">
          Geser untuk memposisikan puzzle
        </div>

        <!-- Debug info (hanya tampil jika mode debug aktif) -->
        <div
          v-if="props.debug"
          class="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600"
        >
          <div>Distance: {{ Math.abs(pieceX - targetX).toFixed(2) }}</div>
          <div>Tolerance: {{ tolerance }}</div>
          <div>Target: {{ targetX.toFixed(2) }}</div>
          <div>Current: {{ pieceX.toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>

<style scoped>
/* Styling untuk container slider dan puzzle */
.relative.flex-1.h-12 {
  position: relative;
  overflow: hidden;
}

/* Optimize performance */
.slider-handle {
  will-change: left;
}

/* Styling khusus untuk handle slider */
.slider-handle > div {
  transform: translateX(10%);
  transition:
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

/* Tambahan smooth transition untuk elemen-elemen UI */
img,
svg,
button {
  transition: all 0.2s ease;
}
</style>
