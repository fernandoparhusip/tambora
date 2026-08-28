import { ref, computed } from "vue";
import { useApi } from "~/composables/useApi";
import type {
  OperasiHarianDTO,
  CreateOperasiHarianPayload,
  UpdateOperasiHarianPayload,
  ApiResponse
} from "~/types";

export const useOperasiHarian = () => {
  const api = useApi();
  const list = ref<OperasiHarianDTO[]>([]);
  const currentItem = ref<OperasiHarianDTO | null>(null);
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
      const res = await api<ApiResponse<OperasiHarianDTO[]>>("/operasi-harian", { query });
      if (res?.data && Array.isArray(res.data)) {
        list.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        list.value = [];
        total.value = 0;
      }
      return list.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat data operasi harian.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<OperasiHarianDTO>>(`/operasi-harian/${id}`);
      if (res?.data) {
        currentItem.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail operasi harian.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createItem = async (payload: CreateOperasiHarianPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<OperasiHarianDTO>>("/operasi-harian", {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mencatat operasi harian.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async (id: string, payload: UpdateOperasiHarianPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<OperasiHarianDTO>>(`/operasi-harian/${id}`, {
        method: "PUT",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal memperbarui operasi harian.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/operasi-harian/${id}`, {
        method: "DELETE"
      });
      await fetchList();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus operasi harian.";
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
