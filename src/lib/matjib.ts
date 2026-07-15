import { supabase } from "./supabase";
import { matjibRegions as fallback, type MatjibRegion } from "../matjibData";

export type Restaurant = {
  id: string;
  sort: number;
  region: string;
  category: string;
  name: string;
  phone: string;
  address: string;
  hours: string;
  kind?: string; // 'restaurant'(음식점) | 'cafe'(카페). 없으면 음식점으로 취급.
};

export type MatjibKind = "restaurant" | "cafe";

export async function fetchRestaurants(): Promise<Restaurant[]> {
  if (!supabase) throw new Error("Supabase 미설정");
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Restaurant[];
}

function nextSort() {
  return Math.floor(Date.now() / 1000);
}

export async function createRestaurant(v: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase
    .from("restaurants")
    .insert({ ...v, sort: nextSort() });
  if (error) throw error;
}
export async function updateRestaurant(id: string, v: Record<string, unknown>) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase.from("restaurants").update(v).eq("id", id);
  if (error) throw error;
}
export async function deleteRestaurant(id: string) {
  if (!supabase) throw new Error("Supabase 미설정");
  const { error } = await supabase.from("restaurants").delete().eq("id", id);
  if (error) throw error;
}

// 지역별로 묶어서 반환. 실패(테이블 미생성) 시 기존 정적 데이터로 폴백.
// kind: 음식점('restaurant') / 카페('cafe') 탭을 구분해 필터링.
export async function fetchMatjibRegions(
  kind: MatjibKind = "restaurant",
): Promise<MatjibRegion[]> {
  try {
    const rows = (await fetchRestaurants()).filter(
      (r) => (r.kind ?? "restaurant") === kind,
    );
    const map = new Map<string, MatjibRegion>();
    const order: string[] = [];
    for (const r of rows) {
      if (!map.has(r.region)) {
        map.set(r.region, { region: r.region, items: [] });
        order.push(r.region);
      }
      map.get(r.region)!.items.push({
        category: r.category,
        name: r.name,
        phone: r.phone,
        address: r.address,
        hours: r.hours,
      });
    }
    const result = order.map((k) => map.get(k)!);
    if (result.length) return result;
    return kind === "restaurant" ? fallback : [];
  } catch {
    return kind === "restaurant" ? fallback : [];
  }
}
