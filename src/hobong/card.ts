// 나이스 «개인인사기록카드» 파싱 — 파이썬 hobong/card.py 이식.
// 열 위치가 카드마다 다르므로 «표 머리글»을 읽어 열을 찾습니다.
import {
  Sheet,
  colIndex,
  load,
  parseDateText,
  splitRef,
  type CellValue,
} from "./readXlsx";
import type { YMD } from "./period";

const SECTION_RE = /^\s*(\d{1,2})\s*\.\s*([가-힣][^\d]*)/;
const NO_DATA = "조회된데이터가없습니다";
const TILDE = "~";

const RANK_GRADES: [string, number][] = [
  ["서기관", 4],
  ["사무관", 5],
  ["주사보", 7],
  ["주사", 6],
  ["서기보", 9],
  ["서기", 8],
];

export type PriorCareer = {
  start: YMD | null;
  end: YMD | null;
  workplace: string;
  kind: string;
  position: string;
  public: string;
};

export type Appointment = {
  on: YMD | null;
  grade: string;
  kind: string;
  issuer: string;
};

export type Education = {
  entered: YMD | null;
  graduated: YMD | null;
  school: string;
  level: string;
  major: string;
};

export type StepRecord = { on: YMD; step: number };

export type CareerRow = {
  start: YMD | null;
  end: YMD | null;
  kind: string;
  grade_text: string;
  dept: string;
  issuer: string;
};

export function careerGrade(row: CareerRow): number | null {
  const m = /(\d+)\s*(?:급|등급)/.exec(row.grade_text);
  if (m) return Number(m[1]);
  for (const [rank, grade] of RANK_GRADES) {
    if (row.grade_text.includes(rank)) return grade;
  }
  return null;
}

export type Card = {
  name: string;
  prior_careers: PriorCareer[];
  appointments: Appointment[];
  educations: Education[];
  military: string[];
  step_records: StepRecord[];
  careers: CareerRow[];
  discipline: string[];
  problems: string[];
};

type Table = {
  number: number;
  title: string;
  header_row: number;
  rows: number[];
  cols: Map<string, string>; // 정규화 머리글 → 열
};

function tableCol(t: Table, ...keywords: string[]): string | null {
  for (const key of keywords) {
    for (const [head, column] of t.cols) {
      if (head.includes(key)) return column;
    }
  }
  return null;
}

function squeeze(text: string): string {
  return (text || "").replace(/\s/g, "");
}

function allRows(sheet: Sheet): number[] {
  const set = new Set<number>();
  for (const ref of sheet.cells.keys()) {
    const s = splitRef(ref);
    if (s) set.add(s.row);
  }
  return [...set].sort((a, b) => a - b);
}

function rowCells(sheet: Sheet, row: number): [string, string][] {
  const out: [string, string][] = [];
  for (const [ref, value] of sheet.cells) {
    const s = splitRef(ref);
    if (s && s.row === row && String(value).trim()) {
      out.push([s.col, String(value).trim()]);
    }
  }
  out.sort((a, b) => colIndex(a[0]) - colIndex(b[0]));
  return out;
}

function findTables(sheet: Sheet): Map<number, Table> {
  const rows = allRows(sheet);
  const heads: [number, number, string][] = [];
  for (const row of rows) {
    const m = SECTION_RE.exec(sheet.text(`B${row}`));
    if (m) heads.push([row, Number(m[1]), squeeze(m[2])]);
  }

  const tables = new Map<number, Table>();
  for (let i = 0; i < heads.length; i++) {
    const [titleRow, number, title] = heads[i];
    const end =
      i + 1 < heads.length
        ? heads[i + 1][0]
        : rows.length
          ? rows[rows.length - 1] + 1
          : titleRow + 1;
    const after = rows.filter((r) => titleRow < r && r < end);
    if (after.length === 0) continue;
    const headerRow = after[0];
    const cols = new Map<string, string>();
    for (const [c, v] of rowCells(sheet, headerRow)) {
      const key = squeeze(v);
      if (key && !cols.has(key)) cols.set(key, c);
    }
    const headerKey = squeeze(sheet.text(`B${headerRow}`));
    const dataRows: number[] = [];
    for (const r of after.slice(1)) {
      const first = squeeze(sheet.text(`B${r}`));
      if (!first || first.includes(NO_DATA)) continue;
      if (first === headerKey) continue; // 되풀이된 머리글
      dataRows.push(r);
    }
    tables.set(number, { number, title, header_row: headerRow, rows: dataRows, cols });
  }
  return tables;
}

function rangeOf(cells: [string, string][], startCol: string | null): [string, string] {
  if (startCol === null) return ["", ""];
  const values = cells.map((c) => c[1]);
  const columns = cells.map((c) => c[0]);
  const i = columns.indexOf(startCol);
  if (i < 0) return ["", ""];
  const start = values[i];
  for (let j = i + 1; j < values.length; j++) {
    if (values[j] === TILDE) return [start, j + 1 < values.length ? values[j + 1] : ""];
  }
  return [start, ""];
}

function intOf(text: string): number | null {
  const m = /-?\d+/.exec(text || "");
  return m ? Number(m[0]) : null;
}

function textAt(sheet: Sheet, row: number, column: string | null): string {
  return column ? sheet.text(`${column}${row}`) : "";
}

function dateAt(sheet: Sheet, row: number, column: string | null): YMD | null {
  return column ? sheet.date(`${column}${row}`) : null;
}

function cardName(sheet: Sheet): string {
  for (const row of allRows(sheet).slice(0, 20)) {
    const cells = rowCells(sheet, row);
    for (let i = 0; i < cells.length; i++) {
      if (squeeze(cells[i][1]) === "漢字" && i + 1 < cells.length) {
        return cells[i + 1][1];
      }
    }
  }
  return "";
}

