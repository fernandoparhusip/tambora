import { ref, computed } from "vue";
import { useApi } from "~/composables/useApi";
import type {
  OrganizationItem,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  ApiResponse
} from "~/types";

export const useOrganization = () => {
  const api = useApi();
  const organizations = ref<OrganizationItem[]>([]);
  const currentOrganization = ref<OrganizationItem | null>(null);
  const loading = ref(false);
  const total = ref(0);
  const error = ref<string | null>(null);

  const fetchOrganizations = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0
      };
      const res = await api<ApiResponse<OrganizationItem[]>>("/organization", { query });
      if (res?.data && Array.isArray(res.data)) {
        organizations.value = res.data;
        total.value = res.meta?.total || res.data.length;
      } else {
        organizations.value = [];
        total.value = 0;
      }
      return organizations.value;
    } catch (err: any) {
      error.value = err?.message || "Gagal memuat daftar organisasi.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getOrganizationById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<OrganizationItem>>(`/organization/${id}`);
      if (res?.data) {
        currentOrganization.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengambil detail organisasi.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createOrganization = async (payload: CreateOrganizationRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<OrganizationItem>>("/organization", {
        method: "POST",
        body: payload
      });
      await fetchOrganizations();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal membuat organisasi.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateOrganization = async (id: string, payload: UpdateOrganizationRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<OrganizationItem>>(`/organization/${id}`, {
        method: "PUT",
        body: payload
      });
      await fetchOrganizations();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || "Gagal mengubah organisasi.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteOrganization = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<null>>(`/organization/${id}`, {
        method: "DELETE"
      });
      await fetchOrganizations();
      return res;
    } catch (err: any) {
      error.value = err?.message || "Gagal menghapus organisasi.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    organizations: computed(() => organizations.value),
    currentOrganization: computed(() => currentOrganization.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization
  };
};
