import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMenu } from '~/composables/konfigurasi-aplikasi/useMenu';

const mockApi = vi.fn();
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi,
}));

describe('useMenu Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchMenus loads data and maps parent options', async () => {
    mockApi.mockResolvedValueOnce({
      data: [{ id: 'menu-1', nama: 'Dashboard', url: '/dashboard', order: 1, status: 1 }]
    });

    const { fetchMenus, menus, parentMenuOptions } = useMenu();
    await fetchMenus();

    expect(mockApi).toHaveBeenCalledWith('/menu');
    expect(menus.value).toHaveLength(1);
    expect(parentMenuOptions.value[0]?.label).toBe('Dashboard');
  });

  it('CRUD operations call correct endpoints', async () => {
    mockApi
      .mockResolvedValueOnce({ data: { id: 'menu-1' } }) // create
      .mockResolvedValueOnce({ data: [] }) // refetch
      .mockResolvedValueOnce({ data: { id: 'menu-1', nama: 'Dashboard' } }) // get
      .mockResolvedValueOnce({ data: { id: 'menu-1' } }) // update
      .mockResolvedValueOnce({ data: [] }) // refetch
      .mockResolvedValueOnce({ data: null }) // delete
      .mockResolvedValueOnce({ data: [] }); // refetch

    const { createMenu, getMenuById, updateMenu, deleteMenu } = useMenu();

    await createMenu({ nama: 'Dashboard', order: 1, status: 1 });
    expect(mockApi).toHaveBeenCalledWith('/menu', {
      method: 'POST',
      body: { nama: 'Dashboard', order: 1, status: 1 }
    });

    const detail = await getMenuById('menu-1');
    expect(detail?.nama).toBe('Dashboard');

    await updateMenu('menu-1', { nama: 'Dashboard Updated' });
    expect(mockApi).toHaveBeenCalledWith('/menu/menu-1', {
      method: 'POST',
      body: { nama: 'Dashboard Updated' }
    });

    await deleteMenu('menu-1');
    expect(mockApi).toHaveBeenCalledWith('/menu/menu-1', { method: 'DELETE' });
  });
});
