import { ref } from 'vue'

export interface UseAsyncDetailOptions<T> {
  /**
   * Fungsi asynchronous opsional untuk mengambil data lengkap dari server.
   * Dipanggil otomatis di background saat handleView dieksekusi.
   */
  fetchDetail?: (id: string) => Promise<T | null | undefined>
  /**
   * Resolusi ID kustom dari objek record jika ID tidak berada di field 'id'.
   */
  getId?: (record: T) => string
  /**
   * Callback opsional yang dipanggil saat user menekan tombol 'UBAH DATA' di modal detail.
   */
  onEdit?: (record: T) => void
}

/**
 * Composable Universal untuk menangani modal View Detail.
 * Dilengkapi dengan:
 * 1. Monotonic Request Counter: Menjamin 100% bebas dari Race Condition (Stale Response).
 * 2. Optimistic Preview: Membuka modal seketika (0ms) dari baris tabel.
 * 3. Safe Edit Transition: Mengamankan snapshot record sebelum modal detail ditutup.
 * 4. Clean State Reset: Membersihkan memori record begitu modal ditutup.
 */
export function useAsyncDetail<T extends { id?: string | number; [key: string]: any }>(
  options: UseAsyncDetailOptions<T> = {}
) {
  const isDetailModalOpen = ref(false)
  const detailRecord = ref<T | null>(null)
  const detailLoading = ref(false)

  // Counter unik per klik untuk membatalkan respon asinkron yang terlambat
  let currentRequestId = 0

  /**
   * Membuka modal detail secara optimis dan memicu background sync jika fetchDetail tersedia.
   */
  const handleView = async (
    row: T,
    customFetch?: (id: string) => Promise<T | null | undefined>
  ) => {
    const requestId = ++currentRequestId

    // 1. Optimistic snapshot: langsung render data yang ada di tabel
    detailRecord.value = { ...row }
    isDetailModalOpen.value = true

    const fetchFn = customFetch || options.fetchDetail
    const recordId = options.getId
      ? options.getId(row)
      : (row?.id
          ? String(row.id)
          : String((row as any)?.kode_cabang || (row as any)?.kode_regional || (row as any)?.kode_wilayah || ''))

    if (!fetchFn || !recordId) {
      return
    }

    // 2. Fetch data lengkap di background
    detailLoading.value = true
    try {
      const fresh = await fetchFn(recordId)

      // Guard: Hanya timpa data jika request ini adalah request TERAKHIR dan modal MASIH terbuka
      if (requestId === currentRequestId && isDetailModalOpen.value && fresh) {
        detailRecord.value = fresh
      }
    } catch {
      // Fallback anggun: data preview tabel tetap aman ditampilkan
    } finally {
      if (requestId === currentRequestId) {
        detailLoading.value = false
      }
    }
  }

  /**
   * Menutup modal detail dan membersihkan data record dari memori.
   */
  const closeDetailModal = () => {
    isDetailModalOpen.value = false
    detailRecord.value = null
    detailLoading.value = false
  }

  /**
   * Menutup modal detail dengan aman dan meneruskan record snapshot ke callback edit.
   */
  const openEditFromDetail = (customEdit?: (record: T) => void) => {
    const target = detailRecord.value
    closeDetailModal()

    const editFn = customEdit || options.onEdit
    if (target && editFn) {
      editFn(target)
    }
  }

  return {
    isDetailModalOpen,
    detailRecord,
    detailLoading,
    handleView,
    closeDetailModal,
    openEditFromDetail
  }
}
