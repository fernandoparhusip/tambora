import { useApi } from '~/composables/useApi';
import { ref, computed } from "vue";
import type {
  MachineConditionItem,
  CreateMachineConditionRequest,
  UpdateMachineConditionRequest,
  ApiResponse
} from "~/types";

export const useMachineCondition = () => {
  const api = useApi();
  const machineConditions = ref<MachineConditionItem[]>([]);
  const currentCondition = ref<MachineConditionItem | null>(null);
  const loading = ref(false);
  const total = ref(0);
  const error = ref<string | null>(null);

  const fetchMachineConditions = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0
      };
      const res = await api<ApiResponse<MachineConditionItem[]>>("/machine-conditions", { query });
      if (res?.data && Array.isArray(res.data)) {
        machineConditions.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        machineConditions.value = [];
        total.value = 0;
      }
      return machineConditions.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat kondisi mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getMachineConditionById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<MachineConditionItem>>(`/machine-conditions/${id}`);
      if (res?.data) {
        currentCondition.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail kondisi mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createMachineCondition = async (payload: CreateMachineConditionRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<MachineConditionItem>>("/machine-conditions", {
        method: "POST",
        body: payload
      });
      await fetchMachineConditions();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat kondisi mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateMachineCondition = async (id: string, payload: UpdateMachineConditionRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<MachineConditionItem>>(`/machine-conditions/${id}`, {
        method: "POST",
        body: payload
      });
      await fetchMachineConditions();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengubah kondisi mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteMachineCondition = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/machine-conditions/${id}/delete`, {
        method: "POST"
      });
      await fetchMachineConditions();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus kondisi mesin.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    machineConditions: computed(() => machineConditions.value),
    currentCondition: computed(() => currentCondition.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchMachineConditions,
    getMachineConditionById,
    createMachineCondition,
    updateMachineCondition,
    deleteMachineCondition
  };
};
