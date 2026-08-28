import { useApi } from '~/composables/useApi';
import { ref, computed } from "vue";
import type {
  AssetItem,
  CreateAssetRequest,
  UpdateAssetRequest,
  ApiResponse
} from "~/types";

export const useAsset = () => {
  const api = useApi();
  const assets = ref<AssetItem[]>([]);
  const currentAsset = ref<AssetItem | null>(null);
  const loading = ref(false);
  const total = ref(0);
  const error = ref<string | null>(null);

  const fetchAssets = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0
      };
      const res = await api<ApiResponse<AssetItem[]>>("/assets", { query });
      if (res?.data && Array.isArray(res.data)) {
        assets.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        assets.value = [];
        total.value = 0;
      }
      return assets.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar aset mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getAssetById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<AssetItem>>(`/assets/${id}`);
      if (res?.data) {
        currentAsset.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail aset mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createAsset = async (payload: CreateAssetRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<AssetItem>>("/assets", {
        method: "POST",
        body: payload
      });
      await fetchAssets();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat data aset mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateAsset = async (id: string, payload: UpdateAssetRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<AssetItem>>(`/assets/${id}`, {
        method: "POST",
        body: payload
      });
      await fetchAssets();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengubah data aset mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAsset = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/assets/${id}/delete`, {
        method: "POST"
      });
      await fetchAssets();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus aset mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    assets: computed(() => assets.value),
    currentAsset: computed(() => currentAsset.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset
  };
};
