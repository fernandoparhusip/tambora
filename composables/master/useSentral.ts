import { ref } from "vue";
import { useApi } from "~/composables/useApi";
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
  const detailLoading = ref(false);
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

      const res = await api<any>("/sentral", { query });
      const list = Array.isArray(res) ? res : (res?.data || []);
      sentralList.value = Array.isArray(list) ? list : [];
      total.value = res?.meta?.total || sentralList.value.length;
      return sentralList.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar sentral.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSentrals = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<any>("/sentral");
      const list = Array.isArray(res) ? res : (res?.data || []);
      sentralList.value = Array.isArray(list) ? list : [];
      total.value = res?.meta?.total || sentralList.value.length;
      return sentralList.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar sentral.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSentralById = async (id: string) => {
    detailLoading.value = true;
    loading.value = true;
    error.value = null;
    try {
      const res = await api<any>(`/sentral/${id}`);
      const data = res?.data || res;
      currentSentral.value = data;
      return data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail sentral.";
      throw err;
    } finally {
      detailLoading.value = false;
      loading.value = false;
    }
  };

  const createSentral = async (payload: CreateSentralRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem>>("/sentral", {
        method: "POST",
        body: payload,
      });
      await fetchSentral();
      return res?.data || res;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat sentral baru.";
      throw err;
    }
  };

  const updateSentral = async (id: string, payload: UpdateSentralRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem>>(`/sentral/${id}`, {
        method: "POST",
        body: payload,
      });
      await fetchSentral();
      return res?.data || res;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengubah data sentral.";
      throw err;
    }
  };

  const deleteSentral = async (id: string) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/sentral/${id}/delete`, {
        method: "POST",
      });
      await fetchSentral();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus sentral.";
      throw err;
    }
  };

  const approveSentral = async (id: string) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem>>(`/sentral/${id}/approve`, {
        method: "POST",
      });
      await fetchSentral();
      return res?.data || res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menyetujui (approve) sentral.";
      throw err;
    }
  };

  return {
    sentralList,
    sentrals: sentralList,
    currentSentral,
    loading,
    detailLoading,
    total,
    error,
    fetchSentral,
    fetchSentrals,
    getSentralById,
    createSentral,
    updateSentral,
    deleteSentral,
    approveSentral,
  };
};
