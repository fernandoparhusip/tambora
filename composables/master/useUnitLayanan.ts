import { ref } from 'vue';
import { useApi } from '~/composables/useApi';
import type {
  UnitLayananItem,
  CreateUnitLayananRequest,
  UpdateUnitLayananRequest,
  ApiResponse,
  SelectOption
} from '~/types';

export const useUnitLayanan = () => {
  const api = useApi();
  const unitLayanans = ref<UnitLayananItem[]>([]);
  const currentUnitLayanan = ref<UnitLayananItem | null>(null);
  const unitLayananCombo = ref<SelectOption[]>([]);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchUnitLayanans = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UnitLayananItem[]>>('/unit-layanan');
      if (res?.data && Array.isArray(res.data)) {
        unitLayanans.value = res.data;
        unitLayananCombo.value = res.data.map(item => ({
          label: item.nama ? `${item.kode} - ${item.nama}` : item.kode,
          value: item.id
        }));
      } else {
        unitLayanans.value = [];
        unitLayananCombo.value = [];
      }
      return unitLayanans.value;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar unit layanan.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getUnitLayananById = async (id: string) => {
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UnitLayananItem>>(`/unit-layanan/${id}`);
      if (res?.data) {
        currentUnitLayanan.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail unit layanan.';
      throw err;
    } finally {
      detailLoading.value = false;
    }
  };

  const createUnitLayanan = async (payload: CreateUnitLayananRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UnitLayananItem>>('/unit-layanan', {
        method: 'POST',
        body: payload
      });
      await fetchUnitLayanans();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat unit layanan baru.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUnitLayanan = async (id: string, payload: UpdateUnitLayananRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UnitLayananItem>>(`/unit-layanan/${id}`, {
        method: 'POST',
        body: payload
      });
      await fetchUnitLayanans();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui unit layanan.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUnitLayanan = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<any>>(`/unit-layanan/${id}/delete`, {
        method: 'POST'
      });
      await fetchUnitLayanans();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus unit layanan.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    unitLayanans,
    currentUnitLayanan,
    unitLayananCombo,
    loading,
    detailLoading,
    error,
    fetchUnitLayanans,
    getUnitLayananById,
    createUnitLayanan,
    updateUnitLayanan,
    deleteUnitLayanan
  };
};
