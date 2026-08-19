import { describe, it, expect } from "vitest";
import {
  getStatusMeta,
  filterSentralByStatus,
  calculateStatusCounts,
  type SentralItem,
} from "../../utils/operasiPembangkitUtils";

describe("operasiPembangkitUtils", () => {
  const dummySentrals: SentralItem[] = [
    {
      id: "1",
      name: "PLTU Sumbawa",
      status: "operasi",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.49,
      lng: 117.43,
    },
    {
      id: "2",
      name: "PLTMG Sumbawa",
      status: "gangguan",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.51,
      lng: 117.41,
    },
    {
      id: "3",
      name: "PLTD SW Woha",
      status: "standby",
      dmn: 10,
      dmp: 4,
      beban: 5,
      pomo: "PO",
      foder: "-",
      lat: -8.58,
      lng: 118.72,
    },
  ];

  it("getStatusMeta returns correct metadata for status", () => {
    const meta = getStatusMeta("gangguan");
    expect(meta.label).toBe("Gangguan");
    expect(meta.hexColor).toBe("#EF4444");
  });

  it("filterSentralByStatus filters items accurately", () => {
    const filtered = filterSentralByStatus(dummySentrals, "gangguan");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("PLTMG Sumbawa");

    const all = filterSentralByStatus(dummySentrals, "semua");
    expect(all).toHaveLength(3);
  });

  it("calculateStatusCounts counts status occurrences accurately", () => {
    const counts = calculateStatusCounts(dummySentrals);
    expect(counts.semua).toBe(3);
    expect(counts.operasi).toBe(1);
    expect(counts.gangguan).toBe(1);
    expect(counts.standby).toBe(1);
    expect(counts.derating).toBe(0);
  });
});
