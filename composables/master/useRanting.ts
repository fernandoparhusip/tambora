import { useApi } from "~/composables/useApi";
import { ref, computed } from "vue";
import { extractApiErrorMessage } from "~/utils/apiError";
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
  const detailLoading = ref(false);
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
      error.value = extractApiErrorMessage(err, "Gagal memuat daftar ranting.");
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
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<any>(`/ranting/${id}`);
      const data = res?.data || res;
      if (data) {
        currentRanting.value = data;
      }
      return data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Gagal mengambil detail ranting.");
      error.value = msg;
      const customErr = new Error(msg);
      (customErr as any).data = err?.data;
      (customErr as any).response = err?.response;
      throw customErr;
    } finally {
      detailLoading.value = false;
    }
  };

  const createRanting = async (payload: CreateRantingRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<RantingItem>>("/ranting", {
        method: "POST",
        body: payload,
      });
      await fetchRanting();
      return res?.data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Gagal membuat ranting.");
      error.value = msg;
      const customErr = new Error(msg);
      (customErr as any).data = err?.data;
      (customErr as any).response = err?.response;
      throw customErr;
    }
  };

  const updateRanting = async (id: string, payload: UpdateRantingRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<RantingItem>>(`/ranting/${id}`, {
        method: "POST",
        body: payload,
      });
      await fetchRanting();
      return res?.data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Gagal mengubah data ranting.");
      error.value = msg;
      const customErr = new Error(msg);
      (customErr as any).data = err?.data;
      (customErr as any).response = err?.response;
      throw customErr;
    }
  };

  const deleteRanting = async (id: string) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/ranting/${id}/delete`, {
        method: "POST",
      });
      await fetchRanting();
      return res;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Gagal menghapus ranting.");
      error.value = msg;
      const customErr = new Error(msg);
      (customErr as any).data = err?.data;
      (customErr as any).response = err?.response;
      throw customErr;
    }
  };

  return {
    rantingList: computed(() => rantingList.value),
    currentRanting: computed(() => currentRanting.value),
    loading: computed(() => loading.value),
    detailLoading: computed(() => detailLoading.value),
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
