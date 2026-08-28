import { useApi } from '~/composables/useApi';
import { ref, computed } from "vue";
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
      error.value = err?.message || "Gagal memuat daftar sistem pembangkit.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSystemById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SystemItem>>(`/systems/${id}`);
      if (res?.data) {
        currentSystem.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail sistem.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSystem = async (payload: CreateSystemRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SystemItem>>("/systems", {
        method: "POST",
        body: payload
      });
      await fetchSystems();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat sistem pembangkit.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSystem = async (id: string, payload: UpdateSystemRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<SystemItem>>(`/systems/${id}`, {
        method: "POST",
        body: payload
      });
      await fetchSystems();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengubah sistem pembangkit.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSystem = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/systems/${id}/delete`, {
        method: "POST"
      });
      await fetchSystems();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus sistem pembangkit.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    systems: computed(() => systems.value),
    currentSystem: computed(() => currentSystem.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchSystems,
    getSystemById,
    createSystem,
    updateSystem,
    deleteSystem
  };
};
