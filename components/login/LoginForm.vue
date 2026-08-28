<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { VueFinalModal } from "vue-final-modal";
import "vue-final-modal/style.css";
import { gsap } from "gsap";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { Lock } from "@lucide/vue";

// Assets
import LogoFullPLN from "@/assets/logo/LogoFullPLN.svg";
import LogoSmallPLN from "@/assets/logo/LogoSmallPLN.svg";
import IconEmail from "@/assets/icon/Email.svg";
import IconPassword from "@/assets/icon/Password.svg";
import IconHelpdesk from "@/assets/icon/Helpdesk.svg";
import IconLupaPassword from "@/assets/icon/LupaPassword.svg";
import IconKonfirmasiPassword from "@/assets/icon/KonfirmasiPassword.svg";

// Composables & Stores & Utils
import { useAuthStore } from "~/stores/auth";
import { useAuth } from "~/composables/useAuth";
import { getQueryValue } from "~/utils/authCrypto";

// Asset variable mappings for template bindings
const iconEmail = IconEmail;
const iconPassword = IconPassword;
const iconHelpdesk = IconHelpdesk;
const iconLupaPassword = IconLupaPassword;
const iconPasswordKonfirmasi = IconKonfirmasiPassword;
const iconPln = LogoSmallPLN;
const iconFullPln = LogoFullPLN;

const route = useRoute();
const authStore = useAuthStore();
const { login, forgotPassword, unlockUser, getSSOUrl, verifyRedirectToken, logout } =
  useAuth();
const toast = useToast();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const emailError = ref("");
const passwordError = ref("");

const showForgotModal = ref(false);
const forgotEmail = ref("");
const forgotEmailError = ref("");
const isResetLoading = ref(false);

const showUnlockModal = ref(false);
const unlockEmail = ref("");
const unlockEmailError = ref("");
const isUnlockLoading = ref(false);

const showCaptcha = ref(false);

const welcomeSection = ref<HTMLElement | null>(null);
const welcomeTitleTop = ref<HTMLElement | null>(null);
const welcomeTitleBottom = ref<HTMLElement | null>(null);
const welcomeDescription = ref<HTMLElement | null>(null);
const loginPanelRef = ref<HTMLElement | null>(null);
const loginFitContentRef = ref<HTMLElement | null>(null);
const loginFitScale = ref(1);

const welcomeDescriptionText =
  "Mendukung proses bisnis pembangkitan di Indonesia, mencakup pencatatan operasi harian, indikator kinerja, serta monitoring aset dan kondisi pembangkit secara real-time di seluruh Indonesia.";
const typedDescription = ref("");
const isDescriptionTyping = ref(false);
let descriptionTypeTimeout: any = null;
let welcomeAnimationContext: gsap.Context | null = null;
let loginPanelResizeObserver: ResizeObserver | null = null;

function startDescriptionTypewriter() {
  const target = welcomeDescriptionText;
  let index = 0;
  typedDescription.value = "";
  isDescriptionTyping.value = true;

  const typeNextChar = () => {
    if (index < target.length) {
      typedDescription.value += target.charAt(index);
      index++;
      descriptionTypeTimeout = setTimeout(typeNextChar, 18);
    } else {
      isDescriptionTyping.value = false;
    }
  };

  typeNextChar();
}

const loginFitStyle = computed(() => ({
  transform: `translateX(-50%) scale(${loginFitScale.value})`,
}));

