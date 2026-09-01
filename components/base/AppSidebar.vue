<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import {
  menuItems,
  type MenuItem,
  type SubMenuItem,
} from "~/config/navigation";

// Logo Assets
import LogoFullPLN from "@/assets/logo/LogoFullPLN.svg";
import LogoTamboraSidebar from "@/assets/logo/LogoTamboraSidebar.svg";

// Menu Icons Auto-Loader (Vite glob)
const menuIcons = import.meta.glob("@/assets/icon/menu/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const getMenuIcon = (key: string): string => {
  const iconNameMap: Record<string, string> = {
    dashboard: "DashboardIcon",
    master: "MasterIcon",
    transaksi: "TransaksiIcon",
    konfigurasiAplikasi: "KonfigurasiAplikasiIcon",
    "konfigurasi-aplikasi": "KonfigurasiAplikasiIcon",
  };
  const targetName = iconNameMap[key];
  if (!targetName) return "";

  for (const [filePath, iconSrc] of Object.entries(menuIcons)) {
    if (filePath.includes(targetName)) {
      return iconSrc;
    }
  }
  return "";
};

// State & Router
const route = useRoute();
const isExpanded = ref(false);
const openKeys = ref<string[]>([]);
const openSubKeys = ref<string[]>([]);

// Auto-scroll active menu item into view
const scrollToActiveItem = () => {
  if (!import.meta.client) return;
  nextTick(() => {
    const activeEl = document.querySelector(
      "aside nav a.bg-\\[\\#E9F1FB\\], aside nav button.bg-\\[\\#E9F1FB\\]",
    );
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
};

// Sync open accordion sections with the active route
const syncOpenKeysWithRoute = () => {
  const currentPath = route.path;
  const newOpenKeys: string[] = [];
  const newOpenSubKeys: string[] = [];

  menuItems.forEach((item) => {
    if (item.children) {
      const hasActiveChild = item.children.some((sub) => {
        if (sub.path && currentPath === sub.path) return true;
        if (sub.children) {
          const hasActiveLeaf = sub.children.some(
            (c) => currentPath === c.path,
          );
          if (hasActiveLeaf) {
            newOpenSubKeys.push(sub.key);
            return true;
          }
        }
        return false;
      });

      if (hasActiveChild) {
        newOpenKeys.push(item.key);
      }
    }
  });

  openKeys.value = newOpenKeys;
  openSubKeys.value = newOpenSubKeys;
  scrollToActiveItem();
};

// Initial sync & sync on route navigation
syncOpenKeysWithRoute();
watch(
  () => route.path,
  () => {
    syncOpenKeysWithRoute();
  },
);

// Active status helpers
const isGroupActive = (item: MenuItem): boolean => {
  if (item.path && item.path !== "/home" && route.path === item.path)
    return true;
  if (item.children) {
    return item.children.some((sub) => {
      if (sub.path && route.path === sub.path) return true;
      if (sub.children) {
        return sub.children.some((c) => route.path === c.path);
      }
      return false;
    });
  }
  return false;
};

const isSubGroupActive = (sub: SubMenuItem): boolean => {
  if (sub.path && route.path === sub.path) return true;
  if (sub.children) {
    return sub.children.some((c) => route.path === c.path);
  }
  return false;
};

const isChildActive = (childPath: string): boolean => {
  return route.path === childPath;
};

const toggleItem = (item: MenuItem) => {
  if (item.children) {
    if (!isExpanded.value) {
      isExpanded.value = true;
    }
    const idx = openKeys.value.indexOf(item.key);
    if (idx === -1) {
      openKeys.value.push(item.key);
    } else {
      openKeys.value.splice(idx, 1);
    }
  } else if (item.path) {
    navigateTo(item.path);
  }
};

const toggleSubItem = (key: string) => {
  const idx = openSubKeys.value.indexOf(key);
  if (idx === -1) {
    openSubKeys.value.push(key);
  } else {
    openSubKeys.value.splice(idx, 1);
  }
};

const handleMouseLeave = () => {
  isExpanded.value = false;
};
</script>

<template>
  <aside
    class="absolute left-0 top-0 bottom-0 z-50 flex flex-col bg-white border-r border-gray-100 shrink-0 transition-all duration-300 ease-in-out shadow-md"
    :class="isExpanded ? 'w-[350px]' : 'w-[80px]'"
    @mouseenter="isExpanded = true"
    @mouseleave="handleMouseLeave"
  >
    <!-- ── Logo Header ────────────────────────────────────────── -->
    <div
      class="h-16 flex items-center shrink-0 px-4 overflow-hidden border-b border-gray-50 relative"
    >
      <!-- Logo Tambora Sidebar (collapsed default) -->
      <img
        :src="LogoTamboraSidebar"
        alt="Tambora Logo"
        class="h-15 w-auto object-contain shrink-0 transition-all duration-300 ease-in-out transform"
        :class="
          isExpanded
            ? 'opacity-0 scale-90 pointer-events-none'
            : 'opacity-100 scale-100'
        "
      />
      <!-- Full logo PLN (expanded) -->
      <img
        :src="LogoFullPLN"
        alt="PLN Logo"
        class="h-10 w-auto object-contain absolute left-4 transition-all duration-300 ease-in-out transform"
        :class="
          isExpanded
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        "
      />
    </div>

    <!-- ── Navigation Items ───────────────────────────────────── -->
    <nav
      class="flex-1 py-3 px-3.5 overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar"
    >
      <div v-for="item in menuItems" :key="item.key" class="relative">
        <!-- Level 1 Parent Button -->
        <div class="relative">
          <button
            class="group relative w-full flex items-center gap-3.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 overflow-hidden cursor-pointer"
            :class="[
              isGroupActive(item)
                ? 'bg-[#E9F1FB] text-[#2671D9] font-semibold shadow-xs'
                : 'text-[#5A6E85] hover:bg-[#E9F1FB] hover:text-[#2671D9]',
            ]"
            @click="toggleItem(item)"
          >
            <!-- Active/Hover Left Accent Indicator attached directly to button's left edge -->
            <div
              class="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-6 bg-[#2671D9] rounded-r-md transition-all duration-200"
              :class="
                isGroupActive(item)
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'
              "
            />
            <!-- Icon -->
            <span class="shrink-0 w-7 h-7 flex items-center justify-center">
              <img
                :src="getMenuIcon(item.key)"
                :alt="item.label"
                class="object-contain transition-all duration-200"
                :class="
                  isGroupActive(item)
                    ? 'opacity-100 scale-105'
                    : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'
                "
              />
            </span>

            <!-- Label (Expanded only) -->
            <span
              v-if="isExpanded"
              class="flex-1 text-left text-[12px] font-lato font-semibold truncate whitespace-nowrap"
            >
              {{ item.label }}
            </span>

            <!-- Chevron Icon -->
            <svg
              v-if="isExpanded && item.children"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 shrink-0 transition-transform duration-200"
              :class="[
                openKeys.includes(item.key)
                  ? 'rotate-180 text-[#2671D9]'
                  : 'text-gray-400 group-hover:text-[#2671D9]',
              ]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <!-- Level 2 Submenu Accordion (Expanded only) -->
        <Transition name="submenu">
          <div
            v-if="isExpanded && item.children && openKeys.includes(item.key)"
            class="relative ml-6 pl-4 border-l-2 border-gray-200/80 my-2 space-y-1.5"
          >
            <div
              v-for="subItem in item.children"
              :key="subItem.key"
              class="group relative"
            >
              <!-- Solid Blue line spanning height of active or hovered sub-group/item, seamless across adjacent items -->
              <span
                class="absolute -left-[17px] -top-1 -bottom-1 w-[2.5px] bg-[#2671D9] z-10 transition-opacity duration-150"
                :class="
                  isChildActive(subItem.path || '') || isSubGroupActive(subItem)
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                "
              />

              <!-- If Level 2 has children (Level 3 Nested Accordion) -->
              <template v-if="subItem.children">
                <button
                  class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer"
                  :class="
                    isSubGroupActive(subItem)
                      ? 'bg-[#E9F1FB] text-[#2671D9] font-semibold'
                      : 'text-[#5A6E85] hover:text-[#2671D9] hover:bg-[#E9F1FB]'
                  "
                  @click="toggleSubItem(subItem.key)"
                >
                  <span class="truncate whitespace-nowrap">{{
                    subItem.label
                  }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                    :class="
                      openSubKeys.includes(subItem.key)
                        ? 'rotate-180 text-[#2671D9]'
                        : 'text-gray-400 group-hover:text-[#2671D9]'
                    "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <!-- Level 3 Children -->
                <Transition name="submenu">
                  <div
                    v-if="openSubKeys.includes(subItem.key)"
                    class="relative ml-4 pl-4 border-l-2 border-gray-200/80 my-1 space-y-1"
                  >
                    <div
                      v-for="leaf in subItem.children"
                      :key="leaf.path"
                      class="group/leaf relative"
                    >
                      <span
                        class="absolute -left-[17px] -top-1 -bottom-1 w-[2.5px] bg-[#2671D9] z-10 transition-opacity duration-150"
                        :class="
                          isChildActive(leaf.path)
                            ? 'opacity-100'
                            : 'opacity-0 group-hover/leaf:opacity-100'
                        "
                      />
                      <NuxtLink
                        :to="leaf.path"
                        prefetch
                        class="relative flex items-center px-3.5 py-2.5 rounded-lg text-[13px] transition-all duration-150 whitespace-nowrap overflow-hidden"
                        :class="
                          isChildActive(leaf.path)
                            ? 'bg-[#E9F1FB] text-[#2671D9] font-semibold'
                            : 'text-[#5A6E85] hover:text-[#2671D9] hover:bg-[#E9F1FB] font-normal'
                        "
                      >
                        <span class="truncate whitespace-nowrap">{{
                          leaf.label
                        }}</span>
                      </NuxtLink>
                    </div>
                  </div>
                </Transition>
              </template>

              <!-- Level 2 Direct Link -->
              <template v-else>
                <NuxtLink
                  :to="subItem.path || '/home'"
                  prefetch
                  class="relative flex items-center px-4 py-2.5 rounded-lg text-[12px] font-lato transition-all duration-150 whitespace-nowrap overflow-hidden"
                  :class="
                    isChildActive(subItem.path || '')
                      ? 'bg-[#E9F1FB] text-[#2671D9] font-semibold'
                      : 'text-[#5A6E85] hover:text-[#2671D9] hover:bg-[#E9F1FB] font-normal'
                  "
                >
                  <span class="truncate whitespace-nowrap">{{
                    subItem.label
                  }}</span>
                </NuxtLink>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
/* Submenu Accordion Animation */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 500px;
  overflow: hidden;
}
.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}

/* Stagger cascade entrance for submenu items */
.submenu-enter-active .group {
  animation: submenuItemFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.submenu-enter-active .group:nth-child(1) {
  animation-delay: 0.02s;
}
.submenu-enter-active .group:nth-child(2) {
  animation-delay: 0.04s;
}
.submenu-enter-active .group:nth-child(3) {
  animation-delay: 0.06s;
}
.submenu-enter-active .group:nth-child(4) {
  animation-delay: 0.08s;
}
.submenu-enter-active .group:nth-child(5) {
  animation-delay: 0.1s;
}
.submenu-enter-active .group:nth-child(6) {
  animation-delay: 0.12s;
}
.submenu-enter-active .group:nth-child(7) {
  animation-delay: 0.14s;
}
.submenu-enter-active .group:nth-child(8) {
  animation-delay: 0.16s;
}
.submenu-enter-active .group:nth-child(9) {
  animation-delay: 0.18s;
}

@keyframes submenuItemFadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade Logo */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Scrollbar for Sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}
</style>
