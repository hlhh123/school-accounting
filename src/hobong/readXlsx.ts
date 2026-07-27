// 엑셀(.xlsx) 읽기 — 파이썬 hobong/xlsx.py 이식(SheetJS 사용).
// 나이스 카드는 스타일이 깨져 있어도 SheetJS 는 셀 주소로 값을 읽어냅니다.
import * as XLSX from "xlsx";
import type { YMD } from "./period";

// 엑셀 날짜 일련번호의 기준일(1899-12-30). 1900 윤년 오류 보정 포함.
export function serialToDate(serial: number): YMD {
  const ms = Date.UTC(1899, 11, 30) + Math.trunc(serial) * 86400000;
  const d = new Date(ms);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
}

// '2003.09.15', '2003-09-15', '2003.09' → YMD
export function parseDateText(text: string | number | null | undefined): YMD | null {
  if (text === null || text === undefined) return null;
  let s = String(text).trim().replace(/\.+$/, "");
  if (!s) return null;
  for (const sep of [".", "-", "/"]) {
    if (s.includes(sep)) {
      const parts = s.split(sep).map((p) => p.trim()).filter(Boolean);
      const nums = parts.map((p) => Number(p));
      if (nums.some((n) => !Number.isFinite(n))) return null;
      if (nums.length === 3) return { y: nums[0], m: nums[1], d: nums[2] };
      if (nums.length === 2) return { y: nums[0], m: nums[1], d: 1 };
      return null;
    }
  }
  return null;
}

export type CellValue = string | number;

export class Sheet {
  name: string;
  cells: Map<string, CellValue>;
  constructor(name: string, cells: Map<string, CellValue>) {
    this.name = name;
    this.cells = cells;
  }
  cell(ref: string): CellValue | undefined {
    return this.cells.get(ref);
  }
  text(ref: string): string {
    const v = this.cells.get(ref);
    return v === undefined || v === null ? "" : String(v).trim();
  }
  date(ref: string): YMD | null {
    const v = this.cells.get(ref);
    if (v === undefined || v === "") return null;
    if (typeof v === "number") return serialToDate(v);
    return parseDateText(String(v));
  }
  number(ref: string): number | null {
    const v = this.cells.get(ref);
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = Number(v.trim());
      return Number.isFinite(n) && v.trim() !== "" ? n : null;
    }
    return null;
  }
}

const CELL_RE = /^([A-Z]+)(\d+)$/;

// 파일(ArrayBuffer) → {시트이름: Sheet}
export function load(buf: ArrayBuffer): Map<string, Sheet> {
  const wb = XLSX.read(buf, {
    type: "array",
    raw: true,
    cellDates: false,
    cellNF: false,
    cellText: false,
    cellStyles: false,
  });
  const out = new Map<string, Sheet>();
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const cells = new Map<string, CellValue>();
    for (const ref of Object.keys(ws)) {
      if (!CELL_RE.test(ref)) continue; // '!ref' 등 메타 제외
      const cell = ws[ref] as XLSX.CellObject;
      let value: CellValue | undefined;
      const raw = cell.v;
      if (typeof raw === "number") {
        value = raw;
      } else if (raw instanceof Date) {
        // cellDates:false 라도 방어적으로: YYYY.MM.DD 텍스트로
        value = `${raw.getUTCFullYear()}.${raw.getUTCMonth() + 1}.${raw.getUTCDate()}`;
      } else if (raw !== undefined && raw !== null) {
        value = String(raw).trim();
      }
      if (value !== undefined && value !== "") cells.set(ref, value);
    }
    out.set(name, new Sheet(name, cells));
  }
  return out;
}

export function colIndex(column: string): number {
  let n = 0;
  for (const ch of column) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

export function splitRef(ref: string): { col: string; row: number } | null {
  const m = CELL_RE.exec(ref);
  if (!m) return null;
  return { col: m[1], row: Number(m[2]) };
}
