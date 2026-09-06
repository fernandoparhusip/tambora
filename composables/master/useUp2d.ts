import { ref } from 'vue';
import { useApi } from '~/composables/useApi';
import type {
  Up2dItem,
  CreateUp2dRequest,
  UpdateUp2dRequest,
  ApiResponse,
  SelectOption
} from '~/types';

export const useUp2d = () => {
  const api = useApi();
  const up2ds = ref<Up2dItem[]>([]);
  const currentUp2d = ref<Up2dItem | null>(null);
  const up2dCombo = ref<SelectOption[]>([]);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchUp2ds = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<Up2dItem[]>>('/up2d');
      if (res?.data && Array.isArray(res.data)) {
        up2ds.value = res.data;
      } else {
        up2ds.value = [];
      }
      return up2ds.value;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar UP2D.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchUp2dCombo = async () => {
    try {
      const res = await api<ApiResponse<Array<{ id: string; name?: string; nama?: string; code?: string; kode?: string }>>>('/up2d/combo');
      if (res?.data && Array.isArray(res.data)) {
        up2dCombo.value = res.data.map(item => ({
          label: item.nama || item.name || item.kode || item.code || item.id,
          value: item.id
        }));
      }
      return up2dCombo.value;
    } catch {
      return [];
    }
  };

  const getUp2dById = async (id: string) => {
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<Up2dItem>>(`/up2d/${id}`);
      if (res?.data) {
        currentUp2d.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail UP2D.';
      throw err;
    } finally {
      detailLoading.value = false;
    }
  };

  const createUp2d = async (payload: CreateUp2dRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<Up2dItem>>('/up2d', {
        method: 'POST',
        body: payload
      });
      await fetchUp2ds();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat UP2D baru.';
      throw err;
    }
  };

  const updateUp2d = async (id: string, payload: UpdateUp2dRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<Up2dItem>>(`/up2d/${id}`, {
        method: 'POST',
        body: payload
      });
      await fetchUp2ds();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui UP2D.';
      throw err;
    }
  };

  const deleteUp2d = async (id: string) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<any>>(`/up2d/${id}/delete`, {
        method: 'POST'
      });
      await fetchUp2ds();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus UP2D.';
      throw err;
    }
  };

  return {
    up2ds,
    currentUp2d,
    up2dCombo,
    loading,
    detailLoading,
    error,
    fetchUp2ds,
    fetchUp2dCombo,
    getUp2dById,
    createUp2d,
    updateUp2d,
    deleteUp2d
  };
};
