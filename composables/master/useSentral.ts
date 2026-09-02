import { ref } from 'vue';
import { useApi } from '~/composables/useApi';
import type {
  SentralItem,
  CreateSentralRequest,
  UpdateSentralRequest,
  ApiResponse
} from '~/types';

export const useSentral = () => {
  const api = useApi();
  const sentrals = ref<SentralItem[]>([]);
  const currentSentral = ref<SentralItem | null>(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchSentrals = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem[]>>('/sentral');
      if (res?.data && Array.isArray(res.data)) {
        sentrals.value = res.data;
      } else {
        sentrals.value = [];
      }
      return sentrals.value;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar sentral pembangkit.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSentralById = async (id: string) => {
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem>>(`/sentral/${id}`);
      if (res?.data) {
        currentSentral.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail sentral pembangkit.';
      throw err;
    } finally {
      detailLoading.value = false;
    }
  };

  const createSentral = async (payload: CreateSentralRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem>>('/sentral', {
        method: 'POST',
        body: payload
      });
      await fetchSentrals();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat sentral pembangkit baru.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSentral = async (id: string, payload: UpdateSentralRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SentralItem>>(`/sentral/${id}`, {
        method: 'POST',
        body: payload
      });
      await fetchSentrals();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui sentral pembangkit.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSentral = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<any>>(`/sentral/${id}/delete`, {
        method: 'POST'
      });
      await fetchSentrals();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus sentral pembangkit.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    sentrals,
    currentSentral,
    loading,
    detailLoading,
    error,
    fetchSentrals,
    getSentralById,
    createSentral,
    updateSentral,
    deleteSentral
  };
};
