import { ref } from 'vue';
import { useApi } from '~/composables/useApi';
import type {
  UikItem,
  CreateUikRequest,
  UpdateUikRequest,
  ApiResponse,
  SelectOption
} from '~/types';

export const useUik = () => {
  const api = useApi();
  const uiks = ref<UikItem[]>([]);
  const currentUik = ref<UikItem | null>(null);
  const uikCombo = ref<SelectOption[]>([]);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchUiks = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UikItem[]>>('/uik');
      if (res?.data && Array.isArray(res.data)) {
        uiks.value = res.data;
        uikCombo.value = res.data.map(item => ({
          label: item.nama ? `${item.kode} - ${item.nama}` : item.kode,
          value: item.id
        }));
      } else {
        uiks.value = [];
        uikCombo.value = [];
      }
      return uiks.value;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar UIK.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getUikById = async (id: string) => {
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UikItem>>(`/uik/${id}`);
      if (res?.data) {
        currentUik.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail UIK.';
      throw err;
    } finally {
      detailLoading.value = false;
    }
  };

  const createUik = async (payload: CreateUikRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<UikItem>>('/uik', {
        method: 'POST',
        body: payload
      });
      await fetchUiks();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat UIK baru.';
      throw err;
    }
  };

  const updateUik = async (id: string, payload: UpdateUikRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<UikItem>>(`/uik/${id}`, {
        method: 'POST',
        body: payload
      });
      await fetchUiks();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui UIK.';
      throw err;
    }
  };

  const deleteUik = async (id: string) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<any>>(`/uik/${id}/delete`, {
        method: 'POST'
      });
      await fetchUiks();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus UIK.';
      throw err;
    }
  };

  return {
    uiks,
    currentUik,
    uikCombo,
    loading,
    detailLoading,
    error,
    fetchUiks,
    getUikById,
    createUik,
    updateUik,
    deleteUik
  };
};