async function handleRedirectFromQuery() {
  const queryToken = getQueryValue(route.query.token as string);
  const queryMenu = getQueryValue(route.query.menu as string);
  if (!queryToken || !queryMenu) return;
  isLoading.value = true;

  try {
    if (queryMenu === "Logout") {
      logout();
      await navigateTo("/login");
      isLoading.value = false;
      return;
    }
    const queryKodeSentral = getQueryValue(route.query.kode_sentral as string);
    if (queryKodeSentral && import.meta.client) {
      localStorage.setItem("sentralFromApp2", queryKodeSentral);
      localStorage.setItem(
        "tglFromApp2",
        getQueryValue(route.query.date as string),
      );
    }
    const existingToken = authStore.token;
    let levelId = authStore.user?.level_id || "";
    if (queryToken !== existingToken || !authStore.user) {
      const resp = await verifyRedirectToken({ token: queryToken });
      levelId = resp.data?.level_id || "1";
    }
    const target = resolveTargetRoute(queryMenu, levelId);
    await navigateTo(
      target.name === "Overview" ? "/home" : `/${target.name.toLowerCase()}`,
    );
  } catch {
    await navigateTo("/");
  } finally {
    isLoading.value = false;
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

async function goToSSOUrl() {
  try {
    const resp = await getSSOUrl();
    if (resp?.data && import.meta.client) {
      window.location.href = resp.data;
    }
  } catch {
    errorMessage.value = "Gagal memuat URL SSO.";
  }
}

const openForgotModal = () => {
  forgotEmail.value = email.value;
  forgotEmailError.value = "";
  showForgotModal.value = true;
};

const openUnlockModal = () => {
  unlockEmail.value = email.value;
  unlockEmailError.value = "";
  showUnlockModal.value = true;
};

const closeForgotModal = () => {
  if (isResetLoading.value) return;
  showForgotModal.value = false;
};

const closeUnlockModal = () => {
  if (isUnlockLoading.value) return;
  showUnlockModal.value = false;
};

async function handleForgotSubmit() {
  forgotEmailError.value = "";

  if (!forgotEmail.value) {
    forgotEmailError.value = "Email harus diisi.";
    return;
  }

  isResetLoading.value = true;

  try {
    const resp = await forgotPassword({ email: forgotEmail.value });
    authStore.setError(false);
    authStore.setMessage(
      resp?.message || "Instruksi reset password berhasil dikirim.",
    );
    toast.add({
      severity: "success",
      summary: "Password Baru Sudah Dikirim!",
      detail:
        "Kami telah mengirim password sementara ke email Anda. Silakan periksa kotak masuk atau folder spam.",
      life: 3000,
    });
    showForgotModal.value = false;
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Terjadi kesalahan saat mengirim permintaan. Silakan coba lagi.";
    forgotEmailError.value = msg;
  } finally {
    isResetLoading.value = false;
  }
}

async function handleUnlockSubmit() {
  unlockEmailError.value = "";

  if (!unlockEmail.value) {
    unlockEmailError.value = "Email harus diisi.";
    return;
  }

  isUnlockLoading.value = true;

  try {
    const resp = await unlockUser({ email: unlockEmail.value });
    authStore.setError(false);
    authStore.setMessage(resp?.message || "User berhasil di-unlock.");
    toast.add({
      severity: "success",
      summary: "Unlock User Berhasil!",
      detail: resp?.message || "User berhasil di-unlock.",
      life: 3000,
    });
    showUnlockModal.value = false;
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "Email tidak terdaftar atau terjadi kesalahan.";
    unlockEmailError.value = msg;
    authStore.setError(true);
    authStore.setMessage(msg);
  } finally {
    isUnlockLoading.value = false;
  }
}

async function performLogin() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await login({
      email: email.value,
      password: password.value,
    });
    const redirectTarget = (route.query.redirect as string) || "/home";
    await navigateTo(redirectTarget);
  } catch (err: any) {
    errorMessage.value = err?.message || "Email atau password yang dimasukkan salah.";
    nextTick(() => triggerForgotPasswordGuide());
  } finally {
    isLoading.value = false;
  }
}

async function handleCaptchaSuccess() {
  await performLogin();
}

async function handleLogin() {
  emailError.value = "";
  passwordError.value = "";
  errorMessage.value = "";

  if (!email.value) {
    emailError.value = "Email atau Username harus diisi.";
  }
  if (!password.value) {
    passwordError.value = "Password harus diisi.";
  }

  if (emailError.value || passwordError.value) return;
  if (showCaptcha.value || isLoading.value) return;

  showCaptcha.value = true;
}

function animateWelcomeSection() {
  if (!welcomeSection.value) return;

  welcomeAnimationContext = gsap.context(() => {
    const titleItems = [welcomeTitleTop.value, welcomeTitleBottom.value].filter(
      Boolean,
    );

    gsap.set(titleItems, {
      autoAlpha: 0,
      y: 18,
    });
    gsap
      .timeline({
        defaults: {
          ease: "power2.out",
        },
      })
      .to(welcomeTitleTop.value, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
      })
      .to(
        welcomeTitleBottom.value,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          onComplete: () => {
            startDescriptionTypewriter();
          },
        },
        "-=0.35",
      );
  }, welcomeSection.value);
}

function updateLoginFitScale() {
  if (!loginPanelRef.value || !loginFitContentRef.value) return;

  const panelEl = loginPanelRef.value;
  const contentEl = loginFitContentRef.value;
  const availableWidth = panelEl.clientWidth;
  const availableHeight = panelEl.clientHeight;
  const naturalWidth = contentEl.scrollWidth;
  const naturalHeight = contentEl.scrollHeight;

  if (!availableWidth || !availableHeight || !naturalWidth || !naturalHeight) {
    loginFitScale.value = 1;
    return;
  }

  const widthScale = availableWidth / naturalWidth;
  const heightScale = availableHeight / naturalHeight;
  loginFitScale.value = Number(
    Math.max(0.42, Math.min(1, widthScale, heightScale)).toFixed(4),
  );
}

