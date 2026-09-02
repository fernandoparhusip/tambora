import { useApi } from "~/composables/useApi";
import { ref, computed } from "vue";
import type {
  RantingItem,
  CreateRantingRequest,
  UpdateRantingRequest,
  ApiResponse,
} from "~/types";

export const useRanting = () => {
  const api = useApi();
  const rantingList = ref<RantingItem[]>([]);
  const currentRanting = ref<RantingItem | null>(null);
  const loading = ref(false);
  const total = ref(0);
  const error = ref<string | null>(null);

  const fetchRanting = async (
    params: { limit?: number; offset?: number; search?: string; kode_cabang?: string } = {}
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0,
      };
      if (params.search) query.search = params.search;
      if (params.kode_cabang) query.kode_cabang = params.kode_cabang;

      const res = await api<ApiResponse<RantingItem[]>>("/ranting", { query });
      if (res?.data && Array.isArray(res.data)) {
        rantingList.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        rantingList.value = [];
        total.value = 0;
      }
      return rantingList.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar ranting.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRantingCombo = async (params: { kode_cabang?: string } = {}) => {
    try {
      const query: Record<string, any> = {};
      if (params.kode_cabang) query.kode_cabang = params.kode_cabang;
      const res = await api<ApiResponse<RantingItem[]>>("/ranting/combo", { query });
      if (res?.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // fallback
    }
    return await fetchRanting({ limit: 100, ...params });
  };

  const getRantingById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<RantingItem>>(`/ranting/${id}`);
      if (res?.data) {
        currentRanting.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail ranting.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createRanting = async (payload: CreateRantingRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<RantingItem>>("/ranting", {
        method: "POST",
        body: payload,
      });
      await fetchRanting();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat ranting.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRanting = async (id: string, payload: UpdateRantingRequest) => {
    loading.value = true;
    error.value = null;
    try {
      let res: any;
      try {
        res = await api<ApiResponse<RantingItem>>(`/ranting/${id}`, {
          method: "POST",
          body: payload,
        });
      } catch {
        res = await api<ApiResponse<RantingItem>>(`/ranting/${id}`, {
          method: "PUT",
          body: payload,
        });
      }
      await fetchRanting();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengubah data ranting.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRanting = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      let res: any;
      try {
        res = await api<ApiResponse<null>>(`/ranting/${id}/delete`, {
          method: "POST",
        });
      } catch {
        res = await api<ApiResponse<null>>(`/ranting/${id}`, {
          method: "DELETE",
        });
      }
      await fetchRanting();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus ranting.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    rantingList: computed(() => rantingList.value),
    currentRanting: computed(() => currentRanting.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchRanting,
    fetchRantingCombo,
    getRantingById,
    createRanting,
    updateRanting,
    deleteRanting,
  };
};
