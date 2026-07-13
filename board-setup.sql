-- 안성교육지원청 · 자유게시판 설정 SQL (비밀번호 수정 포함)
-- Supabase SQL Editor에서 실행하세요. (여러 번 실행해도 안전 — 이미 만들었어도 그대로 다시 실행)
-- 익명 작성 + '게시글 비밀번호'로 본인 글 수정.

create table if not exists public.board_posts (
  id uuid primary key default gen_random_uuid(),
  seq bigint generated always as identity, -- 게시글 순번(익명 식별용)
  category text not null default '',        -- 분야(작성자 직접 입력)
  title text not null,
  content text not null default '',
  password_hash text,                       -- 수정용 비밀번호(해시 저장)
  created_at timestamptz not null default now()
);

-- 이전 버전 테이블에 컬럼이 없으면 추가
alter table public.board_posts add column if not exists password_hash text;

-- 비밀번호 해시용 확장
create extension if not exists pgcrypto;

alter table public.board_posts enable row level security;

-- 누구나 목록/내용 읽기
drop policy if exists "board_read" on public.board_posts;
create policy "board_read" on public.board_posts for select using (true);

-- 직접 insert/update 는 정책을 두지 않아 차단 → 아래 함수(비밀번호 처리)로만 작성·수정
drop policy if exists "board_insert" on public.board_posts;

-- 삭제는 로그인한 관리자만
drop policy if exists "board_delete" on public.board_posts;
create policy "board_delete" on public.board_posts
  for delete to authenticated using (true);

-- 작성: 비밀번호를 해시로 저장 (함수 소유자=테이블 소유자라 RLS 우회)
create or replace function public.create_board_post(
  p_category text, p_title text, p_content text, p_password text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.board_posts (category, title, content, password_hash)
  values (p_category, p_title, p_content, crypt(p_password, gen_salt('bf')));
end;
$$;

-- 수정: 비밀번호가 일치할 때만 수정, 성공하면 true 반환
create or replace function public.update_board_post(
  p_id uuid, p_password text, p_category text, p_title text, p_content text
) returns boolean
language plpgsql security definer set search_path = public as $$
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

grant execute on function public.create_board_post(text, text, text, text)
  to anon, authenticated;
grant execute on function public.update_board_post(uuid, text, text, text, text)
  to anon, authenticated;
