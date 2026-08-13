<template>
  <section class="pagu-page">

    <!-- =========================
         TOP HEADER
    ========================== -->
    <header class="pagu-top-header">

      <!-- BREADCRUMB -->
      <div class="pagu-breadcrumb">
        <span class="breadcrumb-link">
          Transaksi
        </span>

        <span class="breadcrumb-arrow">
          >
        </span>

        <span class="breadcrumb-current">
          Pagu
        </span>
      </div>

      <!-- HEADER RIGHT -->
      <div class="pagu-header-right">

        <!-- NOTIFICATION -->
        <button class="pagu-header-icon notification-button">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
            />
            <path d="M10 21h4" />
          </svg>

          <span class="notification-dot"></span>
        </button>

        <!-- APPS -->
        <button class="pagu-apps-button">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- USER -->
        <div class="pagu-user-avatar">
          Y
        </div>

        <span class="pagu-user-name">
          User ENG
        </span>

        <button class="pagu-user-arrow">
          ˅
        </button>

      </div>
    </header>


    <!-- =========================
         PAGE TITLE
    ========================== -->
    <section class="pagu-page-header">

      <h1>
        Pagu
      </h1>

    </section>


    <!-- =========================
         PAGE CONTENT
    ========================== -->
    <main class="pagu-content">

      <div class="pagu-card">

        <!-- =========================
             TOOLBAR
        ========================== -->
        <div class="pagu-toolbar">

          <!-- SEARCH -->
          <div class="pagu-search">

            <input
              type="text"
              placeholder="Cari Data"
              v-model="searchQuery"
            />

            <svg
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


          <!-- DATE -->
          <div class="pagu-date">

            <input
              v-model="selectedDate"
              type="date"
            />

            <svg
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


          <!-- EXPORT -->
          <button
            type="button"
            class="pagu-export-button"
            @click="exportData"
          >

            <span class="excel-box">
              <span>X</span>
            </span>

            <span class="export-label">
              <span>Export to</span>
              <strong>.xls</strong>
            </span>

          </button>


          <!-- RIGHT TOOLBAR -->
          <div class="pagu-toolbar-right">

            <!-- UNIT / BIDANG -->
            <div class="pagu-filter">

              <button
                class="filter-option active"
                type="button"
              >
                Unit
              </button>

              <button
                class="filter-option"
                type="button"
              >
                Bidang
              </button>

            </div>


            <!-- TAMBAH DATA -->
            <button
              type="button"
              class="pagu-add-button"
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

        </div>


        <!-- =========================
             TABLE
        ========================== -->
        <div class="pagu-table-wrapper">

          <table class="pagu-table">

            <thead>

              <tr>

                <th class="pagu-no">
                  No.
                </th>

                <th>
                  Jenis Pagu
                </th>

                <th>
                  Tanggal Input
                </th>

                <th>
                  Revisi
                </th>

                <th>
                  Aksi
                </th>

              </tr>

            </thead>

            <tbody>

              <!-- EMPTY -->
              <tr>

                <td
                  colspan="5"
                  class="pagu-empty-cell"
                >

                  <div class="pagu-empty">

                    <div class="pagu-empty-icon">

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
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

            </tbody>

          </table>

        </div>


        <!-- =========================
             FOOTER
        ========================== -->
        <div class="pagu-footer">

          <!-- INFORMATION -->
          <div class="pagu-information">

            <span>
              Menampilkan
            </span>

            <select v-model="itemsPerPage">

              <option :value="5">
                5
              </option>

              <option :value="10">
                10
              </option>

              <option :value="20">
                20
              </option>

              <option :value="50">
                50
              </option>

            </select>

            <span>
              dari
            </span>

            <strong>
              0
            </strong>

            <span>
              Data
            </span>

          </div>


          <!-- PAGINATION -->
          <div class="pagu-pagination">

            <button
              class="pagination-arrow"
              disabled
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>


            <button
              class="pagination-number active"
            >
              1
            </button>

            <button class="pagination-number">
              2
            </button>

            <button class="pagination-number">
              3
            </button>

            <button class="pagination-number">
              4
            </button>

            <button class="pagination-number">
              5
            </button>

            <span class="pagination-ellipsis">
              ...
            </span>

            <button class="pagination-number">
              10
            </button>


            <button class="pagination-arrow">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>

            </button>

          </div>

        </div>

      </div>

    </main>

  </section>
</template>


<script setup>
import { ref } from 'vue'

const searchQuery = ref('')

const selectedDate = ref(
  new Date().toISOString().slice(0, 10)
)

const itemsPerPage = ref(5)


function handleAddData() {
  console.log('Buka form tambah data Pagu')
}


function exportData() {
  console.log('Export data Pagu')
}
</script>


<style src="../css/Pagu.css"></style>