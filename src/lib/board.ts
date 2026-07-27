import { supabase } from "./supabase";

export type BoardPost = {
  id: string;
  seq: number;
  category: string;
  title: string;
  content: string;
  created_at: string;
};

export type BoardComment = {
  id: string;
  seq: number;
  content: string;
  created_at: string;
};

// 게시글 목록(최신순) — board 로 게시판을 구분합니다(기본 'free').
export async function fetchPosts(board = "free"): Promise<BoardPost[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("board_posts")
    .select("id, seq, category, title, content, created_at")
    .eq("board", board)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BoardPost[];
}

// 글 작성(익명) — 비밀번호는 서버에서 해시로 저장
export async function createPost(input: {
  board?: string;
  category: string;
  title: string;
  content: string;
  password: string;
}): Promise<void> {
  if (!supabase) {
    throw new Error("게시판이 아직 연결되지 않았습니다. (Supabase 설정 필요)");
  }
  const { error } = await supabase.rpc("create_board_post", {
    p_board: input.board ?? "free",
    p_category: input.category.trim(),
    p_title: input.title.trim(),
    p_content: input.content,
    p_password: input.password,
  });
  if (error) throw error;
}

// 글 수정 — 비밀번호가 맞을 때만 성공(true). 틀리면 false.
export async function updatePost(input: {
  id: string;
  password: string;
  category: string;
  title: string;
  content: string;
}): Promise<boolean> {
  if (!supabase) {
    throw new Error("게시판이 아직 연결되지 않았습니다. (Supabase 설정 필요)");
  }
  const { data, error } = await supabase.rpc("update_board_post", {
    p_id: input.id,
    p_password: input.password,
    p_category: input.category.trim(),
    p_title: input.title.trim(),
    p_content: input.content,
  });
  if (error) throw error;
  return data === true;
}

// 삭제(관리자 전용 — RLS로 로그인 사용자만 허용)
export async function deletePost(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { error } = await supabase.from("board_posts").delete().eq("id", id);
  if (error) throw error;
}

// ── 댓글(답글) ─────────────────────────────────────────────────────────
export async function fetchComments(postId: string): Promise<BoardComment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("board_comments")
    .select("id, seq, content, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BoardComment[];
}

// 댓글 작성(익명). 비밀번호는 비워도 됩니다(비우면 본인 삭제 불가).
export async function createComment(input: {
  postId: string;
  content: string;
  password: string;
}): Promise<void> {
  if (!supabase) throw new Error("게시판이 아직 연결되지 않았습니다.");
  const { error } = await supabase.rpc("create_board_comment", {
    p_post_id: input.postId,
    p_content: input.content,
    p_password: input.password,
  });
  if (error) throw error;
}

// 댓글 삭제 — 비밀번호가 맞을 때만 성공(true).
export async function deleteComment(input: {
  id: string;
  password: string;
}): Promise<boolean> {
  if (!supabase) throw new Error("게시판이 아직 연결되지 않았습니다.");
  const { data, error } = await supabase.rpc("delete_board_comment", {
    p_id: input.id,
    p_password: input.password,
  });
  if (error) throw error;
  return data === true;
}

// 댓글 삭제(관리자 — RLS)
export async function adminDeleteComment(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { error } = await supabase.from("board_comments").delete().eq("id", id);
  if (error) throw error;
}
