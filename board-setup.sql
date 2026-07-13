-- 안성교육지원청 · 자유게시판 설정 SQL
-- Supabase SQL Editor에서 1회 실행하세요.
-- 익명(비로그인) 작성이 가능하도록 anon INSERT를 허용합니다.

create table if not exists public.board_posts (
  id uuid primary key default gen_random_uuid(),
  -- 게시글 순번(자동 증가) — 익명 식별용으로 화면에 표시
  seq bigint generated always as identity,
  category text not null default '', -- 분야(작성자가 직접 입력)
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

alter table public.board_posts enable row level security;

-- 누구나 목록/내용 읽기 가능
drop policy if exists "board_read" on public.board_posts;
create policy "board_read" on public.board_posts for select using (true);

-- 누구나(익명 포함) 글 작성 가능
drop policy if exists "board_insert" on public.board_posts;
create policy "board_insert" on public.board_posts for insert with check (true);

-- 삭제는 로그인한 관리자만 (부적절 게시물 정리용)
drop policy if exists "board_delete" on public.board_posts;
create policy "board_delete" on public.board_posts
  for delete to authenticated using (true);
