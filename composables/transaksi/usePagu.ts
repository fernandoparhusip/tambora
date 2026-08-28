import { ref, computed } from "vue";
import { useApi } from "~/composables/useApi";
import type {
  PaguDTO,
  CreatePaguPayload,
  UpdatePaguPayload,
  ApiResponse
} from "~/types";

export const usePagu = () => {
  const api = useApi();
  const list = ref<PaguDTO[]>([]);
  const currentItem = ref<PaguDTO | null>(null);
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
      const res = await api<ApiResponse<PaguDTO[]>>("/pagu", { query });
      if (res?.data && Array.isArray(res.data)) {
        list.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        list.value = [];
        total.value = 0;
      }
      return list.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat data pagu anggaran.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PaguDTO>>(`/pagu/${id}`);
      if (res?.data) {
        currentItem.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail pagu.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createItem = async (payload: CreatePaguPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PaguDTO>>("/pagu", {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat data pagu.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async (id: string, payload: UpdatePaguPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PaguDTO>>(`/pagu/${id}`, {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal memperbarui pagu.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/pagu/${id}/delete`, {
        method: "POST"
      });
      await fetchList();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus pagu.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reviseItem = async (id: string, payload: UpdatePaguPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PaguDTO>>(`/pagu/${id}/revise`, {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal merevisi pagu.";
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
        window.open("/api/v1/pagu/export", "_blank");
      }
    } catch (err: any) {
      error.value = err?.message || "Gagal mengunduh file Excel pagu.";
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
    deleteItem,
    reviseItem,
    exportExcel
  };
};
