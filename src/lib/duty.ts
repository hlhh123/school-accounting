import { supabase } from "./supabase";
import { dutyCalendar as fallback, type DutyTask } from "../dutyCalendar";

export type DutyRow = {
  id: string;
  sort: number;
  month: number;
  day: number;
  title: string;
  detail: string;
};

export async function fetchDutyRows(): Promise<DutyRow[]> {
  if (!supabase) throw new Error("Supabase 미설정");
  const { data, error } = await supabase
    .from("duty_tasks")
    .select("*")
    .order("month", { ascending: true })
    .order("day", { ascending: true })
    .order("sort", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DutyRow[];
}

function nextSort() {
  return Math.floor(Date.now() / 1000);
}

export async function createDuty(v: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase
    .from("duty_tasks")
    .insert({ ...v, sort: nextSort() });
  if (error) throw error;
}
export async function updateDuty(id: string, v: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase.from("duty_tasks").update(v).eq("id", id);
  if (error) throw error;
}
export async function deleteDuty(id: string) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase.from("duty_tasks").delete().eq("id", id);
  if (error) throw error;
}

// 월별로 묶어서 반환. 실패(테이블 미생성) 시 정적 예시 데이터로 폴백.
export async function fetchDutyByMonth(): Promise<Record<number, DutyTask[]>> {
  try {
    const rows = await fetchDutyRows();
    const out: Record<number, DutyTask[]> = {};
    for (const r of rows) {
      (out[r.month] ??= []).push({
        day: r.day > 0 ? r.day : undefined,
        title: r.title,
        detail: r.detail || undefined,
      });
    }
    return Object.keys(out).length ? out : fallback;
  } catch {
    return fallback;
  }
}
