-- 안성교육지원청 · 자료실(파일 업로드) 설정 SQL
-- Supabase SQL Editor에서 1회 실행하세요.

-- 1) 문서 메타데이터 테이블 -------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  -- guide slug (예: 'expense') — 어느 상세 페이지의 자료인지
  guide text not null default 'expense',
  -- 분류(섹션 제목) — 예: '신규자 필수자료'
  category text not null default '',
  -- 화면에 보일 제목
  name text not null,
  -- Storage(documents 버킷) 안의 파일 경로
  file_path text not null,
  -- 배지/아이콘 구분: 'pdf' | 'hwp'
  kind text not null default 'pdf',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;

-- 누구나 읽기 가능
drop policy if exists "documents_read" on public.documents;
create policy "documents_read" on public.documents for select using (true);

-- 로그인한 관리자만 추가/수정/삭제
drop policy if exists "documents_write" on public.documents;
create policy "documents_write" on public.documents
  for all to authenticated using (true) with check (true);

-- 2) Storage 버킷 --------------------------------------------------------
-- 공개 버킷(public read)으로 생성 — 이미 있으면 public 으로 갱신
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set public = true;

-- 3) Storage 접근 정책 (storage.objects) ---------------------------------
-- 누구나 파일 다운로드(읽기) 가능
drop policy if exists "documents_obj_read" on storage.objects;
create policy "documents_obj_read" on storage.objects
  for select using (bucket_id = 'documents');

-- 로그인한 관리자만 업로드/수정/삭제
drop policy if exists "documents_obj_write" on storage.objects;
create policy "documents_obj_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'documents')
  with check (bucket_id = 'documents');
