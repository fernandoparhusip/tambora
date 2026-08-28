import { useApi } from '~/composables/useApi';
import { ref, computed } from "vue";
import type {
  PaguBidangDTO,
  CreatePaguBidangPayload,
  UpdatePaguBidangPayload,
  ApiResponse
} from "~/types";

export const usePaguBidang = () => {
  const api = useApi();
  const list = ref<PaguBidangDTO[]>([]);
  const currentItem = ref<PaguBidangDTO | null>(null);
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
      const res = await api<ApiResponse<PaguBidangDTO[]>>("/pagu-bidang", { query });
      if (res?.data && Array.isArray(res.data)) {
        list.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        list.value = [];
        total.value = 0;
      }
      return list.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat data pagu bidang.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PaguBidangDTO>>(`/pagu-bidang/${id}`);
      if (res?.data) {
        currentItem.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail pagu bidang.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createItem = async (payload: CreatePaguBidangPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PaguBidangDTO>>("/pagu-bidang", {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat data pagu bidang.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateItem = async (id: string, payload: UpdatePaguBidangPayload) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<PaguBidangDTO>>(`/pagu-bidang/${id}`, {
        method: "POST",
        body: payload
      });
      await fetchList();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal memperbarui pagu bidang.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteItem = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/pagu-bidang/${id}/delete`, {
        method: "POST"
      });
      await fetchList();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus pagu bidang.";
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
