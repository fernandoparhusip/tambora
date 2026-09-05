import { useApi } from '~/composables/useApi';
import { ref, computed } from "vue";
import { extractApiErrorMessage } from "~/utils/apiError";
import type {
  SystemItem,
  CreateSystemRequest,
  UpdateSystemRequest,
  ApiResponse
} from "~/types";

export const useSystem = () => {
  const api = useApi();
  const systems = ref<SystemItem[]>([]);
  const currentSystem = ref<SystemItem | null>(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const total = ref(0);
  const error = ref<string | null>(null);

  const fetchSystems = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0
      };
      const res = await api<ApiResponse<SystemItem[]>>("/systems", { query });
      if (res?.data && Array.isArray(res.data)) {
        systems.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        systems.value = [];
        total.value = 0;
      }
      return systems.value;
    } catch (err: any) {
      error.value = extractApiErrorMessage(err, "Gagal memuat daftar sistem pembangkit.");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSystemById = async (id: string) => {
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<any>(`/systems/${id}`);
      const data = res?.data || res;
      if (data) {
        currentSystem.value = data;
      }
      return data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Gagal mengambil detail sistem.");
      error.value = msg;
      const customErr = new Error(msg);
      (customErr as any).data = err?.data;
      (customErr as any).response = err?.response;
      throw customErr;
    } finally {
      detailLoading.value = false;
    }
  };

  const createSystem = async (payload: CreateSystemRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<SystemItem>>("/systems", {
        method: "POST",
        body: payload
      });
      await fetchSystems();
      return res?.data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Gagal membuat sistem pembangkit.");
      error.value = msg;
      const customErr = new Error(msg);
      (customErr as any).data = err?.data;
      (customErr as any).response = err?.response;
      throw customErr;
    }
  };

  const updateSystem = async (id: string, payload: UpdateSystemRequest) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<SystemItem>>(`/systems/${id}`, {
        method: "POST",
        body: payload
      });
      await fetchSystems();
      return res?.data;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Gagal mengubah sistem pembangkit.");
      error.value = msg;
      const customErr = new Error(msg);
      (customErr as any).data = err?.data;
      (customErr as any).response = err?.response;
      throw customErr;
    }
  };

  const deleteSystem = async (id: string) => {
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/systems/${id}/delete`, {
        method: "POST"
      });
      await fetchSystems();
      return res;
    } catch (err: any) {
      const msg = extractApiErrorMessage(err, "Gagal menghapus sistem pembangkit.");
      error.value = msg;
      const customErr = new Error(msg);
      (customErr as any).data = err?.data;
      (customErr as any).response = err?.response;
      throw customErr;
    }
  };

  return {
    systems: computed(() => systems.value),
    currentSystem: computed(() => currentSystem.value),
    loading: computed(() => loading.value),
    detailLoading: computed(() => detailLoading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchSystems,
    getSystemById,
    createSystem,
    updateSystem,
    deleteSystem
  };
};
