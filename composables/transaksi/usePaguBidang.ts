import { ref, computed } from "vue";
import { useApi } from "~/composables/useApi";
import type { PaguBidangItem, PaguBidangPayload } from "~/types/transaksi/pagu.types";
import type { ApiResponse } from "./usePagu";

export const usePaguBidang = () => {
  const api = useApi();
  const list = ref<PaguBidangItem[]>([]);
  const loading = ref(false);

  const fetchList = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true;
    try {
      const query = {
        limit: params.limit || 50,
        offset: params.offset || 0
      };
      const res = await api<ApiResponse<PaguBidangItem[]>>("/pagu-bidang", { query });
      list.value = res?.data || [];
      return list.value;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id: string) => {
    return await api<ApiResponse<PaguBidangItem>>(`/pagu-bidang/${id}`);
  };

  const createItem = async (payload: PaguBidangPayload) => {
    return await api("/pagu-bidang", {
      method: "POST",
      body: payload,
    });
  };

  const updateItem = async (id: string, payload: Partial<PaguBidangPayload>) => {
    return await api(`/pagu-bidang/${id}`, {
      method: "POST",
      body: payload,
    });
  };

  const deleteItem = async (id: string) => {
    return await api(`/pagu-bidang/${id}/delete`, {
      method: "POST",
    });
  };

  return {
    list: computed(() => list.value),
    loading: computed(() => loading.value),
    fetchList,
    getById,
    createItem,
    updateItem,
    deleteItem
  };
};
