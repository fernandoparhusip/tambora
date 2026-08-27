<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "~/stores/auth";
import { gsap } from "gsap";

const authStore = useAuthStore();

const fullName = computed(() => {
  return authStore.user?.full_name || authStore.user?.nama || authStore.user?.username || "User";
});

const logoRef = ref<HTMLElement | null>(null);
const subtitleRef = ref<HTMLElement | null>(null);

const displayedText = ref("");
const isTyping = ref(true);
let typeTimeout: any = null;

const fullGreetingText = computed(() => `Halo, ${fullName.value}`);

const startTypewriter = () => {
  const target = fullGreetingText.value;
  let index = 0;
  displayedText.value = "";
  isTyping.value = true;

  const typeNextChar = () => {
    if (index < target.length) {
      displayedText.value += target.charAt(index);
      index++;
      typeTimeout = setTimeout(typeNextChar, 55);
    } else {
      isTyping.value = false;
      // Animate subtitle in once typewriter finishes
      if (subtitleRef.value) {
        gsap.fromTo(
          subtitleRef.value,
          { opacity: 0, y: 14, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }
        );
      }
    }
  };

  // Start typing after initial entrance
  typeTimeout = setTimeout(typeNextChar, 400);
};

onMounted(() => {
  if (import.meta.client) {
    // 1. Logo entrance fade-in & soft scale (once, then stays still)
    if (logoRef.value) {
      gsap.fromTo(
        logoRef.value,
        { opacity: 0, scale: 0.94 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: "power3.out"
        }
      );
    }

    // 3. Start Typewriter effect
    startTypewriter();
  }
});

onBeforeUnmount(() => {
  if (typeTimeout) {
    clearTimeout(typeTimeout);
  }
});
</script>

<template>
  <div class="h-full w-full flex-1 flex flex-col items-center justify-center relative overflow-hidden select-none">
    <div ref="logoRef" class="relative flex items-center justify-center w-[80%] h-[80%]">
      <img
        src="~/assets/logo/LogoWelcome.png"
        class="w-full h-full object-contain pointer-events-none transition-all duration-300"
      >
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 class="text-xl sm:text-2xl md:text-[26px] font-semibold text-gray-800 tracking-tight mb-1.5 min-h-[36px] flex items-center justify-center">
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
          Selamat Datang di Aplikasi MAPP TAMBORA
        </p>
      </div>
    </div>
  </div>
</template>