onMounted(async () => {
  await handleRedirectFromQuery();
  await nextTick();
  updateLoginFitScale();

  if (
    typeof ResizeObserver !== "undefined" &&
    loginPanelRef.value &&
    loginFitContentRef.value
  ) {
    loginPanelResizeObserver = new ResizeObserver(() => {
      updateLoginFitScale();
    });
    loginPanelResizeObserver.observe(loginPanelRef.value);
    loginPanelResizeObserver.observe(loginFitContentRef.value);
  }

  if (import.meta.client) {
    window.addEventListener("resize", updateLoginFitScale);
    window.visualViewport?.addEventListener("resize", updateLoginFitScale);
    window.visualViewport?.addEventListener("scroll", updateLoginFitScale);
  }
  animateWelcomeSection();
});

onBeforeUnmount(() => {
  if (descriptionTypeTimeout) {
    clearTimeout(descriptionTypeTimeout);
  }
  welcomeAnimationContext?.revert();
  loginPanelResizeObserver?.disconnect();
  if (import.meta.client) {
    window.removeEventListener("resize", updateLoginFitScale);
    window.visualViewport?.removeEventListener("resize", updateLoginFitScale);
    window.visualViewport?.removeEventListener("scroll", updateLoginFitScale);
  }
});

function triggerForgotPasswordGuide() {
  const driverObj = driver({
    animate: true,
    overlayOpacity: 0.55,
    smoothScroll: true,
    allowClose: true,
    showButtons: [],
    onDestroyStarted: (_element, _step, { driver }) => {
      driver.destroy();
    },
    overlayClickBehavior: "close",
    steps: [
      {
        element: "#btn-lupa-password",
        onHighlighted: (element, _step, { driver }) => {
          if (!element) return;
          element.addEventListener(
            "click",
            () => {
              setTimeout(() => driver.destroy(), 0);
            },
            { once: true },
          );
        },
        popover: {
          description:
            "Email atau password yang Anda masukkan tidak sesuai. Klik tombol ini dan ikuti prosedur pengaturan ulang kata sandi untuk mendapatkan akses kembali ke akun Anda.",
          side: "top",
          align: "center",
        },
      },
    ],
  });
  driverObj.drive();
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault();
}

function onCopy(e: ClipboardEvent) {
  e.preventDefault();
}
</script>

