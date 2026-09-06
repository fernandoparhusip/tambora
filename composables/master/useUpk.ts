import { ref } from 'vue';
import { useApi } from '~/composables/useApi';
import type {
  UpkItem,
  CreateUpkRequest,
  UpdateUpkRequest,
  ApiResponse,
  SelectOption
} from '~/types';

export const useUpk = () => {
  const api = useApi();
  const upks = ref<UpkItem[]>([]);
  const currentUpk = ref<UpkItem | null>(null);
  const upkCombo = ref<SelectOption[]>([]);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchUpks = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UpkItem[]>>('/upk');
      if (res?.data && Array.isArray(res.data)) {
        upks.value = res.data;
        upkCombo.value = res.data.map(item => ({
          label: item.nama ? `${item.kode} - ${item.nama}` : item.kode,
          value: item.id
        }));
      } else {
        upks.value = [];
        upkCombo.value = [];
      }
      return upks.value;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar UPK.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getUpkById = async (id: string) => {
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UpkItem>>(`/upk/${id}`);
      if (res?.data) {
        currentUpk.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail UPK.';
      throw err;
    } finally {
      detailLoading.value = false;
    }
  };

  const createUpk = async (payload: CreateUpkRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<UpkItem>>('/upk', {
        method: 'POST',
        body: payload
      });
      await fetchUpks();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat UPK baru.';
      throw err;
    }
  };

  const updateUpk = async (id: string, payload: UpdateUpkRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<UpkItem>>(`/upk/${id}`, {
        method: 'POST',
        body: payload
      });
      await fetchUpks();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui UPK.';
      throw err;
    }
  };

  const deleteUpk = async (id: string) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<any>>(`/upk/${id}/delete`, {
        method: 'POST'
      });
      await fetchUpks();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus UPK.';
      throw err;
    }
  };

  return {
    upks,
    currentUpk,
    upkCombo,
    loading,
    detailLoading,
    error,
    fetchUpks,
    getUpkById,
    createUpk,
    updateUpk,
    deleteUpk
  };
};
