-- 실시간 질문방 답글(인용) 기능 추가 — 기존 테이블에 컬럼만 덧붙입니다.
-- Supabase SQL Editor에서 1회 실행하세요. (이미 실행했다면 다시 실행해도 무해)

alter table public.chat_messages
  add column if not exists reply_to  uuid,
  add column if not exists reply_nick text,
  add column if not exists reply_body text;
