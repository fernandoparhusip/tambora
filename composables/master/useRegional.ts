import { ref } from 'vue';
import { useApi } from '~/composables/useApi';
import type {
  RegionalItem,
  CreateRegionalRequest,
  UpdateRegionalRequest,
  ApiResponse,
  SelectOption
} from '~/types';

export const useRegional = () => {
  const api = useApi();
  const regionals = ref<RegionalItem[]>([]);
  const currentRegional = ref<RegionalItem | null>(null);
  const regionalCombo = ref<SelectOption[]>([]);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchRegionals = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<RegionalItem[]>>('/regional');
      if (res?.data && Array.isArray(res.data)) {
        regionals.value = res.data;
      } else {
        regionals.value = [];
      }
      return regionals.value;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar regional.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchRegionalCombo = async () => {
    try {
      const res = await api<ApiResponse<Array<{ id: string; name?: string; nama_regional?: string; code?: string; kode_regional?: string }>>>('/regional/combo');
      if (res?.data && Array.isArray(res.data)) {
        regionalCombo.value = res.data.map(item => ({
          label: item.nama_regional || item.name || item.kode_regional || item.code || item.id,
          value: item.id
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
      const res = await api<ApiResponse<RegionalItem>>(`/regional/${id}`);
      if (res?.data) {
        currentRegional.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail regional.';
      throw err;
    } finally {
      detailLoading.value = false;
    }
  };

  const createRegional = async (payload: CreateRegionalRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<RegionalItem>>('/regional', {
        method: 'POST',
        body: payload
      });
      await fetchRegionals();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat regional baru.';
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
        method: 'POST',
        body: payload
      });
      await fetchRegionals();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui regional.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteRegional = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<any>>(`/regional/${id}/delete`, {
        method: 'POST'
      });
      await fetchRegionals();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus regional.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    regionals,
    currentRegional,
    regionalCombo,
    loading,
    detailLoading,
    error,
    fetchRegionals,
    fetchRegionalCombo,
    getRegionalById,
    createRegional,
    updateRegional,
    deleteRegional
  };
};
