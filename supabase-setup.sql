-- 안성교육지원청 사이트 · Supabase 초기 설정 SQL
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.

-- 1) 공지사항 테이블
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) Row Level Security 활성화
alter table public.notices enable row level security;

-- 3) 방문자는 누구나 읽기 가능
drop policy if exists "notices_public_read" on public.notices;
create policy "notices_public_read" on public.notices
  for select using (true);

-- 4) 로그인한 관리자만 추가/수정/삭제 가능
drop policy if exists "notices_admin_write" on public.notices;
create policy "notices_admin_write" on public.notices
  for all to authenticated using (true) with check (true);

-- 참고: 관리자 계정은 Supabase 대시보드 > Authentication > Users 에서
--   Email: ansaegil@ansaegil.kr / Password: ansaegil 로 생성하고,
--   "Auto Confirm User" 를 체크해 주세요.
