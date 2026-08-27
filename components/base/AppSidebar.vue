<script setup lang="ts">
import { ref, watch } from "vue";

// Logo Assets
import LogoFullPLN from "@/assets/logo/LogoFullPLN.svg";
import LogoTamboraSidebar from "@/assets/logo/LogoTamboraSidebar.svg";

// Menu Item Model
interface SubMenuItem {
  key: string;
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
}

interface MenuItem {
  key: string;
  label: string;
  path?: string;
  children?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    children: [
      {
        key: "operasi-pembangkit",
        label: "Operasi Pembangkit Sistem Tambora",
        path: "/home/dashboard/operasiPembangkit",
      },
    ],
  },
  {
    key: "master",
    label: "Master",
    children: [
      {
        key: "pengguna",
        label: "Pengguna",
        path: "/home/master/user",
      },
      {
        key: "role",
        label: "Role",
        path: "/home/master/role",
      },
      {
        key: "permission",
        label: "Permission",
        path: "/home/master/permission",
      },
      {
        key: "scope",
        label: "Scope",
        path: "/home/master/scope",
      },
      {
        key: "pengemudi",
        label: "Pengemudi",
        path: "/home/master/driver",
      },
      {
        key: "organization",
        label: "Organisasi",
        path: "/home/master/organization",
      },
      {
        key: "system",
        label: "Sistem",
        path: "/home/master/system",
      },
      {
        key: "asset",
        label: "Aset Mesin",
        path: "/home/master/asset",
      },
      {
        key: "machine-condition",
        label: "Kondisi Mesin",
        path: "/home/master/machine-condition",
      },
    ],
  },
];

// State & Router
const route = useRoute();
const isExpanded = ref(false);
const openKeys = ref<string[]>([]);
const openSubKeys = ref<string[]>([]);

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
};

// Initial sync
syncOpenKeysWithRoute();

// Sync on route navigation
watch(
  () => route.path,
  () => {
    syncOpenKeysWithRoute();
  },
);

// Helpers
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
      class="flex-1 py-4 px-3.5 overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar"
    >
      <div v-for="item in menuItems" :key="item.key" class="relative">
        <!-- Level 1 Parent Button -->
        <div class="relative">
          <!-- Active Left Accent Indicator -->
          <div
            class="absolute -left-3.5 top-1/2 -translate-y-1/2 w-[3.5px] h-6 bg-[#2563EB] rounded-r-full transition-all duration-200"
            :class="
              isGroupActive(item)
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-75'
            "
          />

          <button
            class="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
            :class="[
              isGroupActive(item)
                ? 'bg-[#EBF3FF] text-[#2563EB] font-semibold shadow-xs'
                : 'text-[#5A6E85] hover:bg-gray-100/70 hover:text-gray-900',
            ]"
            @click="toggleItem(item)"
          >
            <!-- Icon -->
            <span
              class="shrink-0 w-6 h-6 flex items-center justify-center transition-colors"
              :class="isGroupActive(item) ? 'text-[#2563EB]' : 'text-[#5A6E85]'"
            >
              <svg
                v-if="item.key === 'dashboard'"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
                <path d="M7 13v-3" />
                <path d="M12 13v-5" />
                <path d="M17 13v-7" />
              </svg>

              <svg
                v-else-if="item.key === 'master'"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
                <path d="M6 8h4l1.5 2H18v5H6z" />
              </svg>

              <svg
                v-else-if="item.key === 'transaksi'"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3"
                />
                <path d="M17 9H7l3-3" />
                <path d="M7 15h10l-3 3" />
              </svg>
            </span>

            <!-- Label (Expanded only) -->
            <span
              v-if="isExpanded"
              class="flex-1 text-left truncate whitespace-nowrap text-[12px] tracking-tight font-medium"
            >
              {{ item.label }}
            </span>

            <!-- Chevron Icon -->
            <svg
              v-if="isExpanded && item.children"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200"
              :class="
                openKeys.includes(item.key) ? 'rotate-180 text-[#2563EB]' : ''
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
              class="relative"
            >
              <!-- Solid Blue line spanning full height of active sub-group (Pegawai + open children) -->
              <span
                v-if="isSubGroupActive(subItem)"
                class="absolute -left-[17px] top-0 bottom-0 w-[2px] bg-[#2563EB] z-10"
              />

              <!-- If Level 2 has children (Nested group like 'Pegawai') -->
              <template v-if="subItem.children">
                <button
                  class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-150 whitespace-nowrap"
                  :class="
                    isSubGroupActive(subItem)
                      ? 'bg-[#EBF3FF] text-[#2563EB] font-semibold'
                      : 'text-[#5A6E85] hover:text-gray-900 hover:bg-gray-50'
                  "
                  @click="toggleSubItem(subItem.key)"
                >
                  <span class="truncate whitespace-nowrap">{{
                    subItem.label
                  }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform duration-200"
                    :class="
                      openSubKeys.includes(subItem.key)
                        ? 'rotate-180 text-[#2563EB]'
                        : ''
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

                <!-- Level 3 Children (User, Level Role, Role) -->
                <Transition name="submenu">
                  <div
                    v-if="openSubKeys.includes(subItem.key)"
                    class="relative ml-4 pl-4 border-l-2 border-gray-200/80 my-1 space-y-1"
                  >
                    <NuxtLink
                      v-for="leaf in subItem.children"
                      :key="leaf.path"
                      :to="leaf.path"
                      prefetch
                      class="relative flex items-center px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-150 whitespace-nowrap overflow-hidden"
                      :class="
                        isChildActive(leaf.path)
                          ? 'bg-[#EBF3FF] text-[#2563EB] font-semibold'
                          : 'text-[#5A6E85] hover:text-gray-900 hover:bg-gray-50 font-normal'
                      "
                    >
                      <!-- Inner active blue line segment overlaying the inner guide line next to User -->
                      <span
                        v-if="isChildActive(leaf.path)"
                        class="absolute -left-[17px] -top-1 -bottom-1 w-[2px] bg-[#2563EB] z-10"
                      />
                      <span class="truncate whitespace-nowrap">{{
                        leaf.label
                      }}</span>
                    </NuxtLink>
                  </div>
                </Transition>
              </template>

              <!-- Level 2 Direct Link (No nested children) -->
              <template v-else>
                <NuxtLink
                  :to="subItem.path || '/home'"
                  prefetch
                  class="relative flex items-center px-4 py-2.5 rounded-xl text-[12px] transition-all duration-150 whitespace-nowrap overflow-hidden"
                  :class="
                    isChildActive(subItem.path || '')
                      ? 'bg-[#EBF3FF] text-[#2563EB] font-semibold'
                      : 'text-[#5A6E85] hover:text-gray-900 hover:bg-gray-50 font-normal'
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
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 400px;
  overflow: hidden;
}
.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
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
