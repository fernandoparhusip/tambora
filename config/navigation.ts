export interface LeafMenuItem {
  label: string;
  pageTitle?: string;
  path: string;
  permission?: string;
  menuCode?: string;
}

export interface SubMenuItem {
  key: string;
  label: string;
  pageTitle?: string;
  path?: string;
  permission?: string;
  menuCode?: string;
  children?: LeafMenuItem[];
}

export interface MenuItem {
  key: string;
  label: string;
  pageTitle?: string;
  path?: string;
  permission?: string;
  menuCode?: string;
  children?: SubMenuItem[];
}

// Internal helper — reduces each menu entry from ~8 lines to 1
function nav(
  key: string,
  label: string,
  path: string,
  permission?: string,
  menuCode?: string,
  pageTitle?: string,
): SubMenuItem {
  return { key, label, pageTitle: pageTitle ?? label, path, permission, menuCode };
}

// Master section items always follow "Master <label>" page title convention
function masterNav(
  key: string,
  label: string,
  path: string,
  permission: string,
  menuCode: string,
): SubMenuItem {
  return nav(key, label, path, permission, menuCode, `Master ${label}`);
}

export const menuItems: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    children: [
      nav("operasi-pembangkit", "Operasi Pembangkit", "/home/dashboard/operasiPembangkit", undefined, undefined, "Operasi Pembangkit Sistem Tambora"),
    ],
  },
  {
    key: "konfigurasi-aplikasi",
    label: "Konfigurasi Aplikasi",
    children: [
      nav("akses-level",    "Master Akses Level", "/home/konfigurasi-aplikasi/akses-level", "SCOPE.VIEW", "MENU_SCOPES"),
      nav("akses-grup",     "Master Akses Grup",  "/home/konfigurasi-aplikasi/akses-grup",  "ROLE.VIEW",  "MENU_ROLES"),
      nav("menu-manajemen", "Master Menu",         "/home/konfigurasi-aplikasi/menu",         "MENU.VIEW",  "MENU_AUTH_ACCESS"),
    ],
  },
  {
    key: "master",
    label: "Master",
    children: [
      masterNav("pengguna",          "Pengguna",       "/home/master/user",               "USER.VIEW",              "MENU_USERS"),
      masterNav("permission",        "Permission",     "/home/master/permission",         "PERMISSION.VIEW",        "MENU_PERMISSIONS"),
      masterNav("uiw-uid",           "UIW / UID",      "/home/master/uiw-uid",            "UIW_UID.VIEW",           "MENU_UIW_UID"),
      masterNav("up2d",              "UP2D",           "/home/master/up2d",               "UP2D.VIEW",              "MENU_UP2D"),
      masterNav("sentral",           "Sentral",        "/home/master/sentral",            "SENTRAL.VIEW",           "MENU_SENTRAL"),
      masterNav("system",            "Sistem",         "/home/master/system",             "SYSTEM.VIEW",            "MENU_SYSTEM"),
      masterNav("asset",             "Asset Mesin",    "/home/master/asset",              "ASSET.VIEW",             "MENU_ASSET"),
      masterNav("machine-condition", "Kondisi Mesin",  "/home/master/machine-condition",  "MACHINE_CONDITION.VIEW", "MENU_MACHINE_CONDITION"),
      masterNav("pengemudi",         "Pengemudi",      "/home/master/driver",             "DRIVER.VIEW",            "MENU_DRIVER"),
      masterNav("organization",      "Organisasi",     "/home/master/organization",       "ORGANIZATION.VIEW",      "MENU_ORGANIZATION"),
    ],
  },
  {
    key: "transaksi",
    label: "Transaksi",
    children: [
      nav("operasi-harian", "Operasi Harian", "/home/transaksi/operasi-harian", "OPERASI_HARIAN.VIEW", "MENU_OPERASI_HARIAN", "Operasi Harian Pembangkit"),
    ],
  },
];
