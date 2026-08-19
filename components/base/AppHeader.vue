<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// ─── Dropdown & Notif state ───────────────────────────────────────────────────
const dropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const notifCount = ref(0);
const isLoggingOut = ref(false);

const toggleDropdown = () => {
  if (isLoggingOut.value) return;
  dropdownOpen.value = !dropdownOpen.value;
};
const closeDropdown = () => {
  if (isLoggingOut.value) return;
  dropdownOpen.value = false;
};
const toggleNotif = () => {
  /* implementasi panel notif */
};

// Close dropdown when clicking outside
const handleOutsideClick = (e: MouseEvent) => {
  if (isLoggingOut.value) return;
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false;
  }
};
onMounted(() => document.addEventListener("mousedown", handleOutsideClick));
onBeforeUnmount(() =>
  document.removeEventListener("mousedown", handleOutsideClick),
);

// ─── Logout ───────────────────────────────────────────────────────────────────
const handleLogout = async () => {
  if (isLoggingOut.value) return;
  isLoggingOut.value = true;

  // Smooth loading animation delay before navigating away
  await new Promise((resolve) => setTimeout(resolve, 650));

  await authStore.logout();
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#4F46E5",
  "#0891B2",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#DB2777",
  "#2563EB",
];

const cachedName = ref(authStore.user?.nama ?? "User");
watch(
  () => authStore.user?.nama,
  (newVal) => {
    if (newVal) cachedName.value = newVal;
  },
  { immediate: true },
);

const initials = computed(() => {
  const nama = authStore.user?.nama || cachedName.value;
  return nama
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
});

const avatarColor = computed(() => {
  const nama = authStore.user?.nama || cachedName.value;
  const idx = nama.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
});

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  home: "Home",
  dashboard: "Dashboard",
  operasiPembangkit: "Operasi Pembangkit",
  "operasi-pembangkit": "Operasi Pembangkit",
  master: "Master",
  user: "Pengguna",
  pegawai: "Pegawai",
  transaksi: "Transaksi",
};

interface Crumb {
  label: string;
  path: string;
  isLink: boolean;
}

const breadcrumbs = computed<Crumb[]>(() => {
  const segments = route.path.replace(/^\//, "").split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  const allRoutes = router.getRoutes();
  let accumulated = "";

  for (const seg of segments) {
    accumulated += `/${seg}`;
    // Silently check if route exists in router table without triggering router.resolve warnings
    const isLink = allRoutes.some(
      (r) => r.path === accumulated || r.path === `${accumulated}/`,
    );

    crumbs.push({
      label: ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
      path: accumulated,
      isLink,
    });
  }

  return crumbs;
});
</script>

<template>
  <header
    class="w-full h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm"
  >
    <!-- Breadcrumb (kiri) -->
    <nav class="flex items-center gap-1 text-xs text-gray-500 select-none">
      <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.path">
        <NuxtLink
          v-if="idx < breadcrumbs.length - 1 && crumb.isLink"
          :to="crumb.path"
          class="text-[#2563EB] hover:underline font-medium transition-colors"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span v-else class="text-gray-500 font-normal">{{ crumb.label }}</span>
        <span v-if="idx < breadcrumbs.length - 1" class="text-gray-300 mx-0.5"
          >›</span
        >
      </template>
    </nav>

    <!-- Kanan: Notifikasi + Grid + Avatar -->
    <div class="flex items-center gap-2">
      <!-- Notifikasi Bell -->
      <button
        id="header-btn-notification"
        class="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        title="Notifikasi"
        @click="toggleNotif"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <!-- Badge notif (opsional, tampilkan jika ada notif) -->
        <span
          v-if="notifCount > 0"
          class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"
        />
      </button>

      <!-- Grid / Apps -->
      <button
        id="header-btn-apps"
        class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        title="Aplikasi"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </button>

      <!-- Avatar + Dropdown -->
      <div ref="dropdownRef" class="relative">
        <button
          id="header-btn-user"
          class="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors group"
          @click="toggleDropdown"
        >
          <!-- Avatar circle dengan inisial -->
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            :style="{ backgroundColor: avatarColor }"
          >
            {{ initials }}
          </div>
          <!-- Inisial teks kecil di sebelah avatar -->
          <span
            class="text-xs font-semibold text-gray-600 group-hover:text-gray-900"
          >
            {{ initials }}
          </span>
          <!-- Chevron -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 h-3.5 text-gray-400 transition-transform"
            :class="{ 'rotate-180': dropdownOpen }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-1"
        >
          <div
            v-if="dropdownOpen"
            class="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 origin-top-right"
          >
            <!-- Info user -->
            <div class="px-4 py-2.5 border-b border-gray-100">
              <p class="text-sm font-semibold text-gray-800 truncate">
                {{ authStore.user?.nama }}
              </p>
              <p class="text-xs text-gray-400 truncate">
                {{ authStore.user?.role }}
              </p>
            </div>

            <!-- Menu items -->
            <button
              class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              @click="closeDropdown"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profil Saya
            </button>

            <button
              class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              @click="closeDropdown"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Pengaturan
            </button>

            <div class="my-1 border-t border-gray-100" />

            <button
              id="header-btn-logout"
              type="button"
              :disabled="isLoggingOut"
              class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              @click="handleLogout"
            >
              <svg
                v-if="isLoggingOut"
                class="w-4 h-4 animate-spin text-red-500 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span class="font-medium">{{
                isLoggingOut ? "Keluar..." : "Keluar"
              }}</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
