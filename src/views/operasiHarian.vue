<template>

  <section class="operasi-page">

    <!-- =========================
         PAGE HEADER
    ========================== -->

    <div class="operasi-header">

      <div class="operasi-title">

        <h1>
          Data Operasi Harian
        </h1>

      </div>


      <div class="date-picker">

        <input
          v-model="selectedDate"
          type="date"
          aria-label="Tanggal operasi"
        />

        <svg
          class="date-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >

          <rect
            x="3"
            y="4"
            width="18"
            height="17"
            rx="2"
          />

          <path d="M16 2v4" />

          <path d="M8 2v4" />

          <path d="M3 10h18" />

        </svg>

      </div>

    </div>


    <!-- =========================
         PAGE BODY
    ========================== -->

    <div class="operasi-body">

      <div class="operasi-card">


        <!-- =========================
             TOOLBAR
        ========================== -->

        <div class="operasi-toolbar">


          <!-- SEARCH -->

          <div class="search-box">

            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari Data"
              @input="handleSearch"
            />

            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >

              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m20 20-4-4" />

            </svg>

          </div>

          <!-- EXPORT -->

          <button
            type="button"
            class="toolbar-button export-button"
            @click="exportData"
          >

            <span class="excel-icon">

              <span class="excel-x">
                X
              </span>

            </span>

            <span class="export-text">

              <span>
                Export to
              </span>

              <strong>
                .xls
              </strong>

            </span>

          </button>


          <!-- REFRESH -->

          <button
            type="button"
            class="toolbar-button refresh-button"
            :class="{
              loading: loading
            }"
            aria-label="Refresh data"
            @click="fetchOperasiHarian"
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >

              <path
                d="M20 11a8.1 8.1 0 0 0-14.7-4.7L3 8"
              />

              <path
                d="M3 3v5h5"
              />

              <path
                d="M4 13a8.1 8.1 0 0 0 14.7 4.7L21 16"
              />

              <path
                d="M21 21v-5h-5"
              />

            </svg>

          </button>


          <!-- TAMBAH DATA -->

          <button
            type="button"
            class="add-data-button"
            @click="handleAddData"
          >

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >

              <path d="M12 5v14" />

              <path d="M5 12h14" />

            </svg>

            <span>
              TAMBAH DATA
            </span>

          </button>

        </div>


        <!-- =========================
             TABLE
        ========================== -->

        <div class="table-wrapper">

          <table class="operasi-table">

            <thead>

              <tr>

                <th>
                  No
                </th>

                <th>
                  Tanggal Transaksi
                </th>

                <th>
                  Nama Mesin
                </th>

                <th>
                  Jenis Bahan Bakar
                </th>

                <th>
                  Produksi (kWh)
                </th>

                <th>
                  DMP (kW)
                </th>

                <th>
                  DMN (kW)
                </th>

              </tr>

            </thead>


            <tbody>

              <!-- DATA -->

              <tr
                v-for="(item, index) in paginatedData"
                :key="item.id || index"
                class="data-row"
              >

                <td>
                  {{ getRowNumber(index) }}
                </td>

                <td>
                  {{
                    formatDate(
                      item.tanggal_transaksi ||
                      item.tanggal
                    )
                  }}
                </td>

                <td>
                  {{
                    item.nama_mesin ||
                    item.namaMesin ||
                    '-'
                  }}
                </td>

                <td>
                  {{
                    item.jenis_bahan_bakar ||
                    item.jenisBahanBakar ||
                    '-'
                  }}
                </td>

                <td>
                  {{ formatNumber(item.produksi) }}
                </td>

                <td>
                  {{ formatNumber(item.dmp) }}
                </td>

                <td>
                  {{ formatNumber(item.dmn) }}
                </td>

              </tr>


              <!-- EMPTY -->

              <tr
                v-if="
                  !loading &&
                  filteredData.length === 0
                "
              >

                <td
                  colspan="7"
                  class="empty-cell"
                >

                  <div class="empty-state">

                    <div class="empty-icon">

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                      >

                        <ellipse
                          cx="12"
                          cy="5"
                          rx="8"
                          ry="3"
                        />

                        <path
                          d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"
                        />

                        <path
                          d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"
                        />

                      </svg>

                    </div>

                    <h3>
                      Tidak ada data
                    </h3>

                    <p>
                      Maaf, Data Anda belum tersedia
                    </p>

                  </div>

                </td>

              </tr>


              <!-- LOADING -->

              <tr v-if="loading">

                <td
                  colspan="7"
                  class="loading-cell"
                >

                  <div class="loading-state">

                    <div class="spinner"></div>

                    <span>
                      Memuat data...
                    </span>

                  </div>

                </td>

              </tr>

            </tbody>

          </table>

        </div>


        <!-- =========================
             FOOTER
        ========================== -->

        <div class="table-footer">

          <div class="data-information">

            <span>
              Menampilkan
            </span>

            <select
              v-model.number="itemsPerPage"
            >

              <option :value="10">
                10
              </option>

              <option :value="20">
                20
              </option>

              <option :value="50">
                50
              </option>

              <option :value="100">
                100
              </option>

            </select>

            <span>
              dari
            </span>

            <strong>
              {{ filteredData.length }}
            </strong>

            <span>
              Data
            </span>

          </div>


          <!-- PAGINATION -->

          <div class="pagination">

            <button
              type="button"
              class="pagination-arrow"
              :disabled="currentPage === 1"
              @click="previousPage"
            >
              ‹
            </button>


            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              class="pagination-number"
              :class="{
                active:
                  page === currentPage
              }"
              @click="goToPage(page)"
            >

              {{ page }}

            </button>


            <span
              v-if="showEllipsis"
              class="pagination-ellipsis"
            >
              ...
            </span>


            <button
              v-if="totalPages > 5"
              type="button"
              class="pagination-number"
              :class="{
                active:
                  currentPage === totalPages
              }"
              @click="
                goToPage(totalPages)
              "
            >

              {{ totalPages }}

            </button>


            <button
              type="button"
              class="pagination-arrow"
              :disabled="
                currentPage === totalPages ||
                totalPages === 0
              "
              @click="nextPage"
            >
              ›
            </button>

          </div>

        </div>

      </div>

    </div>

  </section>

  <TambahOperasiHarian v-if="drawerVisible" @close="drawerVisible = false" />

