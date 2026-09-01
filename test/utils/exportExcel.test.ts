import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToExcel } from "~/utils/exportExcel";
import type { TableColumn } from "~/types";

describe("exportExcel utility", () => {
  let clickMock: any;
  let appendChildMock: any;
  let removeChildMock: any;

  beforeEach(() => {
    clickMock = vi.fn();
    appendChildMock = vi.fn();
    removeChildMock = vi.fn();

    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    });

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
  });

  it("should format and trigger download correctly for rows and columns", () => {
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

  it("should handle empty data rows gracefully", () => {
    const cols: TableColumn[] = [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
    ];

    exportToExcel(cols, [], { fileName: "Empty_Export" });

    expect(clickMock).toHaveBeenCalled();
    expect(appendChildMock).toHaveBeenCalled();
  });

  it("should exclude action columns from export", () => {
    const cols: TableColumn[] = [
      { key: "id", label: "ID" },
      { key: "actions", label: "Aksi" },
      { key: "action", label: "Action" },
    ];

    const data = [{ id: 1, actions: "edit", action: "delete" }];

    exportToExcel(cols, data);

    expect(clickMock).toHaveBeenCalled();
  });

  it("should format null and undefined values as empty string", () => {
    const cols: TableColumn[] = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
    ];

    const data = [{ name: null, email: undefined }];

    exportToExcel(cols, data, { fileName: "Null_Values" });

    expect(clickMock).toHaveBeenCalled();
  });

  it("should use fallback default filename when options is omitted", () => {
    const cols: TableColumn[] = [{ key: "title", label: "Title" }];
    const data = [{ title: "Report" }];

    exportToExcel(cols, data);

    expect(clickMock).toHaveBeenCalled();
  });
});