<template>
  <Toast />

  <!-- Forgot Password Modal -->
  <VueFinalModal
    v-model="showForgotModal"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    class="flex justify-center items-center z-[9999]"
    overlay-class="z-[9998]"
    content-class="z-[9999] flex flex-col w-full max-w-xl mx-4 bg-white rounded-xl shadow-lg overflow-hidden"
    @update:model-value="(val) => (showForgotModal = val)"
  >
    <div class="flex justify-between items-center px-6 pt-4 pb-2">
      <div class="flex">
        <img :src="iconLupaPassword" class="h-4 w-auto mb-4 mr-2" >
        <p class="text-xs text-[#8181A5]">Lupa Password</p>
      </div>
      <button
        type="button"
        class="text-gray-400 hover:text-gray-600"
        @click="closeForgotModal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 h-5"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="px-6 pb-6">
      <div class="flex flex-col items-center text-center mb-6">
        <img :src="iconPasswordKonfirmasi" class="h-40 w-auto mb-4 mr-2" >
        <p class="text-xl font-semibold text-gray-800 mb-1">Lupa Password?</p>
        <p class="text-sm text-gray-500">
          Demi keamanan, silakan masukkan email terdaftar untuk menerima
          instruksi pengaturan ulang kata sandi.
        </p>
      </div>
      <div class="mb-4">
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 pr-2 flex items-center pointer-events-none z-10 border-r-2 my-3"
          >
            <img :src="iconEmail" class="w-4 h-4" >
          </div>
          <input
            v-model="forgotEmail"
            type="text"
            placeholder="Masukkan Email"
            class="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
            :class="{ 'border-red-500': forgotEmailError }"
            @keyup.enter="handleForgotSubmit"
          >
        </div>
        <p v-if="forgotEmailError" class="mt-1 text-xs text-red-500">
          {{ forgotEmailError }}
        </p>
      </div>
      <button
        type="button"
        class="w-full bg-[#ED1C24] hover:bg-[#bd161c] disabled:bg-[#ED1C24]/70 text-white font-medium py-3 rounded-lg shadow-md transition duration-300 flex justify-center items-center"
        :disabled="isResetLoading"
        @click="handleForgotSubmit"
      >
        <svg
          v-if="isResetLoading"
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
        <span>Kirim</span>
      </button>
    </div>
  </VueFinalModal>

  <!-- Unlock User Modal -->
  <VueFinalModal
    v-model="showUnlockModal"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    class="flex justify-center items-center z-[9999]"
    overlay-class="z-[9998]"
    content-class="z-[9999] flex flex-col w-full max-w-xl mx-4 bg-white rounded-xl shadow-lg overflow-hidden"
    @update:model-value="(val) => (showUnlockModal = val)"
  >
    <div class="flex justify-between items-center px-6 pt-4 pb-2">
      <div class="flex">
        <Lock class="text-[#8181A5] h-4 w-auto mb-4 mr-2" />
        <p class="text-xs text-[#8181A5]">Unlock User</p>
      </div>
      <button
        type="button"
        class="text-gray-400 hover:text-gray-600"
        @click="closeUnlockModal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-5 h-5"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="px-6 pb-6">
      <div class="flex flex-col items-center text-center mb-6">
        <img :src="iconPasswordKonfirmasi" class="h-40 w-auto mb-4 mr-2" >
        <p class="text-xl font-semibold text-gray-800 mb-1">Unlock User</p>
        <p class="text-sm text-gray-500">
          Masukkan email yang ingin di unlock.
        </p>
      </div>
      <div class="mb-4 flex items-center">
        <div class="flex-1">
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 pr-2 flex items-center pointer-events-none z-10 border-r-2 my-3"
            >
              <img :src="iconEmail" class="w-4 h-4" >
            </div>
            <input
              v-model="unlockEmail"
              type="text"
              placeholder="Masukkan Email"
              class="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm"
              :class="{ 'border-red-500': unlockEmailError }"
              @keyup.enter="handleUnlockSubmit"
            >
          </div>
          <p v-if="unlockEmailError" class="mt-1 text-xs text-red-500">
            {{ unlockEmailError }}
          </p>
        </div>
      </div>
      <button
        type="button"
        class="w-full bg-[#ED1C24] hover:bg-[#bd161c] disabled:bg-[#ED1C24]/70 text-white font-medium py-3 rounded-lg shadow-md transition duration-300 flex justify-center items-center"
        :disabled="isUnlockLoading"
        @click="handleUnlockSubmit"
      >
        <svg
          v-if="isUnlockLoading"
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
        <span>Unlock</span>
      </button>
    </div>
  </VueFinalModal>

  <div class="flex h-full min-h-0 flex-col select-none">
    <LoginSliderCaptcha
      v-if="showCaptcha"
      :on-captcha-success="handleCaptchaSuccess"
      @close="showCaptcha = false"
    />

    <!-- Login Form -->
    <div
      ref="loginPanelRef"
      class="relative flex-1 min-h-0 overflow-hidden rounded-[24px] bg-[#EEEEEE]"
    >
      <div class="login-fit-stage">
        <div
          ref="loginFitContentRef"
          class="login-fit-content px-20 py-14"
          :style="loginFitStyle"
        >
          <!-- Logos -->
          <div class="flex items-center gap-4 mb-[45px]">
            <img :src="iconFullPln" class="h-[32px]" >
          </div>
          <!-- <div v-if="logo81K" class="absolute -top-1 -right-7">
            <img :src="logo81K" />
          </div>
          <div v-if="birdImage" class="absolute top-14 right-64">
            <img :src="birdImage" class="h-[130px] opacity-50" />
          </div>
          <div class="relative z-10 flex items-center gap-4 mb-[40px]">
            <img :src="logoMapp" class="h-[30px]" />
          </div> -->

          <!-- Title & Description -->
          <div ref="welcomeSection" class="relative z-10 mb-[30px]">
            <h1
              ref="welcomeTitleTop"
              class="text-[30px] font-montserrat font-medium"
              style="opacity: 0; transform: translateY(18px)"
            >
              Selamat datang di
            </h1>
            <h1
              ref="welcomeTitleBottom"
              class="mb-4 text-[30px] font-montserrat font-medium"
              style="opacity: 0; transform: translateY(18px)"
            >
              MAPP Tambora
            </h1>
            <p
              ref="welcomeDescription"
              class="text-[14px] text-[#818286] text-justify font-lato min-h-[60px]"
            >
              <span>{{ typedDescription }}</span>
              <span
                v-if="isDescriptionTyping"
                class="inline-block w-[2px] h-3.5 bg-blue-600 ml-0.5 align-middle animate-pulse"
              />
            </p>
          </div>

          <!-- Email -->
          <div
            class="relative z-10 shadow-[2px_0px_25px_0px_rgba(0,67,101,0.1)] rounded-[24px]"
          >
            <div
              class="absolute inset-y-0 left-0 pl-4 pr-2 flex items-center pointer-events-none z-10 border-r-2 my-4"
            >
              <img :src="iconEmail" class="w-4 h-4" >
            </div>
            <input
              v-model="email"
              type="text"
              placeholder="Masukkan Email"
              class="w-full pl-12 pr-4 py-4 !bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              :class="{ 'border-red-500': emailError }"
              @keyup.enter="handleLogin"
            >
          </div>
          <p class="mb-[20px] text-red-500 text-xs mt-1">
            {{ emailError }}
          </p>

          <!-- Password Input -->
          <div
            class="relative z-10 shadow-[2px_0px_25px_0px_rgba(0,67,101,0.1)] rounded-[24px]"
          >
            <div
              class="absolute inset-y-0 left-0 pl-4 pr-2 flex items-center pointer-events-none z-10 border-r-2 my-4"
            >
              <img :src="iconPassword" class="w-4 h-4" >
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan Password"
              class="w-full pl-12 pr-12 py-4 !bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              :class="{ 'border-red-500': passwordError }"
              @keyup.enter="handleLogin"
              @paste="onPaste"
              @copy="onCopy"
            >

            <!-- Toggle Password Icon -->
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none z-10"
              @click="togglePassword"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            </button>
          </div>
          <p class="mb-[20px] text-red-500 text-xs mt-1">
            {{ passwordError }} {{ errorMessage }}
          </p>

          <!-- Forgot Password -->
          <div
            class="relative z-10 flex flex-wrap justify-start items-center gap-1 sm:gap-2 mb-[24px] sm:mb-[28px] select-none"
          >
            <p
              id="btn-unlock-user"
              class="text-xs font-medium text-[#2671D9] hover:text-[#2671D9] cursor-pointer underline"
              @click="openUnlockModal"
            >
              Unlock User
            </p>
            <p class="text-xs font-medium text-[#9d9d9d]">atau</p>
            <p
              id="btn-lupa-password"
              class="text-xs font-medium text-[#2671D9] hover:text-[#2671D9] cursor-pointer underline"
              @click="openForgotModal"
            >
              Lupa Password?
            </p>
          </div>

          <!-- Login Button -->
          <button
            type="button"
            :disabled="isLoading"
            class="relative z-10 w-full bg-[#2671D9] hover:bg-[#2671D9] disabled:bg-[#2671D9]/70 text-white font-medium py-3 rounded-lg shadow-md transition duration-300 flex justify-center items-center"
            @click="handleLogin"
          >
            <svg
              v-if="isLoading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            {{ isLoading ? "Masuk ke Aplikasi" : "Masuk ke Aplikasi" }}
          </button>

          <!-- Divider -->
          <div class="z-10 my-[15px] flex justify-center items-center gap-3">
            <p class="shrink-0 text-sm text-[#67687966]">atau login dengan</p>
          </div>

          <!-- SSO Button -->
          <button
            type="button"
            class="relative z-10 w-full bg-white border border-[#2D74C2] text-blue-600 hover:bg-[#fde8e9] font-medium py-3 rounded-lg transition duration-300 flex justify-center items-center gap-2"
            @click="goToSSOUrl"
          >
            <img :src="iconPln" class="h-[16px]" >
            <p class="text-[#2D74C2]">Masuk ke SSO ( IAM PLN )</p>
          </button>
        </div>
      </div>
    </div>

    <!--Footer-->
    <div class="mt-5 p-3 flex items-center bg-[#EEEEEE] rounded-[24px]">
      <img :src="iconHelpdesk" class="h-[48px] pr-[10px]" >
      <div class="h-[40px] text-xs text-gray-600 flex flex-col justify-between">
        <p class="font-bold">
          Aplikasi PLN
          <span class="font-normal">V1.0.0.1 Powered by</span> PLN ICONPLUS
        </p>
        <p>
          helpdesk.ic@iconpln.co.id | 0813 8287 7162 | Security Issue :
          soc@pln.co.id
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-panel-logo-indo {
  position: absolute;
  top: -8px;
  left: -4px;
  z-index: 20;
  pointer-events: none;
}

.login-panel-background {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}

.login-fit-stage {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 10;
}

.login-fit-content {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  transform-origin: top center;
  will-change: transform;
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-text-fill-color: #000000;
  caret-color: #000000;
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
  box-shadow: 0 0 0 1000px #ffffff inset;
  transition: background-color 9999s ease-in-out 0s;
}
</style>
