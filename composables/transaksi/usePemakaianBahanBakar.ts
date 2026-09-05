import { useApi } from '~/composables/useApi';
import { ref, computed } from "vue";
import type {
  PemakaianBahanBakarDTO,
  CreatePemakaianBahanBakarPayload,
  UpdatePemakaianBahanBakarPayload,
  ApiResponse
} from "~/types";

export const usePemakaianBahanBakar = () => {
  const api = useApi();
  const list = ref<PemakaianBahanBakarDTO[]>([]);
  const currentItem = ref<PemakaianBahanBakarDTO | null>(null);
  const loading = ref(false);
  const total = ref(0);
  const error = ref<string | null>(null);

  const fetchList = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0
      };
      const res = await api<ApiResponse<PemakaianBahanBakarDTO[]>>("/pemakaian-bahan-bakar", { query });
      if (res?.data && Array.isArray(res.data)) {
        list.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        list.value = [];
        total.value = 0;
      }
      return list.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat data pemakaian bahan bakar.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PemakaianBahanBakarDTO>>(`/pemakaian-bahan-bakar/${id}`);
      if (res?.data) {
        currentItem.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail pemakaian bahan bakar.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createItem = async (payload: CreatePemakaianBahanBakarPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PemakaianBahanBakarDTO>>("/pemakaian-bahan-bakar", {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mencatat pemakaian bahan bakar.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async (id: string, payload: UpdatePemakaianBahanBakarPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PemakaianBahanBakarDTO>>(`/pemakaian-bahan-bakar/${id}`, {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal memperbarui pemakaian bahan bakar.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/pemakaian-bahan-bakar/${id}/delete`, {
        method: "POST"
      });
      await fetchList();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus data pemakaian bahan bakar.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    list: computed(() => list.value),
    currentItem: computed(() => currentItem.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchList,
    getById,
    createItem,
    updateItem,
    deleteItem
  };
};
