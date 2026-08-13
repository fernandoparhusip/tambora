<template>
  <aside
    class="sidebar"
    :class="{ expanded: isExpanded }"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- =====================================================
         LOGO
    ====================================================== -->
    <div class="logo-container">
      <img
        src="/assets/pln-emblem.png"
        alt="PLN"
        class="logo emblem-logo"
      />

      <img
        src="/assets/pln-logo.png"
        alt="PLN"
        class="logo full-logo"
      />
    </div>

    <!-- =====================================================
         NAVIGATION
    ====================================================== -->
    <nav class="navigation">

      <!-- =================================================
           DASHBOARD
      ================================================== -->
      <div
        class="navigation-group"
        :class="{ active: isDashboardActive }"
      >
        <button
          type="button"
          class="menu-item"
          :class="{ active: isDashboardActive }"
          :aria-expanded="openMenu === 'dashboard'"
          @click="toggleMenu('dashboard')"
        >
          <span
            class="menu-icon"
            v-html="dashboardIcon"
          ></span>

          <span class="menu-label">
            Dashboard
          </span>

          <svg
            class="arrow-icon"
            :class="{ rotated: openMenu === 'dashboard' }"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <!-- DASHBOARD SUBMENU -->
        <div
          v-if="openMenu === 'dashboard'"
          class="submenu"
        >
          <RouterLink
            to="/operasi-pembangkit"
            class="submenu-item"
            active-class="active-submenu"
          >
            Operasi Pembangkit Sistem Tambora
          </RouterLink>

          <RouterLink
            to="/tracking-bahan-bakar"
            class="submenu-item"
            active-class="active-submenu"
          >
            Energi Primer
          </RouterLink>

          <div class="submenu-item disabled">
            Kinerja KPI & Operasional
          </div>

          <div class="submenu-item disabled">
            Scada Online Monitoring (Schematic)
          </div>

          <div class="submenu-item disabled">
            Anggaran
          </div>
        </div>
      </div>


      <!-- =================================================
           MASTER
      ================================================== -->
      <div class="navigation-group">
        <button
          type="button"
          class="menu-item"
        >
          <span
            class="menu-icon"
            v-html="masterIcon"
          ></span>

          <span class="menu-label">
            Master
          </span>

          <svg
            class="arrow-icon"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>


      <!-- =================================================
           KONTRAK
      ================================================== -->
      <div class="navigation-group">
        <button
          type="button"
          class="menu-item"
        >
          <span
            class="menu-icon"
            v-html="kontrakIcon"
          ></span>

          <span class="menu-label">
            Kontrak
          </span>

          <svg
            class="arrow-icon"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>


      <!-- =================================================
           TRANSAKSI
      ================================================== -->
      <div
        class="navigation-group"
        :class="{ active: isTransactionActive }"
      >
        <button
          type="button"
          class="menu-item"
          :class="{ active: isTransactionActive }"
          :aria-expanded="openMenu === 'transaksi'"
          @click="toggleMenu('transaksi')"
        >
          <span
            class="menu-icon"
            v-html="transaksiIcon"
          ></span>

          <span class="menu-label">
            Transaksi
          </span>

          <svg
            class="arrow-icon"
            :class="{ rotated: openMenu === 'transaksi' }"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>


        <!-- =============================================
             TRANSAKSI SUBMENU
        ============================================== -->
        <div
          v-if="openMenu === 'transaksi'"
          class="submenu transaksi-submenu"
        >

          <!-- ===========================================
               OPERASI
          ============================================ -->
          <div class="nested-menu">

            <button
              type="button"
              class="submenu-parent"
              :class="{
                active: openSubmenu === 'operasi'
              }"
              @click="toggleSubmenu('operasi')"
            >
              <span>
                Operasi
              </span>

              <svg
                class="nested-arrow"
                :class="{
                  rotated: openSubmenu === 'operasi'
                }"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>


            <!-- =========================================
                 OPERASI CHILDREN
            ========================================== -->
            <div
              v-if="openSubmenu === 'operasi'"
              class="nested-submenu"
            >

              <RouterLink
                to="/operasi-harian"
                class="nested-submenu-item"
                active-class="active-nested-item"
              >
                Operasi Harian
              </RouterLink>


              <div
                class="nested-submenu-item disabled"
              >
                Data Pembebanan
              </div>


              <div
                class="nested-submenu-item disabled"
              >
                Data Status Mesin
              </div>


              <div
                class="nested-submenu-item disabled"
              >
                Pemakaian Bahan Bakar
              </div>

            </div>
          </div>


          <!-- ===========================================
               PAGU
          ========================================== -->
          <RouterLink
            to="/pagu"
            class="submenu-item"
            active-class="active-submenu"
          >
            Pagu
          </RouterLink>

        </div>
      </div>


      <!-- =================================================
           KEUANGAN
      ================================================== -->
      <div class="navigation-group">
        <button
          type="button"
          class="menu-item"
        >
          <span
            class="menu-icon"
            v-html="keuanganIcon"
          ></span>

          <span class="menu-label">
            Keuangan
          </span>

          <svg
            class="arrow-icon"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

    </nav>
  </aside>
