<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { gsap } from "gsap";

const authStore = useAuthStore();

const fullName = computed(() => {
  return (
    authStore.user?.full_name ||
    authStore.user?.nama ||
    authStore.user?.username ||
    "Pengguna"
  );
});

const logoRef = ref<HTMLElement | null>(null);
const subtitleRef = ref<HTMLElement | null>(null);

const displayedText = ref("");
const isTyping = ref(true);
let typeTimeout: ReturnType<typeof setTimeout> | null = null;

const fullGreetingText = computed(() => `Halo, ${fullName.value}`);

const runEntranceAnimation = () => {
  if (!import.meta.client) return;

  nextTick(() => {
    // 1. Logo entrance animation (Smooth scale & fade in)
    if (logoRef.value) {
      gsap.killTweensOf(logoRef.value);
      gsap.fromTo(
        logoRef.value,
        { opacity: 0, scale: 0.92, y: 8 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
        }
      );
    }

    // 2. Start Typewriter
    startTypewriter();
  });
};

const startTypewriter = () => {
  if (typeTimeout) clearTimeout(typeTimeout);

  const target = fullGreetingText.value;
  let index = 0;
  displayedText.value = "";
  isTyping.value = true;

  if (subtitleRef.value) {
    gsap.killTweensOf(subtitleRef.value);
    gsap.set(subtitleRef.value, { opacity: 0, y: 12 });
  }

  const typeNextChar = () => {
    if (index < target.length) {
      displayedText.value += target.charAt(index);
      index++;
      typeTimeout = setTimeout(typeNextChar, 50);
    } else {
      isTyping.value = false;
      // Animate subtitle in once typewriter finishes
      if (subtitleRef.value) {
        gsap.fromTo(
          subtitleRef.value,
          { opacity: 0, y: 12, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
          }
        );
      }
    }
  };

  // Start typing after short initial pause
  typeTimeout = setTimeout(typeNextChar, 300);
};

onMounted(() => {
  runEntranceAnimation();
});

// If user logs in and user object updates asynchronously, re-trigger greeting typewriter
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser && displayedText.value === "Halo, Pengguna") {
      startTypewriter();
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (typeTimeout) {
    clearTimeout(typeTimeout);
  }
  if (logoRef.value) gsap.killTweensOf(logoRef.value);
  if (subtitleRef.value) gsap.killTweensOf(subtitleRef.value);
});
</script>

<template>
  <div
    class="h-full w-full flex-1 flex flex-col items-center justify-center relative overflow-hidden select-none"
  >
    <div
      ref="logoRef"
      class="relative flex items-center justify-center w-[80%] h-[80%]"
    >
      <img
        src="~/assets/logo/LogoWelcome.svg"
        class="w-full h-full object-contain pointer-events-none"
      >
      <div
        class="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
      >
        <h1
          class="text-xl sm:text-2xl md:text-[26px] font-semibold text-gray-800 tracking-tight mb-1.5 min-h-[36px] flex items-center justify-center"
        >
          <span>{{ displayedText }}</span>
          <span
            class="inline-block w-[2px] h-6 bg-blue-600 ml-1 rounded-sm transition-opacity duration-150"
            :class="isTyping ? 'animate-pulse opacity-100' : 'opacity-0'"
          />
        </h1>
        <p
          ref="subtitleRef"
          class="text-xs sm:text-[13px] text-gray-500 font-normal tracking-wide opacity-0"
        >
          Selamat Datang di Aplikasi <span class="font-semibold">MAPP TAMBORA</span>
        </p>
      </div>
    </div>
  </div>
</template>
