import { supabase } from "./supabase";

export type Notice = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
};

// Supabase 미설정 시 보여줄 기본 공지(폴백)
export const fallbackNotices: Notice[] = [
  {
    id: "sample-1",
    title: "행정업무지원기 오픈 안내",
    body: "신규자를 위한 업무 가이드 사이트가 열렸습니다. 업무·지침·안성 생활 정보를 확인해 보세요.",
    pinned: true,
    created_at: "2026-07-01T00:00:00.000Z",
  },
];

export async function fetchNotices(): Promise<Notice[]> {
  if (!supabase) return fallbackNotices;
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createNotice(input: {
  title: string;
  body: string;
  pinned: boolean;
}): Promise<void> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { error } = await supabase.from("notices").insert(input);
  if (error) throw error;
}

export async function updateNotice(
  id: string,
  input: { title: string; body: string; pinned: boolean },
): Promise<void> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { error } = await supabase.from("notices").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteNotice(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) throw error;
}
