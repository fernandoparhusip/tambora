import { describe, it, expect } from 'vitest';
import { getMenuSortNo, sortMenuItems, type BackendMenuRecord } from '~/utils/menuSort';

describe('menuSort utility', () => {
  const mockBackendMenus: BackendMenuRecord[] = [
    { code: 'MENU_ORGANISASI', name: 'Organisasi', route: '/master/organizations', sort_no: 21 },
    { code: 'MENU_SENTRAL', name: 'Sentral Pembangkit', route: '/master/sentral', sort_no: 25 },
    { code: 'MENU_SYSTEM', name: 'Sistem Pembangkit', route: '/master/systems', sort_no: 26 },
    { code: 'MENU_ASSET', name: 'Asset Mesin', route: '/master/assets', sort_no: 27 },
    { code: 'MENU_DRIVER', name: 'Pengemudi', route: '/master/drivers', sort_no: 28 },
    { code: 'MENU_MACHINE_CONDITION', name: 'Kondisi Mesin', route: '/master/kondisi-mesin', sort_no: 29 },
    { code: 'MENU_UIW_UID', name: 'UIW / UID', route: '/master/uiw-uid', sort_no: 33 },
    { code: 'MENU_UP2D', name: 'UP2D', route: '/master/up2d', sort_no: 34 },
    { code: 'MENU_USER', name: 'Manajemen Pengguna', route: '/settings/users', sort_no: 51 },
    { code: 'MENU_ROLE', name: 'Akses Grup (Role)', route: '/settings/roles', sort_no: 52 },
    { code: 'MENU_SCOPE', name: 'Akses Level (Scope)', route: '/settings/scopes', sort_no: 53 },
    { code: 'MENU_OPERASI_HARIAN', name: 'Operasi Harian', route: '/operasional/operasi-harian', sort_no: 11 },
    { code: 'MENU_PEMAKAIAN_BAHAN_BAKAR', name: 'Pemakaian Bahan Bakar', route: '/operasional/pemakaian-bahan-bakar', sort_no: 12 },
    { code: 'MENU_PEMBEBANAN', name: 'Pembebanan', route: '/operasional/pembebanan', sort_no: 13 },
    { code: 'MENU_PAGU', name: 'Pagu Anggaran', route: '/pagu', sort_no: 41 },
    { code: 'MENU_PROGNOSA', name: 'Prognosa', route: '/prognosa', sort_no: 43 },
    { code: 'MENU_NKO', name: 'NKO', route: '/nko', sort_no: 44 },
  ];

  describe('getMenuSortNo', () => {
    it('returns 999 when backendMenus is empty or undefined', () => {
      expect(getMenuSortNo({ menuCode: 'MENU_SENTRAL' }, [])).toBe(999);
      expect(getMenuSortNo({ menuCode: 'MENU_SENTRAL' }, null as any)).toBe(999);
    });

    it('returns exact sort_no for direct menuCode match', () => {
      expect(getMenuSortNo({ menuCode: 'MENU_SENTRAL' }, mockBackendMenus)).toBe(25);
      expect(getMenuSortNo({ menuCode: 'MENU_SYSTEM' }, mockBackendMenus)).toBe(26);
    });

    it('resolves alias codes such as plural to singular or Indonesian mapping', () => {
      expect(getMenuSortNo({ menuCode: 'MENU_USERS' }, mockBackendMenus)).toBe(51);
      expect(getMenuSortNo({ menuCode: 'MENU_ROLES' }, mockBackendMenus)).toBe(52);
      expect(getMenuSortNo({ menuCode: 'MENU_SCOPES' }, mockBackendMenus)).toBe(53);
      expect(getMenuSortNo({ menuCode: 'MENU_ORGANIZATION' }, mockBackendMenus)).toBe(21);
      expect(getMenuSortNo({ menuCode: 'MENU_PEMAKAIAN_BB' }, mockBackendMenus)).toBe(12);
      expect(getMenuSortNo({ menuCode: 'MENU_PROGNOSA_PLTU' }, mockBackendMenus)).toBe(43);
      expect(getMenuSortNo({ menuCode: 'MENU_PERHITUNGAN_NKO' }, mockBackendMenus)).toBe(44);
    });

    it('falls back to route slug match if menuCode not found or not provided', () => {
      expect(getMenuSortNo({ path: '/home/master/sentral' }, mockBackendMenus)).toBe(25);
      expect(getMenuSortNo({ path: '/home/master/organizations' }, mockBackendMenus)).toBe(21);
      expect(getMenuSortNo({ path: '/unknown/route' }, mockBackendMenus)).toBe(999);
    });
  });

  describe('sortMenuItems', () => {
    it('returns empty array or original copy when items or backendMenus are empty', () => {
      expect(sortMenuItems([], mockBackendMenus)).toEqual([]);
      const original = [{ menuCode: 'MENU_A' }];
      expect(sortMenuItems(original, [])).toEqual(original);
    });

    it('sorts menu items ascending based on backend sort_no', () => {
      const items = [
        { label: 'UIW / UID', menuCode: 'MENU_UIW_UID', path: '/home/master/uiw-uid' },
        { label: 'Sentral', menuCode: 'MENU_SENTRAL', path: '/home/master/sentral' },
        { label: 'Organisasi', menuCode: 'MENU_ORGANIZATION', path: '/home/master/organization' },
        { label: 'Asset Mesin', menuCode: 'MENU_ASSET', path: '/home/master/asset' },
      ];

      const sorted = sortMenuItems(items, mockBackendMenus);
      expect(sorted.map(s => s.label)).toEqual([
        'Organisasi',  // 21
        'Sentral',     // 25
        'Asset Mesin', // 27
        'UIW / UID',   // 33
      ]);
    });

    it('places items with unknown sort_no at the end preserving their relative order', () => {
      const items = [
        { label: 'Custom Unknown', menuCode: 'MENU_CUSTOM' },
        { label: 'Sentral', menuCode: 'MENU_SENTRAL' },
      ];

      const sorted = sortMenuItems(items, mockBackendMenus);
      expect(sorted.map(s => s.label)).toEqual([
        'Sentral',
        'Custom Unknown',
      ]);
    });
  });
});
