import { useApi } from "~/composables/useApi";
import { ref, computed } from "vue";
import type {
  CabangItem,
  CreateCabangRequest,
  UpdateCabangRequest,
  ApiResponse,
} from "~/types";

export const useCabang = () => {
  const api = useApi();
  const cabangList = ref<CabangItem[]>([]);
  const currentCabang = ref<CabangItem | null>(null);
  const loading = ref(false);
  const total = ref(0);
  const error = ref<string | null>(null);

  const fetchCabang = async (
    params: { limit?: number; offset?: number; search?: string; kode_wilayah?: string } = {}
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

      const res = await api<ApiResponse<CabangItem[]>>("/cabang", { query });
      if (res?.data && Array.isArray(res.data)) {
        cabangList.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        cabangList.value = [];
        total.value = 0;
      }
      return cabangList.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar cabang.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCabangById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<CabangItem>>(`/cabang/${id}`);
      if (res?.data) {
        currentCabang.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail cabang.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCabang = async (payload: CreateCabangRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<CabangItem>>("/cabang", {
        method: "POST",
        body: payload,
      });
      await fetchCabang();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat cabang.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCabang = async (id: string, payload: UpdateCabangRequest) => {
    loading.value = true;
    error.value = null;
    try {
      let res: any;
      try {
        res = await api<ApiResponse<CabangItem>>(`/cabang/${id}`, {
          method: "POST",
          body: payload,
        });
      } catch {
        res = await api<ApiResponse<CabangItem>>(`/cabang/${id}`, {
          method: "PUT",
          body: payload,
        });
      }
      await fetchCabang();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengubah data cabang.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCabang = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      let res: any;
      try {
        res = await api<ApiResponse<null>>(`/cabang/${id}/delete`, {
          method: "POST",
        });
      } catch {
        res = await api<ApiResponse<null>>(`/cabang/${id}`, {
          method: "DELETE",
        });
      }
      await fetchCabang();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus cabang.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchCabangCombo = async () => {
    try {
      const res = await api<ApiResponse<CabangItem[]>>("/cabang/combo");
      if (res?.data && Array.isArray(res.data)) {
        return res.data;
      }
    } catch {
      // fallback
    }
    return await fetchCabang({ limit: 100 });
  };

  return {
    cabangList: computed(() => cabangList.value),
    currentCabang: computed(() => currentCabang.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchCabang,
    getCabangById,
    createCabang,
    updateCabang,
    deleteCabang,
    fetchCabangCombo,
  };
};
