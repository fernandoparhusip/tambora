export type PlantStatus =
  | "operasi"
  | "gangguan"
  | "derating"
  | "pemeliharaan"
  | "standby"
  | "rusak_permanen";

export interface SentralItem {
  id: string;
  name: string;
  status: PlantStatus;
  dmn: number;
  dmp: number;
  beban: number;
  pomo: string;
  foder: string;
  lat: number;
  lng: number;
}

export interface StatusMeta {
  key: PlantStatus | "semua";
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
  haloBg: string;
  hexColor: string;
}

export const STATUS_META_MAP: Record<PlantStatus, StatusMeta> = {
  operasi: {
    key: "operasi",
    label: "Operasi",
    badgeBg: "bg-emerald-50/70",
    badgeBorder: "border-emerald-300",
    badgeText: "text-emerald-600",
    dotColor: "bg-emerald-500",
    haloBg: "bg-emerald-100",
    hexColor: "#10B981",
  },
  gangguan: {
    key: "gangguan",
    label: "Gangguan",
    badgeBg: "bg-rose-50/70",
    badgeBorder: "border-rose-300",
    badgeText: "text-rose-600",
    dotColor: "bg-rose-500",
    haloBg: "bg-rose-100",
    hexColor: "#EF4444",
  },
  derating: {
    key: "derating",
    label: "Derating",
    badgeBg: "bg-amber-50/70",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-600",
    dotColor: "bg-amber-500",
    haloBg: "bg-amber-100",
    hexColor: "#F59E0B",
  },
  pemeliharaan: {
    key: "pemeliharaan",
    label: "Pemeliharaan",
    badgeBg: "bg-sky-50/70",
    badgeBorder: "border-sky-300",
    badgeText: "text-sky-600",
    dotColor: "bg-sky-500",
    haloBg: "bg-sky-100",
    hexColor: "#0EA5E9",
  },
  standby: {
    key: "standby",
    label: "Standby",
    badgeBg: "bg-slate-50/70",
    badgeBorder: "border-slate-300",
    badgeText: "text-slate-600",
    dotColor: "bg-slate-500",
    haloBg: "bg-slate-200",
    hexColor: "#64748B",
  },
  rusak_permanen: {
    key: "rusak_permanen",
    label: "Rusak Permanen",
    badgeBg: "bg-purple-50/70",
    badgeBorder: "border-purple-300",
    badgeText: "text-purple-600",
    dotColor: "bg-purple-500",
    haloBg: "bg-purple-100",
    hexColor: "#8B5CF6",
  },
};

export function getStatusMeta(status: PlantStatus): StatusMeta {
  return STATUS_META_MAP[status] || STATUS_META_MAP.operasi;
}

export function filterSentralByStatus(
  list: SentralItem[],
  statusFilter: string
): SentralItem[] {
  if (!statusFilter || statusFilter === "semua") {
    return list;
  }
  return list.filter((item) => item.status === statusFilter);
}

export function calculateStatusCounts(list: SentralItem[]): Record<string, number> {
  const counts: Record<string, number> = {
    semua: list.length,
    operasi: 0,
    gangguan: 0,
    derating: 0,
    pemeliharaan: 0,
    standby: 0,
    rusak_permanen: 0,
  };

  for (const item of list) {
    const status = item.status;
    counts[status] = (counts[status] ?? 0) + 1;
  }

  return counts;
}