</template>


<script setup>

import {
  computed,
  onMounted,
  ref,
  watch
} from 'vue'

import {
  useRouter
} from 'vue-router'

import TambahOperasiHarian from './TambahOperasiHarian.vue'


// =====================================
// ROUTER
// =====================================

const router = useRouter()


// =====================================
// API
// =====================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080'

const API_ENDPOINT =
  `${API_BASE_URL}/v1/operasi-harian`


// =====================================
// STATE
// =====================================

const operasiData = ref([])

const loading = ref(false)

const searchQuery = ref('')

const selectedDate = ref(
  new Date()
    .toISOString()
    .slice(0, 10)
)

const currentPage = ref(1)

const itemsPerPage = ref(10)

const drawerVisible = ref(false)


// =====================================
// FILTER
// =====================================

const filteredData = computed(() => {

  const keyword =
    searchQuery.value
      .trim()
      .toLowerCase()

  if (!keyword) {
    return operasiData.value
  }

  return operasiData.value.filter(
    item => {

      return Object
        .values(item)
        .some(value =>
          String(value ?? '')
            .toLowerCase()
            .includes(keyword)
        )

    }
  )

})


// =====================================
// PAGINATION
// =====================================

const totalPages = computed(() => {

  if (
    filteredData.value.length === 0
  ) {
    return 0
  }

  return Math.ceil(
    filteredData.value.length /
    itemsPerPage.value
  )

})


const paginatedData = computed(() => {

  const start =
    (currentPage.value - 1) *
    itemsPerPage.value

  const end =
    start +
    itemsPerPage.value

  return filteredData.value.slice(
    start,
    end
  )

})


const visiblePages = computed(() => {

  if (totalPages.value <= 5) {

    return Array.from(
      {
        length: totalPages.value
      },
      (_, index) =>
        index + 1
    )

  }

  return [
    1,
    2,
    3,
    4,
    5
  ]

})


const showEllipsis = computed(() => {

  return (
    totalPages.value > 5
  )

})


// =====================================
// FETCH
// =====================================

async function fetchOperasiHarian() {

  loading.value = true

  try {

    const response =
      await fetch(
        API_ENDPOINT,
        {
          method: 'GET',
          headers: {
            Accept:
              'application/json'
          }
        }
      )

    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      )

    }

    const result =
      await response.json()

    if (Array.isArray(result)) {

      operasiData.value =
        result

    } else if (
      Array.isArray(result?.data)
    ) {

      operasiData.value =
        result.data

    } else if (
      Array.isArray(
        result?.data?.data
      )
    ) {

      operasiData.value =
        result.data.data

    } else {

      operasiData.value = []

    }

  } catch (error) {

    console.error(
      'Gagal mengambil data operasi harian:',
      error
    )

    operasiData.value = []

  } finally {

    loading.value = false

  }

}


// =====================================
// TAMBAH DATA
// =====================================

function handleAddData() {

  drawerVisible.value = true

}


// =====================================
// SEARCH
// =====================================

function handleSearch() {

  currentPage.value = 1

}


// =====================================
// PAGINATION
// =====================================

function getRowNumber(index) {

  return (
    (currentPage.value - 1) *
    itemsPerPage.value +
    index +
    1
  )

}


function goToPage(page) {

  if (
    page < 1 ||
    page > totalPages.value
  ) {
    return
  }

  currentPage.value = page

}


function previousPage() {

  if (
    currentPage.value > 1
  ) {

    currentPage.value--

  }

}


function nextPage() {

  if (
    currentPage.value <
    totalPages.value
  ) {

    currentPage.value++

  }

}


// =====================================
// FORMAT
// =====================================

function formatNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {

    return '-'

  }

  const number =
    Number(value)

  if (
    Number.isNaN(number)
  ) {

    return value

  }

  return new Intl.NumberFormat(
    'id-ID',
    {
      maximumFractionDigits: 2
    }
  ).format(number)

}


function formatDate(value) {

  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value

  }

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  ).format(date)

}


// =====================================
// EXPORT
// =====================================

function exportData() {

  if (
    !filteredData.value.length
  ) {

    console.warn(
      'Tidak ada data untuk diekspor'
    )

    return

  }

  console.log(
    'Export data:',
    filteredData.value
  )

}


// =====================================
// WATCH
// =====================================

watch(
  itemsPerPage,
  () => {

    currentPage.value = 1

  }
)


watch(
  filteredData,
  () => {

    if (
      totalPages.value > 0 &&
      currentPage.value >
        totalPages.value
    ) {

      currentPage.value =
        totalPages.value

    }

  }
)


// =====================================
// INITIAL
// =====================================

onMounted(() => {

  fetchOperasiHarian()

})

</script>


<style src="../css/OperasiHarian.css"></style>