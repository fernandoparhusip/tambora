import { ref } from 'vue';
import { useApi } from '~/composables/useApi';
import type {
  MenuItem,
  CreateMenuRequest,
  UpdateMenuRequest,
  ApiResponse,
  SelectOption
} from '~/types';

export const useMenu = () => {
  const api = useApi();
  const menus = ref<MenuItem[]>([]);
  const currentMenu = ref<MenuItem | null>(null);
  const parentMenuOptions = ref<SelectOption[]>([]);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchMenus = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<MenuItem[]>>('/menu');
      if (res?.data && Array.isArray(res.data)) {
        menus.value = res.data;
        parentMenuOptions.value = res.data.map(item => ({
          label: item.nama || (item as any).name,
          value: item.id,
          route: (item as any).route || item.url || ""
        }));
      } else {
        menus.value = [];
        parentMenuOptions.value = [];
      }
      return menus.value;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar menu navigasi.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getMenuById = async (id: string) => {
    detailLoading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<MenuItem>>(`/menu/${id}`);
      if (res?.data) {
        currentMenu.value = res.data;
      }
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail menu.';
      throw err;
    } finally {
      detailLoading.value = false;
    }
  };

  const createMenu = async (payload: CreateMenuRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<MenuItem>>('/menu', {
        method: 'POST',
        body: payload
      });
      await fetchMenus();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat menu baru.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateMenu = async (id: string, payload: UpdateMenuRequest) => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api<ApiResponse<MenuItem>>(`/menu/${id}`, {
        method: 'POST',
        body: payload
      });
      await fetchMenus();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui menu.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteMenu = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      let res;
      try {
        res = await api<ApiResponse<any>>(`/menu/${id}`, {
          method: 'DELETE'
        });
      } catch {
        res = await api<ApiResponse<any>>(`/menu/${id}/delete`, {
          method: 'POST'
        });
      }
      await fetchMenus();
      return res?.data;
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus menu.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    menus,
    currentMenu,
    parentMenuOptions,
    loading,
    detailLoading,
    error,
    fetchMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu
  };
};