function readPriorCareers(sheet: Sheet, tables: Map<number, Table>, card: Card): void {
  const table = tables.get(5);
  if (!table) return;
  const startCol = tableCol(table, "기간");
  for (const row of table.rows) {
    const cells = rowCells(sheet, row);
    const [start, end] = rangeOf(cells, startCol);
    const workplace = textAt(sheet, row, tableCol(table, "근무처", "근무기관"));
    if (!start && !workplace) continue;
    card.prior_careers.push({
      start: parseDateText(start),
      end: parseDateText(end),
      workplace,
      kind: textAt(sheet, row, tableCol(table, "근무처구분", "기관구분")),
      position: textAt(sheet, row, tableCol(table, "직위", "직급")),
      public: textAt(sheet, row, tableCol(table, "공무원")),
    });
  }
}

function readAppointments(sheet: Sheet, tables: Map<number, Table>, card: Card): void {
  const table = tables.get(6);
  if (!table) return;
  for (const row of table.rows) {
    const on = dateAt(sheet, row, tableCol(table, "연월일"));
    if (!on) continue;
    card.appointments.push({
      on,
      grade: textAt(sheet, row, tableCol(table, "직급")),
      kind: textAt(sheet, row, tableCol(table, "임면구분", "구분")),
      issuer: textAt(sheet, row, tableCol(table, "발령청")),
    });
  }
}

function readEducations(sheet: Sheet, tables: Map<number, Table>, card: Card): void {
  const table = tables.get(4);
  if (!table) return;
  for (const row of table.rows) {
    const school = textAt(sheet, row, tableCol(table, "학교명"));
    if (!school) continue;
    card.educations.push({
      entered: dateAt(sheet, row, tableCol(table, "입학")),
      graduated: dateAt(sheet, row, tableCol(table, "졸업")),
      school,
      level: textAt(sheet, row, tableCol(table, "학력")),
      major: textAt(sheet, row, tableCol(table, "학과")),
    });
  }
}

function readTextRows(
  sheet: Sheet,
  tables: Map<number, Table>,
  num: number,
  target: string[],
): void {
  const table = tables.get(num);
  if (!table) return;
  for (const row of table.rows) {
    const text = rowCells(sheet, row)
      .map((c) => c[1])
      .join(" ");
    if (text && !squeeze(text).includes(NO_DATA)) target.push(text);
  }
}

function readCareers(sheet: Sheet, tables: Map<number, Table>, card: Card): void {
  const table = tables.get(16);
  if (!table) return;
  const startCol = tableCol(table, "기간");
  for (const row of table.rows) {
    const cells = rowCells(sheet, row);
    const [start, end] = rangeOf(cells, startCol);
    const kind = textAt(sheet, row, tableCol(table, "임용구분"));
    if (!start || !kind) continue;
    card.careers.push({
      start: parseDateText(start),
      end: parseDateText(end),
      kind,
      grade_text: textAt(sheet, row, tableCol(table, "직급", "직위")),
      dept: textAt(sheet, row, tableCol(table, "부서")),
      issuer: textAt(sheet, row, tableCol(table, "발령청")),
    });
  }
}

function readStepRecords(sheet: Sheet): StepRecord[] {
  const rows = allRows(sheet);
  const out: StepRecord[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (squeeze(sheet.text(`B${row}`)) !== "호봉" || i + 1 >= rows.length) continue;
    const dateRow = rows[i + 1];
    if (squeeze(sheet.text(`B${dateRow}`)) !== "발령연월일") continue;
    for (const [col, value] of rowCells(sheet, row)) {
      if (col === "B") continue;
      const step = intOf(value);
      const on = sheet.date(`${col}${dateRow}`);
      if (step !== null && on) out.push({ on, step });
    }
  }
  return out;
}

function cmpDate(a: YMD | null, b: YMD | null): number {
  const av = a ? a.y * 10000 + a.m * 100 + a.d : -Infinity;
  const bv = b ? b.y * 10000 + b.m * 100 + b.d : -Infinity;
  return av - bv;
}

export function readCard(buf: ArrayBuffer): Card {
  const sheets = load(buf);
  const sheet = sheets.values().next().value as Sheet | undefined;
  const card: Card = {
    name: "",
    prior_careers: [],
    appointments: [],
    educations: [],
    military: [],
    step_records: [],
    careers: [],
    discipline: [],
    problems: [],
  };
  if (!sheet) {
    card.problems.push("시트를 읽지 못했습니다.");
    return card;
  }
  const tables = findTables(sheet);
  card.name = cardName(sheet);

  readEducations(sheet, tables, card);
  readTextRows(sheet, tables, 2, card.military);
  readPriorCareers(sheet, tables, card);
  readAppointments(sheet, tables, card);
  readTextRows(sheet, tables, 12, card.discipline);
  readCareers(sheet, tables, card);
  card.step_records = readStepRecords(sheet);

  card.appointments.sort((a, b) => cmpDate(a.on, b.on));
  card.prior_careers.sort((a, b) => cmpDate(a.start, b.start));
  card.careers.sort((a, b) => cmpDate(a.start, b.start));
  card.step_records.sort((a, b) => cmpDate(a.on, b.on));

  if (card.careers.length === 0)
    card.problems.push("«16. 경력» 을 읽지 못했습니다. 카드 서식이 다를 수 있습니다.");
  if (card.step_records.length === 0)
    card.problems.push("«14. 승급 기록» 을 읽지 못했습니다.");
  return card;
}

export type { CellValue };
