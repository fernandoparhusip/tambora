import { ref } from 'vue';
import { useApi } from '~/composables/useApi';
import type {
  UiwUidItem,
  CreateUiwUidRequest,
  UpdateUiwUidRequest,
  ApiResponse,
  SelectOption
} from '~/types';

export const useUiwUid = () => {
  const api = useApi();
  const uiwUids = ref<UiwUidItem[]>([]);
  const currentUiwUid = ref<UiwUidItem | null>(null);
  const uiwUidCombo = ref<SelectOption[]>([]);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchUiwUids = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UiwUidItem[]>>('/uiw-uid');
      if (res?.data && Array.isArray(res.data)) {
        uiwUids.value = res.data;
      } else {
        uiwUids.value = [];
      }
      return uiwUids.value;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar UIW / UID.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchUiwUidCombo = async () => {
    try {
      const res = await api<ApiResponse<Array<{ id: string; name?: string; nama?: string; code?: string; kode?: string }>>>('/uiw-uid/combo');
      if (res?.data && Array.isArray(res.data)) {
        uiwUidCombo.value = res.data.map(item => ({
          label: item.nama || item.name || item.kode || item.code || item.id,
          value: item.id
        }));
      }
      return uiwUidCombo.value;
    } catch {
      return [];
    }
  };

  const getUiwUidById = async (id: string) => {
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UiwUidItem>>(`/uiw-uid/${id}`);
      if (res?.data) {
        currentUiwUid.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail UIW / UID.';
      throw err;
    } finally {
      detailLoading.value = false;
    }
  };

  const createUiwUid = async (payload: CreateUiwUidRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UiwUidItem>>('/uiw-uid', {
        method: 'POST',
        body: payload
      });
      await fetchUiwUids();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat UIW / UID baru.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateUiwUid = async (id: string, payload: UpdateUiwUidRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<UiwUidItem>>(`/uiw-uid/${id}`, {
        method: 'POST',
        body: payload
      });
      await fetchUiwUids();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui UIW / UID.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteUiwUid = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<any>>(`/uiw-uid/${id}/delete`, {
        method: 'POST'
      });
      await fetchUiwUids();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus UIW / UID.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    uiwUids,
    currentUiwUid,
    uiwUidCombo,
    loading,
    detailLoading,
    error,
    fetchUiwUids,
    fetchUiwUidCombo,
    getUiwUidById,
    createUiwUid,
    updateUiwUid,
    deleteUiwUid
  };
};
