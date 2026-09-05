import { ref } from "vue";
import { useApi } from "~/composables/useApi";
import type {
  RegionalItem,
  CreateRegionalRequest,
  UpdateRegionalRequest,
  ApiResponse,
  SelectOption,
} from "~/types";

export const useRegional = () => {
  const api = useApi();
  const regionalList = ref<RegionalItem[]>([]);
  const currentRegional = ref<RegionalItem | null>(null);
  const regionalCombo = ref<SelectOption[]>([]);
  const loading = ref(false);
  const detailLoading = ref(false);
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

      const res = await api<any>("/regional", { query });
      const list = Array.isArray(res) ? res : (res?.data || []);
      regionalList.value = Array.isArray(list) ? list : [];
      total.value = res?.meta?.total || regionalList.value.length;
      return regionalList.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar regional.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRegionals = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<any>("/regional");
      const list = Array.isArray(res) ? res : (res?.data || []);
      regionalList.value = Array.isArray(list) ? list : [];
      total.value = res?.meta?.total || regionalList.value.length;
      return regionalList.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar regional.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRegionalCombo = async () => {
    try {
      const res = await api<ApiResponse<Array<{ id: string; name?: string; nama_regional?: string; code?: string; kode_regional?: string }>>>("/regional/combo");
      if (res?.data && Array.isArray(res.data)) {
        regionalCombo.value = res.data.map((item) => ({
          label: item.nama_regional || item.name || item.kode_regional || item.code || item.id,
          value: item.id,
        }));
      }
      return regionalCombo.value;
    } catch {
      return [];
    }
  };

  const getRegionalById = async (id: string) => {
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<any>(`/regional/${id}`);
      const data = res?.data || res;
      currentRegional.value = data;
      return data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail regional.";
      throw err;
    } finally {
      detailLoading.value = false;
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
      return res?.data || res;
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
      const res = await api<ApiResponse<RegionalItem>>(`/regional/${id}`, {
        method: "POST",
        body: payload,
      });
      await fetchRegional();
      return res?.data || res;
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
      const res = await api<ApiResponse<null>>(`/regional/${id}/delete`, {
        method: "POST",
      });
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
    regionalList,
    regionals: regionalList,
    currentRegional,
    regionalCombo,
    loading,
    detailLoading,
    total,
    error,
    fetchRegional,
    fetchRegionals,
    fetchRegionalCombo,
    getRegionalById,
    createRegional,
    updateRegional,
    deleteRegional,
  };
};
