export interface BackendMenuRecord {
  id?: string;
  parent_id?: string;
  code?: string;
  name?: string;
  route?: string;
  icon?: string;
  sort_no?: number;
  [key: string]: any;
}

const MENU_CODE_ALIASES: Record<string, string[]> = {
  MENU_USER: ['MENU_USERS'],
  MENU_USERS: ['MENU_USER'],
  MENU_ROLE: ['MENU_ROLES'],
  MENU_ROLES: ['MENU_ROLE'],
  MENU_SCOPE: ['MENU_SCOPES'],
  MENU_SCOPES: ['MENU_SCOPE'],
  MENU_PERMISSION: ['MENU_PERMISSIONS'],
  MENU_PERMISSIONS: ['MENU_PERMISSION'],
  MENU_MENU: ['MENU_AUTH_ACCESS'],
  MENU_AUTH_ACCESS: ['MENU_MENU'],
  MENU_ORGANISASI: ['MENU_ORGANIZATION'],
  MENU_ORGANIZATION: ['MENU_ORGANISASI'],
  MENU_PEMAKAIAN_BAHAN_BAKAR: ['MENU_PEMAKAIAN_BB'],
  MENU_PEMAKAIAN_BB: ['MENU_PEMAKAIAN_BAHAN_BAKAR'],
  MENU_PROGNOSA: ['MENU_PROGNOSA_PLTU'],
  MENU_PROGNOSA_PLTU: ['MENU_PROGNOSA'],
  MENU_NKO: ['MENU_PERHITUNGAN_NKO'],
  MENU_PERHITUNGAN_NKO: ['MENU_NKO'],
};

/**
 * Resolves the numeric sort_no for a menu item given the backend menus array.
 * Falls back to 999 if no matching backend menu record is found.
 */
export function getMenuSortNo(
  item: { menuCode?: string; path?: string; permission?: string },
  backendMenus: BackendMenuRecord[]
): number {
  if (!backendMenus || backendMenus.length === 0) return 999;

  // 1. Direct code or alias match
  if (item.menuCode) {
    const targetCode = item.menuCode.toUpperCase();
    const aliases = MENU_CODE_ALIASES[targetCode] || [];
    const validCodes = [targetCode, ...aliases];

    const foundByCode = backendMenus.find((m) => {
      const bCode = String(m.code || '').toUpperCase();
      return validCodes.includes(bCode);
    });

    if (foundByCode && typeof foundByCode.sort_no === 'number') {
      return foundByCode.sort_no;
    }
  }

  // 2. Route slug match (e.g. "/home/master/sentral" vs "/master/sentral")
  if (item.path) {
    const cleanPath = item.path.toLowerCase().replace(/^\/home/, '').replace(/\/$/, '');
    const pathSlug = cleanPath.split('/').filter(Boolean).pop();

    const foundByRoute = backendMenus.find((m) => {
      if (!m.route) return false;
      const bRoute = m.route.toLowerCase().replace(/\/$/, '');
      const bSlug = bRoute.split('/').filter(Boolean).pop();
      return cleanPath === bRoute || (pathSlug && pathSlug === bSlug);
    });

    if (foundByRoute && typeof foundByRoute.sort_no === 'number') {
      return foundByRoute.sort_no;
    }
  }

  return 999;
}

/**
 * Returns a sorted copy of menu items based on backend sort_no.
 * Preserves original relative order for items with equal sort_no.
 */
export function sortMenuItems<T extends { menuCode?: string; path?: string; permission?: string }>(
  items: T[],
  backendMenus: BackendMenuRecord[]
): T[] {
  if (!backendMenus || backendMenus.length === 0 || !items || items.length === 0) {
    return items ? [...items] : [];
  }

  return [...items].sort((a, b) => {
    const sortA = getMenuSortNo(a, backendMenus);
    const sortB = getMenuSortNo(b, backendMenus);
    return sortA - sortB;
  });
}
