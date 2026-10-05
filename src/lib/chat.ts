import { supabase } from "./supabase";

export type ChatMessage = {
  id: string;
  nickname: string;
  body: string;
  created_at: string;
  // 답글(인용) — 원문을 스냅샷으로 저장해 부모 삭제·실시간 반영에도 안전.
  reply_to: string | null;
  reply_nick: string | null;
  reply_body: string | null;
};

const COLS = "id, nickname, body, created_at, reply_to, reply_nick, reply_body";

// 최근 메시지(오래된 → 최신 순). 실패(테이블 미설정) 시 빈 배열.
export async function fetchMessages(limit = 60): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("chat_messages")
    .select(COLS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as ChatMessage[]).reverse();
}

export type ReplyTarget = {
  id: string;
  nickname: string;
  body: string;
};

// 메시지 전송(익명). reply 지정 시 답글로 저장. 저장된 행을 반환.
export async function sendMessage(
  nickname: string,
  body: string,
  reply?: ReplyTarget | null,
): Promise<ChatMessage> {
  if (!supabase) throw new Error("실시간 질문방이 아직 연결되지 않았습니다.");
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      nickname: nickname.trim() || "익명",
      body: body.trim(),
      reply_to: reply?.id ?? null,
      reply_nick: reply?.nickname ?? null,
      reply_body: reply ? reply.body.slice(0, 200) : null,
    })
    .select(COLS)
    .single();
  if (error) throw error;
  return data as ChatMessage;
}

// 메시지 삭제(관리자 전용 — RLS로 로그인 사용자만 허용)
export async function deleteMessage(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");
  const { error } = await supabase.from("chat_messages").delete().eq("id", id);
  if (error) throw error;
}

// 새 메시지/삭제 실시간 구독. 정리 함수를 반환.
export function subscribeMessages(
  onInsert: (m: ChatMessage) => void,
  onDelete?: (id: string) => void,
): () => void {
  const sb = supabase;
  if (!sb) return () => {};
  const channel = sb
    .channel("chat_messages_room")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages" },
      (payload) => onInsert(payload.new as ChatMessage),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "chat_messages" },
      (payload) => onDelete?.((payload.old as { id: string }).id),
    )
    .subscribe();
  return () => {
    sb.removeChannel(channel);
  };
}
