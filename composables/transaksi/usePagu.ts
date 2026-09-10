import { ref, computed } from "vue";
import { useApi } from "~/composables/useApi";
import type { PaguItem, PaguPayload } from "~/types/transaksi/pagu.types";

// Note: Ensure ApiResponse is imported from the correct types file if needed.
// Assuming it exists globally or in ~/types based on Developer Guide.
export interface ApiResponse<T> {
  data: T;
  meta?: { total: number };
}

export const usePagu = () => {
  const api = useApi();
  const list = ref<PaguItem[]>([]);
  const loading = ref(false);

  const fetchList = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true;
    try {
      const query = {
        limit: params.limit || 50,
        offset: params.offset || 0
      };
      const res = await api<ApiResponse<PaguItem[]>>("/pagu", { query });
      list.value = res?.data || [];
      return list.value;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id: string) => {
    return await api<ApiResponse<PaguItem>>(`/pagu/${id}`);
  };

  const getRiwayat = async (id: string) => {
    const res = await api<ApiResponse<any[]>>(`/pagu/${id}/riwayat`);
    return res?.data || [];
  };

  const createItem = async (payload: PaguPayload) => {
    return await api("/pagu", {
      method: "POST",
      body: payload,
    });
  };

  const updateItem = async (id: string, payload: Partial<PaguPayload>) => {
    return await api(`/pagu/${id}`, {
      method: "POST",
      body: payload,
    });
  };

  const deleteItem = async (id: string) => {
    return await api(`/pagu/${id}/delete`, {
      method: "POST",
    });
  };

  const reviseItem = async (id: string, payload: Partial<PaguPayload>) => {
    return await api(`/pagu/${id}/revise`, {
      method: "POST",
      body: payload,
    });
  };

  const exportExcel = async () => {
    if (import.meta.client) {
      window.open("/api/v1/pagu/export", "_blank");
    }
  };

  return {
    list: computed(() => list.value),
    loading: computed(() => loading.value),
    fetchList,
    getById,
    getRiwayat,
    createItem,
    updateItem,
    deleteItem,
    reviseItem,
    exportExcel
  };
};
