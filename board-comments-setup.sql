-- 안성교육지원청 · 게시판 확장(댓글 + 질문게시판) SQL
-- Supabase SQL Editor에서 실행하세요. (여러 번 실행해도 안전)
--
--  ① board_posts 에 board 구분 컬럼 추가 (자유게시판 'free' / 질문게시판 'qna:...')
--  ② 게시글 작성·수정 함수에 board 인자 추가
--  ③ board_comments(댓글) 테이블 + 익명 작성·비밀번호 삭제 함수

-- ────────────────────────────────────────────────────────────
-- ① board_posts 에 board 컬럼
-- ────────────────────────────────────────────────────────────
alter table public.board_posts
  add column if not exists board text not null default 'free';

create index if not exists board_posts_board_idx on public.board_posts (board);

-- ────────────────────────────────────────────────────────────
-- ② 게시글 작성·수정 함수 (board 인자 추가)
-- ────────────────────────────────────────────────────────────
-- ※ pgcrypto(crypt·gen_salt)는 Supabase에서 extensions 스키마에 설치됩니다.
--    security definer 함수는 search_path 를 고정하므로 extensions 를 포함해야 합니다.
drop function if exists public.create_board_post(text, text, text, text);
create or replace function public.create_board_post(
  p_board text, p_category text, p_title text, p_content text, p_password text
) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  insert into public.board_posts (board, category, title, content, password_hash)
  values (coalesce(nullif(p_board, ''), 'free'), p_category, p_title, p_content,
          crypt(p_password, gen_salt('bf')));
end;
$$;

grant execute on function public.create_board_post(text, text, text, text, text)
  to anon, authenticated;

-- 글 수정 함수도 같은 이유로 다시 만듭니다(search_path 에 extensions 포함).
create or replace function public.update_board_post(
  p_id uuid, p_password text, p_category text, p_title text, p_content text
) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare cnt integer;
begin
  update public.board_posts
     set category = p_category, title = p_title, content = p_content
   where id = p_id
     and password_hash is not null
     and password_hash = crypt(p_password, password_hash);
  get diagnostics cnt = row_count;
  return cnt > 0;
end;
$$;

grant execute on function public.update_board_post(uuid, text, text, text, text)
  to anon, authenticated;

-- ────────────────────────────────────────────────────────────
-- ③ board_comments (댓글/답글)
-- ────────────────────────────────────────────────────────────
create table if not exists public.board_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.board_posts (id) on delete cascade,
  seq bigint generated always as identity,
  content text not null default '',
  password_hash text,
  created_at timestamptz not null default now()
);

create index if not exists board_comments_post_idx
  on public.board_comments (post_id, created_at);

alter table public.board_comments enable row level security;

-- 누구나 읽기
drop policy if exists "comments_read" on public.board_comments;
create policy "comments_read" on public.board_comments for select using (true);

-- 직접 insert/update 는 막고(함수로만), 삭제는 관리자만
drop policy if exists "comments_delete" on public.board_comments;
create policy "comments_delete" on public.board_comments
  for delete to authenticated using (true);

-- 댓글 작성(익명) — 비밀번호는 해시로 저장
create or replace function public.create_board_comment(
  p_post_id uuid, p_content text, p_password text
) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  insert into public.board_comments (post_id, content, password_hash)
  values (p_post_id, p_content,
          case when p_password = '' then null
               else crypt(p_password, gen_salt('bf')) end);
end;
$$;

-- 댓글 삭제 — 비밀번호가 맞을 때만 (성공 시 true)
create or replace function public.delete_board_comment(
  p_id uuid, p_password text
) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare cnt integer;
begin
  delete from public.board_comments
   where id = p_id
     and password_hash is not null
     and password_hash = crypt(p_password, password_hash);
  get diagnostics cnt = row_count;
  return cnt > 0;
end;
$$;

grant execute on function public.create_board_comment(uuid, text, text)
  to anon, authenticated;
grant execute on function public.delete_board_comment(uuid, text)
  to anon, authenticated;
