import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToExcel } from "~/utils/exportExcel";
import type { TableColumn } from "~/types";

describe("exportExcel utility", () => {
  beforeEach(() => {
    // Mock DOM download elements
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("should format and trigger download correctly for rows and columns", () => {
    const clickMock = vi.fn();
    const appendChildMock = vi.fn();
    const removeChildMock = vi.fn();

    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") {
        return {
          setAttribute: vi.fn(),
          click: clickMock,
        } as any;
      }
      return {} as any;
    });

    vi.spyOn(document.body, "appendChild").mockImplementation(appendChildMock);
    vi.spyOn(document.body, "removeChild").mockImplementation(removeChildMock);

    const cols: TableColumn[] = [
      { key: "no", label: "No" },
      { key: "nama", label: "Nama User" },
      { key: "role", label: "Role" },
      { key: "actions", label: "Aksi" },
    ];

    const data = [
      { no: 1, nama: "Budi Santoso", role: "ADMIN" },
      { no: 2, nama: "Siti Rahma", role: "OPERATOR" },
    ];

    exportToExcel(cols, data, { fileName: "Data_User" });

    expect(clickMock).toHaveBeenCalled();
    expect(appendChildMock).toHaveBeenCalled();
  });
});
