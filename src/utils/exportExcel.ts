export type ExcelCell = string | number | boolean | null | undefined;

export interface ExcelSheet {
  name: string;
  rows: ExcelCell[][];
}

function columnWidths(rows: ExcelCell[][]) {
  const widths: number[] = [];
  rows.forEach((row) =>
    row.forEach((cell, index) => {
      const length = cell === null || cell === undefined ? 0 : String(cell).length;
      widths[index] = Math.max(widths[index] ?? 8, Math.min(length + 2, 50));
    }),
  );
  return widths.map((wch) => ({ wch }));
}

/** Excel caps sheet names at 31 chars and forbids : \ / ? * [ ] */
function safeSheetName(name: string) {
  return name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Sheet";
}

export async function exportExcel(fileName: string, sheets: ExcelSheet[]) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.rows);
    worksheet["!cols"] = columnWidths(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName(sheet.name));
  });

  const fullName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, fullName);
  return fullName;
}

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}
