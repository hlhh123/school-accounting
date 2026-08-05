import { supabase } from "./supabase";

export type ChatMessage = {
  id: string;
  nickname: string;
  body: string;
  created_at: string;
};

// 최근 메시지(오래된 → 최신 순). 실패(테이블 미설정) 시 빈 배열.
export async function fetchMessages(limit = 60): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, nickname, body, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as ChatMessage[]).reverse();
}

// 메시지 전송(익명). 저장된 행을 반환해 즉시 화면에 반영할 수 있게 함.
export async function sendMessage(
  nickname: string,
  body: string,
): Promise<ChatMessage> {
  if (!supabase) throw new Error("실시간 질문방이 아직 연결되지 않았습니다.");
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ nickname: nickname.trim() || "익명", body: body.trim() })
    .select("id, nickname, body, created_at")
    .single();
  if (error) throw error;
  return data as ChatMessage;
}

// 새 메시지 실시간 구독. 정리 함수를 반환.
export function subscribeMessages(
  onInsert: (m: ChatMessage) => void,
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
    .subscribe();
  return () => {
    sb.removeChannel(channel);
  };
}
