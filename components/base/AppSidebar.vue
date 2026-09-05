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
const authStore = useAuthStore();
const isExpanded = ref(false);
const openKeys = ref<string[]>([]);
const openSubKeys = ref<string[]>([]);

// Filtered dynamic menu items based on user RBAC permissions & menus
const visibleMenuItems = computed<MenuItem[]>(() => {
  return menuItems
    .map((item) => {
      // If item has direct path and no children
      if (item.path && (!item.children || item.children.length === 0)) {
        if (authStore.hasMenuAccess(item.path, item.permission, item.menuCode)) {
          return item;
        }
        return null;
      }

      // If item has children (submenus)
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children
          .map((sub) => {
            // Submenu with leaf children
            if (sub.children && sub.children.length > 0) {
              const filteredLeaves = sub.children.filter((leaf) =>
                authStore.hasMenuAccess(leaf.path, leaf.permission, leaf.menuCode)
              );
              if (filteredLeaves.length > 0) {
                return { ...sub, children: filteredLeaves };
              }
              return null;
            }

            // Direct submenu item with path
            if (sub.path) {
              if (authStore.hasMenuAccess(sub.path, sub.permission, sub.menuCode)) {
                return sub;
              }
              return null;
            }

            return null;
          })
          .filter(Boolean) as SubMenuItem[];

        if (filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }
      }

      return null;
    })
    .filter(Boolean) as MenuItem[];
});

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

  visibleMenuItems.value.forEach((item) => {
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

// Precise runtime scrollHeight accordion animation (Emil Kowalski Model)
const onSubmenuEnter = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = "0";
  htmlEl.style.opacity = "0";
  htmlEl.style.transform = "translateY(-4px)";
  htmlEl.style.overflow = "hidden";
  // Force reflow
  void htmlEl.offsetHeight;
  htmlEl.style.transition =
    "height 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)";
  htmlEl.style.height = `${htmlEl.scrollHeight}px`;
  htmlEl.style.opacity = "1";
  htmlEl.style.transform = "translateY(0)";
};

const onSubmenuAfterEnter = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = "auto";
  htmlEl.style.overflow = "visible";
};

const onSubmenuLeave = (el: Element) => {
  const htmlEl = el as HTMLElement;
  htmlEl.style.height = `${htmlEl.scrollHeight}px`;
  htmlEl.style.overflow = "hidden";
  // Force reflow
  void htmlEl.offsetHeight;
  htmlEl.style.transition =
    "height 0.18s cubic-bezier(0.4, 0, 1, 1), opacity 0.15s ease, transform 0.18s cubic-bezier(0.4, 0, 1, 1)";
  htmlEl.style.height = "0";
  htmlEl.style.opacity = "0";
  htmlEl.style.transform = "translateY(-4px)";
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
      >
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
      >
    </div>

    <!-- ── Navigation Items ───────────────────────────────────── -->
    <nav
      class="flex-1 py-3 px-3.5 overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar"
    >
      <div v-for="item in visibleMenuItems" :key="item.key" class="relative">
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
              >
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
        <Transition
          :css="false"
          @enter="onSubmenuEnter"
          @after-enter="onSubmenuAfterEnter"
          @leave="onSubmenuLeave"
        >
          <div
            v-if="isExpanded && item.children && openKeys.includes(item.key)"
            class="relative ml-6 pl-4 border-l-2 border-gray-200/80 my-2 space-y-1.5 will-change-[height,opacity]"
          >
            <div
              v-for="subItem in item.children"
              :key="subItem.key"
              class="group relative"
            >
              <!-- Solid Blue line spanning height of active or hovered sub-group/item, across adjacent items -->
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
                  type="button"
                  class="w-full flex items-center justify-between px-4 py-2 rounded-lg text-[12px] font-lato transition-all duration-150 cursor-pointer overflow-hidden"
                  :class="
                    isSubGroupActive(subItem)
                      ? 'bg-[#E9F1FB] text-[#2671D9] font-semibold'
                      : 'text-[#5A6E85] hover:text-[#2671D9] hover:bg-[#E9F1FB] font-normal'
                  "
                  @click="toggleSubItem(subItem.key)"
                >
                  <span class="truncate whitespace-nowrap">{{
                    subItem.label
                  }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                    :class="[
                      openSubKeys.includes(subItem.key)
                        ? 'rotate-180 text-[#2671D9]'
                        : 'text-gray-400',
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

                <!-- Level 3 Nested Submenu Accordion -->
                <Transition
                  :css="false"
                  @enter="onSubmenuEnter"
                  @after-enter="onSubmenuAfterEnter"
                  @leave="onSubmenuLeave"
                >
                  <div
                    v-if="openSubKeys.includes(subItem.key)"
                    class="relative ml-3 pl-3 border-l border-gray-200 my-1 space-y-1 will-change-[height,opacity]"
                  >
                    <NuxtLink
                      v-for="child in subItem.children"
                      :key="child.path"
                      :to="child.path"
                      prefetch
                      class="relative flex items-center px-3 py-1.5 rounded-lg text-[11px] font-lato transition-all duration-150 whitespace-nowrap overflow-hidden"
                      :class="
                        isChildActive(child.path)
                          ? 'bg-[#E9F1FB] text-[#2671D9] font-semibold'
                          : 'text-[#5A6E85] hover:text-[#2671D9] hover:bg-[#E9F1FB] font-normal'
                      "
                    >
                      <span class="truncate whitespace-nowrap">{{
                        child.label
                      }}</span>
                    </NuxtLink>
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
