import { supabase } from "./supabase";

export type BoardPost = {
  id: string;
  seq: number;
  category: string;
  title: string;
  content: string;
  created_at: string;
};

// 게시글 목록(최신순)
export async function fetchPosts(): Promise<BoardPost[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("board_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BoardPost[];
}

// 글 작성(익명)
export async function createPost(input: {
  category: string;
  title: string;
  content: string;
}): Promise<BoardPost> {
  if (!supabase) {
    throw new Error("게시판이 아직 연결되지 않았습니다. (Supabase 설정 필요)");
  }
  const { data, error } = await supabase
    .from("board_posts")
    .insert({
      category: input.category.trim(),
      title: input.title.trim(),
      content: input.content,
    })
    .select()
    .single();
  if (error) throw error;
  return data as BoardPost;
}

// 삭제(관리자 전용 — RLS로 로그인 사용자만 허용)
export async function deletePost(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { error } = await supabase.from("board_posts").delete().eq("id", id);
  if (error) throw error;
}
