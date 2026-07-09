import { supabase } from "./supabase";
import {
  type TableData,
  sharedTable as fallbackShared,
  gwansaTable as fallbackGwansa,
  summaryByType as fallbackSummaryType,
  summaryByDetail as fallbackSummaryDetail,
} from "../gwansaData";

// 공동사택 행
export type SharedRow = {
  id: string;
  sort: number;
  name: string;
  address: string;
  households: number;
  residents: number;
  waiting: number;
  note: string;
};

// 관사 행
export type GwansaRow = {
  id: string;
  sort: number;
  year: number;
  kind: string;
  name: string;
  address: string;
  households: number;
  capacity_per: number;
  capacity: number;
  residents: number;
  waiting: number;
  note: string;
};

const n = (x: number) => String(x ?? 0);
const sum = <T,>(rows: T[], key: keyof T) =>
  rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
const rate = (res: number, cap: number) =>
  cap > 0 ? `${Math.round((res / cap) * 100)}%` : "-";

// ---------- 조회 ----------
export async function fetchShared(): Promise<SharedRow[]> {
  if (!supabase) throw new Error("Supabase 미설정");
  const { data, error } = await supabase
    .from("shared_housing")
    .select("*")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SharedRow[];
}

export async function fetchGwansa(): Promise<GwansaRow[]> {
  if (!supabase) throw new Error("Supabase 미설정");
  const { data, error } = await supabase
    .from("official_residences")
    .select("*")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as GwansaRow[];
}

// ---------- 쓰기 (관리자) ----------
function nextSort() {
  return Math.floor(Date.now() / 1000);
}

export async function createShared(v: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase
    .from("shared_housing")
    .insert({ ...v, sort: nextSort() });
  if (error) throw error;
}
export async function updateShared(id: string, v: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase.from("shared_housing").update(v).eq("id", id);
  if (error) throw error;
}
export async function deleteShared(id: string) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase.from("shared_housing").delete().eq("id", id);
  if (error) throw error;
}

export async function createGwansa(v: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase
    .from("official_residences")
    .insert({ ...v, sort: nextSort() });
  if (error) throw error;
}
export async function updateGwansa(id: string, v: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase
    .from("official_residences")
    .update(v)
    .eq("id", id);
  if (error) throw error;
}
export async function deleteGwansa(id: string) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase
    .from("official_residences")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ---------- 표/요약 생성 ----------
export function buildSharedTable(rows: SharedRow[]): TableData {
  return {
    headers: ["사택명", "주소", "세대수", "입주인원", "대기자수(명)", "비고"],
    rows: rows.map((r) => [
      r.name,
      r.address,
      n(r.households),
      n(r.residents),
      n(r.waiting),
      r.note,
    ]),
    footer: [
      "계",
      "",
      n(sum(rows, "households")),
      n(sum(rows, "residents")),
      n(sum(rows, "waiting")),
      "",
    ],
  };
}

export function buildGwansaTable(rows: GwansaRow[]): TableData {
  return {
    headers: [
      "확보연도",
      "관사유형",
      "관사명",
      "주소",
      "세대수",
      "수용기준(명/실)",
      "수용가능인원",
      "입주인원",
      "대기자수(명)",
      "비고",
    ],
    rows: rows.map((r) => [
      String(r.year),
      r.kind,
      r.name,
      r.address,
      n(r.households),
      n(r.capacity_per),
      n(r.capacity),
      n(r.residents),
      n(r.waiting),
      r.note,
    ]),
    footer: [
      "계",
      "",
      "",
      "",
      n(sum(rows, "households")),
      "",
      n(sum(rows, "capacity")),
      n(sum(rows, "residents")),
      n(sum(rows, "waiting")),
      "",
    ],
  };
}

export function buildSummaryByType(
  shared: SharedRow[],
  gwansa: GwansaRow[],
): TableData {
  const sH = sum(shared, "households");
  const sR = sum(shared, "residents");
  const sW = sum(shared, "waiting");
  const gH = sum(gwansa, "households");
  const gC = sum(gwansa, "capacity");
  const gR = sum(gwansa, "residents");
  const gW = sum(gwansa, "waiting");
  const sharedNames = shared
    .map((s) => s.name.replace(/사택$/, ""))
    .filter(Boolean)
    .join("·");
  const years = [...new Set(gwansa.map((g) => g.year))]
    .sort((a, b) => a - b)
    .join("·");
  return {
    headers: [
      "구분",
      "세대수",
      "수용가능인원",
      "입주인원",
      "대기자수",
      "입주율",
      "비고",
    ],
    rows: [
      ["공동사택", n(sH), n(sH), n(sR), n(sW), rate(sR, sH), sharedNames],
      ["관사", n(gH), n(gC), n(gR), n(gW), rate(gR, gC), years ? `${years}년 확보` : ""],
    ],
    footer: [
      "전체",
      n(sH + gH),
      n(sH + gC),
      n(sR + gR),
      n(sW + gW),
      rate(sR + gR, sH + gC),
      "",
    ],
  };
}

export function buildSummaryByDetail(
  shared: SharedRow[],
  gwansa: GwansaRow[],
): TableData {
  const rows: string[][] = [
    [
      "공동사택",
      n(sum(shared, "households")),
      n(sum(shared, "households")),
      n(sum(shared, "residents")),
      n(sum(shared, "waiting")),
    ],
  ];
  const years = [...new Set(gwansa.map((g) => g.year))].sort((a, b) => a - b);
  years.forEach((y, i) => {
    const gr = gwansa.filter((g) => g.year === y);
    const label = i === 0 ? `${y}년 확보 관사` : `${y}년 추가 확보 관사`;
    rows.push([
      label,
      n(sum(gr, "households")),
      n(sum(gr, "capacity")),
      n(sum(gr, "residents")),
      n(sum(gr, "waiting")),
    ]);
  });
  return {
    headers: ["세부구분", "세대수", "수용가능인원", "입주인원", "대기자수"],
    rows,
  };
}

export type GwansaBundle = {
  shared: TableData;
  gwansa: TableData;
  summaryType: TableData;
  summaryDetail: TableData;
};

// Supabase에서 불러와 표를 구성. 실패(테이블 미생성 등) 시 기존 하드코딩 값으로 폴백.
export async function fetchGwansaBundle(): Promise<GwansaBundle> {
  try {
    const [shared, gwansa] = await Promise.all([fetchShared(), fetchGwansa()]);
    return {
      shared: buildSharedTable(shared),
      gwansa: buildGwansaTable(gwansa),
      summaryType: buildSummaryByType(shared, gwansa),
      summaryDetail: buildSummaryByDetail(shared, gwansa),
    };
  } catch {
    return {
      shared: fallbackShared,
      gwansa: fallbackGwansa,
      summaryType: fallbackSummaryType,
      summaryDetail: fallbackSummaryDetail,
    };
  }
}
