import { useApi } from "~/composables/useApi";
import { ref, computed } from "vue";
import type {
  SentralItem,
  CreateSentralRequest,
  UpdateSentralRequest,
  ApiResponse,
} from "~/types";

export const useSentral = () => {
  const api = useApi();
  const sentralList = ref<SentralItem[]>([]);
  const currentSentral = ref<SentralItem | null>(null);
  const loading = ref(false);
  const total = ref(0);
  const error = ref<string | null>(null);

  const fetchSentral = async (
    params: { limit?: number; offset?: number; search?: string; kode_wilayah?: string; kode_ranting?: string } = {}
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0,
      };
      if (params.search) query.search = params.search;
      if (params.kode_wilayah) query.kode_wilayah = params.kode_wilayah;
      if (params.kode_ranting) query.kode_ranting = params.kode_ranting;

      const res = await api<ApiResponse<SentralItem[]>>("/sentral", { query });
      if (res?.data && Array.isArray(res.data)) {
        sentralList.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        sentralList.value = [];
        total.value = 0;
      }
      return sentralList.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar sentral.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSentralById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem>>(`/sentral/${id}`);
      if (res?.data) {
        currentSentral.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail sentral.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSentral = async (payload: CreateSentralRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem>>("/sentral", {
        method: "POST",
        body: payload,
      });
      await fetchSentral();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat sentral.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSentral = async (id: string, payload: UpdateSentralRequest) => {
    loading.value = true;
    error.value = null;
    try {
      let res: any;
      try {
        res = await api<ApiResponse<SentralItem>>(`/sentral/${id}`, {
          method: "POST",
          body: payload,
        });
      } catch {
        res = await api<ApiResponse<SentralItem>>(`/sentral/${id}`, {
          method: "PUT",
          body: payload,
        });
      }
      await fetchSentral();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengubah data sentral.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSentral = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      let res: any;
      try {
        res = await api<ApiResponse<null>>(`/sentral/${id}/delete`, {
          method: "POST",
        });
      } catch {
        res = await api<ApiResponse<null>>(`/sentral/${id}`, {
          method: "DELETE",
        });
      }
      await fetchSentral();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus sentral.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const approveSentral = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem>>(`/sentral/${id}/approve`, {
        method: "POST",
      });
      await fetchSentral();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal menyetujui (approve) sentral.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    sentralList: computed(() => sentralList.value),
    currentSentral: computed(() => currentSentral.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchSentral,
    getSentralById,
    createSentral,
    updateSentral,
    deleteSentral,
    approveSentral,
  };
};
