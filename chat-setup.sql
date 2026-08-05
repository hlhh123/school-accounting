-- 안성교육지원청 · 실시간 질문방(채팅) 테이블 설정 SQL
-- Supabase SQL Editor에서 1회 실행하세요.

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  nickname text not null default '익명',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_created_idx
  on public.chat_messages (created_at);

alter table public.chat_messages enable row level security;

-- 누구나(비로그인 포함) 읽기·쓰기 가능. 삭제는 관리자(로그인)만.
drop policy if exists "chat_read" on public.chat_messages;
create policy "chat_read" on public.chat_messages
  for select using (true);

drop policy if exists "chat_public_insert" on public.chat_messages;
create policy "chat_public_insert" on public.chat_messages
  for insert to anon with check (true);

drop policy if exists "chat_auth_insert" on public.chat_messages;
create policy "chat_auth_insert" on public.chat_messages
  for insert to authenticated with check (true);

drop policy if exists "chat_admin_delete" on public.chat_messages;
create policy "chat_admin_delete" on public.chat_messages
  for delete to authenticated using (true);

-- 실시간(Realtime) 반영을 위해 publication 에 테이블 추가
alter publication supabase_realtime add table public.chat_messages;
