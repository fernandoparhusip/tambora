import type { TableColumn } from "~/types";

export interface ExportExcelOptions {
  fileName?: string;
  excludeKeys?: string[];
}

/**
 * Generates and downloads a clean CSV/Excel compatible file with UTF-8 BOM.
 */
export function exportToExcel(
  columns: TableColumn[],
  rows: any[],
  options: ExportExcelOptions = {}
): void {
  const fileName =
    options.fileName || `Export_Data_${new Date().toISOString().slice(0, 10)}.csv`;
  const excludeKeys = options.excludeKeys || ["actions", "no"];

  // Filter exportable columns
  const exportCols = columns.filter(
    (col) => !excludeKeys.includes(col.key) && col.key !== "actions"
  );

  if (exportCols.length === 0) return;

  // Header row
  const header = exportCols
    .map((c) => `"${(c.label || c.key).replace(/"/g, '""')}"`)
    .join(",");

  // Data rows
  const lines = rows.map((row) => {
    return exportCols
      .map((col) => {
        let val = row[col.key];
        if (val === undefined || val === null) {
          val = "";
        } else if (typeof val === "boolean") {
          val = val ? "Aktif" : "Non-Aktif";
        } else if (typeof val === "object") {
          val = JSON.stringify(val);
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  // UTF-8 BOM ensures Microsoft Excel displays accents and Indonesian characters correctly
  const csvContent = "\uFEFF" + [header, ...lines].join("\r\n");

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      fileName.endsWith(".csv") ? fileName : `${fileName}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