</template>


<script setup>
import {
  computed,
  ref
} from 'vue'

import {
  RouterLink,
  useRoute
} from 'vue-router'


const route = useRoute()


/* ==========================================================
   SIDEBAR STATE
========================================================== */

const isExpanded = ref(false)

const openMenu = ref(null)

const openSubmenu = ref(null)


/* ==========================================================
   MENU TOGGLE
========================================================== */

function toggleMenu(id) {
  openMenu.value =
    openMenu.value === id
      ? null
      : id

  /*
   * Kalau membuka menu lain,
   * submenu Operasi ditutup.
   */
  if (id !== 'transaksi') {
    openSubmenu.value = null
  }
}


function toggleSubmenu(id) {
  openSubmenu.value =
    openSubmenu.value === id
      ? null
      : id
}


/* ==========================================================
   ACTIVE MENU
========================================================== */

const isDashboardActive = computed(() => {
  return [
    '/operasi-pembangkit',
    '/tracking-bahan-bakar'
  ].includes(route.path)
})


const isTransactionActive = computed(() => {
  return [
    '/operasi-harian',
    '/pagu'
  ].includes(route.path)
})


/* ==========================================================
   ICONS
========================================================== */

const dashboardIcon = `
<svg viewBox="0 0 24 24">
  <rect
    x="3"
    y="3"
    width="18"
    height="14"
    rx="1.5"
  />

  <path d="M8 21h8" />

  <path d="M12 17v4" />

  <path d="M7 13v-3" />

  <path d="M10 13V8" />

  <path d="M13 13v-6" />

  <path d="M16 13V5" />
</svg>
`


const masterIcon = `
<svg viewBox="0 0 24 24">
  <rect
    x="4"
    y="4"
    width="16"
    height="13"
    rx="1.5"
  />

  <path d="M8 20h8" />

  <path d="M12 17v3" />

  <path d="M7 8h10" />
</svg>
`


const kontrakIcon = `
<svg viewBox="0 0 24 24">
  <rect
    x="5"
    y="3"
    width="14"
    height="18"
    rx="1.5"
  />

  <path d="M8 7h5" />

  <path d="M8 10h6" />

  <circle
    cx="16"
    cy="16"
    r="3"
  />

  <path d="M16 14.5v1.7l1 0.6" />
</svg>
`


const transaksiIcon = `
<svg viewBox="0 0 24 24">
  <rect
    x="4"
    y="4"
    width="16"
    height="16"
    rx="1.5"
  />

  <path d="M8 9h8" />

  <path d="M8 13h5" />

  <path d="M14 16l3-3-3-3" />
</svg>
`


const keuanganIcon = `
<svg viewBox="0 0 24 24">
  <rect
    x="3"
    y="7"
    width="18"
    height="11"
    rx="2"
  />

  <circle
    cx="12"
    cy="12.5"
    r="2.5"
  />

  <path d="M6 10h1" />

  <path d="M17 15h1" />
</svg>
`
</script>


<style src="../css/Navigation.css"></style>