import { useApi } from '~/composables/useApi';
import { ref, computed } from "vue";
import type {
  NKODTO,
  CreateNKOBatchPayload,
  UpdateNKOPayload,
  ApiResponse
} from "~/types";

export const useNKO = () => {
  const api = useApi();
  const list = ref<NKODTO[]>([]);
  const currentItem = ref<NKODTO | null>(null);
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
      const res = await api<ApiResponse<NKODTO[]>>("/nko", { query });
      if (res?.data && Array.isArray(res.data)) {
        list.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        list.value = [];
        total.value = 0;
      }
      return list.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat data perhitungan NKO.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<NKODTO>>(`/nko/${id}`);
      if (res?.data) {
        currentItem.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail item NKO.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createBatch = async (payload: CreateNKOBatchPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<NKODTO[]>>("/nko", {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal menyimpan data NKO batch.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async (id: string, payload: UpdateNKOPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<NKODTO>>(`/nko/${id}`, {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal memperbarui item NKO.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/nko/${id}/delete`, {
        method: "POST"
      });
      await fetchList();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus item NKO.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const exportExcel = async () => {
    loading.value = true;
    error.value = null;
    try {
      if (import.meta.client) {
        window.open("/api/v1/nko/export", "_blank");
      }
    } catch (err: any) {
      error.value = err?.message || "Gagal mengunduh file Excel NKO.";
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
    createBatch,
    updateItem,
    deleteItem,
    exportExcel
  };
};
