import { createRouter, createWebHistory } from 'vue-router'

// =====================================
// IMPORT VIEWS
// =====================================

import OperasiPembangkit from '../views/OperasiPembangkit.vue'
import TrackingBahanBakar from '../views/TrackingBahanBakar.vue'

import OperasiHarian from '../views/OperasiHarian.vue'
import TambahOperasiHarian from '../views/TambahOperasiHarian.vue'

import Pagu from '../views/Pagu.vue'



// =====================================
// ROUTES
// =====================================

const routes = [

  // =====================================
  // ROOT
  // =====================================

  {
    path: '/',
    redirect: '/operasi-pembangkit'
  },


  // =====================================
  // DASHBOARD
  // =====================================

  {
    path: '/operasi-pembangkit',
    name: 'OperasiPembangkit',
    component: OperasiPembangkit
  },


  // =====================================
  // ENERGI PRIMER
  // =====================================

  {
    path: '/tracking-bahan-bakar',
    name: 'TrackingBahanBakar',
    component: TrackingBahanBakar
  },


  // =====================================
  // TRANSAKSI - OPERASI HARIAN
  // =====================================

  {
    path: '/operasi-harian',
    name: 'OperasiHarian',
    component: OperasiHarian
  },


  // =====================================
  // TAMBAH OPERASI HARIAN
  // =====================================

  {
    path: '/tambah-operasi-harian',
    name: 'TambahOperasiHarian',
    component: TambahOperasiHarian
  },


  // =====================================
  // PAGU
  // =====================================

  {
    path: '/pagu',
    name: 'Pagu',
    component: Pagu
  }

]


// =====================================
// CREATE ROUTER
// =====================================

const router = createRouter({

  history: createWebHistory(),

  routes,

  scrollBehavior() {
    return {
      top: 0
    }
  }

})


export default router