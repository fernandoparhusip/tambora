import { useApi } from "~/composables/useApi";
import { ref, computed } from "vue";
import type {
  RegionalItem,
  CreateRegionalRequest,
  UpdateRegionalRequest,
  ApiResponse,
} from "~/types";

export const useRegional = () => {
  const api = useApi();
  const regionalList = ref<RegionalItem[]>([]);
  const currentRegional = ref<RegionalItem | null>(null);
  const loading = ref(false);
  const total = ref(0);
  const error = ref<string | null>(null);

  const fetchRegional = async (
    params: { limit?: number; offset?: number; search?: string } = {}
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0,
      };
      if (params.search) query.search = params.search;

      const res = await api<ApiResponse<RegionalItem[]>>("/regional", { query });
      if (res?.data && Array.isArray(res.data)) {
        regionalList.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        regionalList.value = [];
        total.value = 0;
      }
      return regionalList.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar regional.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getRegionalById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<RegionalItem>>(`/regional/${id}`);
      if (res?.data) {
        currentRegional.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail regional.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createRegional = async (payload: CreateRegionalRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<RegionalItem>>("/regional", {
        method: "POST",
        body: payload,
      });
      await fetchRegional();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat regional.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateRegional = async (id: string, payload: UpdateRegionalRequest) => {
    loading.value = true;
    error.value = null;
    try {
      let res: any;
      try {
        res = await api<ApiResponse<RegionalItem>>(`/regional/${id}`, {
          method: "POST",
          body: payload,
        });
      } catch {
        res = await api<ApiResponse<RegionalItem>>(`/regional/${id}`, {
          method: "PUT",
          body: payload,
        });
      }
      await fetchRegional();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengubah data regional.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRegional = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      let res: any;
      try {
        res = await api<ApiResponse<null>>(`/regional/${id}/delete`, {
          method: "POST",
        });
      } catch {
        res = await api<ApiResponse<null>>(`/regional/${id}`, {
          method: "DELETE",
        });
      }
      await fetchRegional();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus regional.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    regionalList: computed(() => regionalList.value),
    currentRegional: computed(() => currentRegional.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchRegional,
    getRegionalById,
    createRegional,
    updateRegional,
    deleteRegional,
  };
};
