<template>

  <div class="drawer-overlay" @click.self="close">

    <aside class="drawer-panel" role="dialog" aria-modal="true">

      <div class="drawer-header">

        <div class="drawer-title">

          <h2>Tambah Data Operasi Harian</h2>

          <p class="subtitle">Form Tambah Data Operasi Harian</p>

        </div>

        <button class="drawer-close" @click="close">✕</button>

      </div>

      <div class="drawer-top">

        <div class="pembangkit-card">

          <div class="pembangkit-image">

            <img src="/assets/tambora.jpeg" alt="PLTU" />

          </div>

          <div class="pembangkit-info">

            <span class="pembangkit-label">PEMBANGKIT</span>

            <h3>Sistem Tambora</h3>

            <p>Labuan Kertasari, Kec. Taliwang</p>

          </div>

        </div>

      </div>

      <div class="drawer-body">

        <form class="operasi-form" @submit.prevent="submitForm">

          <div class="form-row">

            <div class="form-group">

              <label>Nama Mesin *</label>

              <select v-model="form.nama_mesin" required>
                <option value="" disabled>Pilih Mesin</option>
                <option value="Mesin 1">Mesin 1</option>
                <option value="Mesin 2">Mesin 2</option>
                <option value="Mesin 3">Mesin 3</option>
              </select>

            </div>

            <div class="form-group">

              <label>Status Mesin</label>

              <input type="text" disabled placeholder="Generate Dari Pilih Mesin" />

            </div>

          </div>

          <div class="form-row">

            <div class="form-group">

              <label>Tanggal</label>

              <input v-model="form.tanggal_transaksi" type="date" required />

            </div>

            <div class="form-group">

              <label>Jenis Bahan Bakar *</label>

              <select v-model="form.jenis_bahan_bakar" required>
                <option value="" disabled>Pilih Jenis Bahan Bakar</option>
                <option value="HSD">HSD</option>
                <option value="MFO">MFO</option>
                <option value="Batubara">Batubara</option>
                <option value="Gas">Gas</option>
              </select>

            </div>

          </div>

          <div class="form-row">

            <div class="form-group">

              <label>Daya Mampu Pasok (DMP) *</label>

              <input v-model.number="form.dmp" type="number" min="0" placeholder="Masukkan Nominal" required />

            </div>

            <div class="form-group">

              <label>Produksi Bruto *</label>

              <input v-model.number="form.produksi" type="number" min="0" placeholder="Masukkan Nominal" required />

            </div>

          </div>

          <div class="form-row">

            <div class="form-group fullwidth">

              <label>Keterangan</label>

              <textarea v-model="form.keterangan" placeholder="Masukkan Keterangan"></textarea>

            </div>

          </div>

          <div class="form-actions">

            <button type="button" class="cancel-button" @click="close">BATAL</button>

            <button type="submit" class="save-button" :disabled="saving">{{ saving ? 'MENYIMPAN...' : 'SIMPAN DATA' }}</button>

          </div>

        </form>

      </div>

    </aside>

  </div>

</template>


<script setup>
import { reactive, ref } from 'vue'

const emits = defineEmits(['close'])

const saving = ref(false)

const form = reactive({
  tanggal_transaksi: new Date().toISOString().slice(0, 10),
  nama_mesin: '',
  jenis_bahan_bakar: '',
  produksi: '',
  dmp: '',
  dmn: '',
  keterangan: ''
})

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_ENDPOINT = `${API_BASE_URL}/v1/operasi-harian`

function close() {
  emits('close')
}

async function submitForm() {
  saving.value = true

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        tanggal_transaksi: form.tanggal_transaksi,
        nama_mesin: form.nama_mesin,
        jenis_bahan_bakar: form.jenis_bahan_bakar,
        produksi: Number(form.produksi),
        dmp: Number(form.dmp),
        dmn: Number(form.dmn),
        keterangan: form.keterangan
      })
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    emits('close')

  } catch (error) {
    console.error('Gagal menyimpan data:', error)
    alert('Data gagal disimpan. Pastikan backend sudah berjalan.')
  } finally {
    saving.value = false
  }
}

</script>


<style src="../css/TambahOperasiHarian.css"></style>