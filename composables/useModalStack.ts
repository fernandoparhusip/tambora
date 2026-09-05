import { watch, onBeforeUnmount, type Ref } from "vue";

/**
 * Stack modal aktif secara global (LIFO - Last In First Out).
 * Menjamin hanya modal paling atas yang tertutup ketika tombol Esc ditekan.
 */
const activeModals: Array<() => void> = [];
let isListenerBound = false;

function handleGlobalKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape" && activeModals.length > 0) {
    e.preventDefault();
    e.stopPropagation();
    // Eksekusi fungsi tutup milik modal paling atas (terakhir dibuka)
    const topModalClose = activeModals[activeModals.length - 1];
    if (typeof topModalClose === "function") {
      topModalClose();
    }
  }
}

function bindGlobalListener() {
  if (typeof window !== "undefined" && !isListenerBound) {
    window.addEventListener("keydown", handleGlobalKeyDown);
    isListenerBound = true;
  }
}

function unbindGlobalListenerIfEmpty() {
  if (typeof window !== "undefined" && activeModals.length === 0 && isListenerBound) {
    window.removeEventListener("keydown", handleGlobalKeyDown);
    isListenerBound = false;
  }
}

/**
 * Composable untuk mendaftarkan modal ke LIFO stack saat terbuka.
 *
 * @param isOpen Ref boolean status modal terbuka
 * @param onClose Callback fungsi tutup yang sama dengan tombol Tutup/Batal
 */
export function useModalEsc(isOpen: Ref<boolean>, onClose: () => void) {
  const register = () => {
    bindGlobalListener();
    const idx = activeModals.indexOf(onClose);
    if (idx === -1) {
      activeModals.push(onClose);
    }
  };

  const unregister = () => {
    const idx = activeModals.indexOf(onClose);
    if (idx !== -1) {
      activeModals.splice(idx, 1);
    }
    unbindGlobalListenerIfEmpty();
  };

  watch(
    isOpen,
    (open) => {
      if (open) {
        register();
      } else {
        unregister();
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    unregister();
  });
}
