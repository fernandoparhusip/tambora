<template>
  <main class="login-page">

    <!-- ================= LEFT ================= -->
    <section class="left-side">

      <!-- Login Card -->
      <div class="login-card">

        <!-- Logo -->
        <img
          src="/assets/pln-logo.png"
          alt="PLN"
          class="pln-logo"
        />

        <!-- Welcome -->
        <div class="welcome">
          <h1>
            Welcome to<br>
            MAPP Tambora
          </h1>

          <p>
            Mendukung proses bisnis pembangkitan di Indonesia,
            mencakup pencatatan operasi harian, indikator kinerja,
            serta monitoring aset dan kondisi pembangkit secara
            real-time di seluruh Indonesia.
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin">

          <!-- Email -->
          <div class="input-box">
            <span class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 6.5C3.5 5.67 4.17 5 5 5H19C19.83 5 20.5 5.67 20.5 6.5V17.5C20.5 18.33 19.83 19 19 19H5C4.17 19 3.5 18.33 3.5 17.5V6.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                <path d="M4 6.5L12 13L20 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>

            <input
              v-model="email"
              type="email"
              placeholder="Masukkan Email"
              autocomplete="email"
            />
          </div>

          <!-- Password -->
          <div class="input-box">
            <span class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" stroke-width="1.6"/>
                <path d="M8 10.5V7.5C8 5.29 9.79 3.5 12 3.5C14.21 3.5 16 5.29 16 7.5V10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <circle cx="12" cy="14.75" r="1.35" fill="currentColor"/>
              </svg>
            </span>

            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan Password"
              autocomplete="current-password"
            />

            <button
              type="button"
              class="password-button"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 12C2.5 12 5.75 5.5 12 5.5C18.25 5.5 21.5 12 21.5 12C21.5 12 18.25 18.5 12 18.5C5.75 18.5 2.5 12 2.5 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="2.75" stroke="currentColor" stroke-width="1.6"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 3.5L20.5 20.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <path d="M9.9 5.6C10.57 5.42 11.27 5.32 12 5.32C18.25 5.32 21.5 11.82 21.5 11.82C20.97 12.87 20.15 14.06 19.05 15.14M6.8 7.02C4.42 8.55 2.5 11.82 2.5 11.82C2.5 11.82 5.75 18.32 12 18.32C13.6 18.32 15 17.93 16.18 17.34" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.9 12C9.9 13.16 10.84 14.1 12 14.1C12.6 14.1 13.14 13.85 13.52 13.44M14.02 10.36C13.63 9.87 13.02 9.55 12.35 9.52" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Forgot Password -->
          <button
            type="button"
            class="forgot-password"
            @click="handleForgotPassword"
          >
            Lupa Password?
          </button>

          <!-- Login -->
          <button
            type="submit"
            class="login-button"
          >
            Masuk ke Aplikasi
          </button>

        </form>

        <!-- Divider -->
        <div class="divider">
          <span></span>
          <p>atau login dengan</p>
          <span></span>
        </div>

        <!-- SSO -->
        <button
          type="button"
          class="sso-button"
          @click="handleSSO"
        >
          <img
            src="/assets/pln-logo.png"
            alt=""
          >

          <span>
            Masuk ke SSO ( IAM PLN )
          </span>
        </button>

      </div>


      <!-- ================= FOOTER ================= -->

      <footer class="footer-card">

        <div class="footer-icons">

          <div class="footer-icon icon-red" aria-label="Telepon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.6 10.8C7.9 13.35 10.05 15.5 12.6 16.8L14.6 14.8C14.85 14.55 15.22 14.47 15.54 14.59C16.57 14.93 17.68 15.11 18.8 15.11C19.3 15.11 19.7 15.51 19.7 16.01V19.2C19.7 19.7 19.3 20.1 18.8 20.1C10.1 20.1 3 13 3 4.3C3 3.8 3.4 3.4 3.9 3.4H7.1C7.6 3.4 8 3.8 8 4.3C8 5.42 8.18 6.53 8.52 7.56C8.63 7.88 8.56 8.24 8.3 8.5L6.6 10.8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="footer-icon icon-green" aria-label="Terverifikasi">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12.5L9.5 17L19 7" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="footer-icon icon-blue" aria-label="Email">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 6.5C3.5 5.67 4.17 5 5 5H19C19.83 5 20.5 5.67 20.5 6.5V17.5C20.5 18.33 19.83 19 19 19H5C4.17 19 3.5 18.33 3.5 17.5V6.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              <path d="M4 6.5L12 13L20 6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

        </div>

        <div class="footer-text">

          <div>
            <strong>Aplikasi PLNICONPLUS</strong>
            V1.0.0.1
            Powered by
            <strong>PLN ICONPLUS</strong>
          </div>

          <div class="footer-contact">
            helpdesk.ic@iconpln.co.id
            <span>|</span>
            0813 8287 7162
            <span>|</span>
            Security Issue :
            soc@pln.co.id
          </div>

        </div>

      </footer>

    </section>


    <!-- ================= RIGHT ================= -->

    <section class="image-side">

      <transition name="fade" mode="out-in">
        <img
          :key="currentImage"
          :src="images[currentImage]"
          alt="Pembangkit Tambora"
          class="hero-image"
        >
      </transition>

      <!-- Previous -->
      <button
        class="carousel-button previous"
        aria-label="Gambar sebelumnya"
        @click="previousImage"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 5L8 12L15 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Next -->
      <button
        class="carousel-button next"
        aria-label="Gambar berikutnya"
        @click="nextImage"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5L16 12L9 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Indicator -->
      <div class="indicators">

        <button
          v-for="(_, index) in images"
          :key="index"
          type="button"
          class="indicator"
          :class="{ active: currentImage === index }"
          :aria-label="`Tampilkan gambar ${index + 1}`"
          @click="currentImage = index"
        ></button>

      </div>

    </section>

  </main>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'


// ================= FORM =================

const email = ref('')
const password = ref('')
const showPassword = ref(false)


// ================= CAROUSEL =================

const images = [
  '/assets/tambora.jpeg',
  '/assets/tambora-2.jpeg',
  '/assets/tambora-3.jpeg',
  '/assets/tambora-4.jpeg',
  '/assets/tambora-5.jpeg'
]

const currentImage = ref(0)

let autoplayTimer = null

function startAutoplay() {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    nextImage()
  }, 6000)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

onMounted(startAutoplay)
onBeforeUnmount(stopAutoplay)


// ================= LOGIN =================

function handleLogin() {
  console.log('Email:', email.value)
  console.log('Password:', password.value)
}


// ================= SSO =================

function handleSSO() {
  console.log('Login menggunakan SSO')
}


// ================= FORGOT PASSWORD =================

function handleForgotPassword() {
  console.log('Forgot password')
}


// ================= CAROUSEL =================

function previousImage() {
  currentImage.value =
    currentImage.value === 0
      ? images.length - 1
      : currentImage.value - 1
  startAutoplay()
}


function nextImage() {
  currentImage.value =
    currentImage.value === images.length - 1
      ? 0
      : currentImage.value + 1
  startAutoplay()
}
</script>