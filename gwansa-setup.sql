-- 안성교육지원청 · 관사현황 테이블 설정 SQL
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요. (한 번만)

-- 1) 공동사택 테이블
create table if not exists public.shared_housing (
  id uuid primary key default gen_random_uuid(),
  sort integer not null default 0,
  name text not null,
  address text not null default '',
  households integer not null default 0,
  residents integer not null default 0,
  waiting integer not null default 0,
  note text not null default '',
  created_at timestamptz not null default now()
);

-- 2) 관사 테이블
create table if not exists public.official_residences (
  id uuid primary key default gen_random_uuid(),
  sort integer not null default 0,
  year integer not null default 0,
  kind text not null default '',
  name text not null,
  address text not null default '',
  households integer not null default 0,
  capacity_per integer not null default 0,
  capacity integer not null default 0,
  residents integer not null default 0,
  waiting integer not null default 0,
  note text not null default '',
  created_at timestamptz not null default now()
);

-- 3) 보안(RLS): 방문자는 읽기, 로그인한 관리자만 수정
alter table public.shared_housing enable row level security;
alter table public.official_residences enable row level security;

drop policy if exists "shared_read" on public.shared_housing;
create policy "shared_read" on public.shared_housing for select using (true);
drop policy if exists "shared_write" on public.shared_housing;
create policy "shared_write" on public.shared_housing
  for all to authenticated using (true) with check (true);

drop policy if exists "gwansa_read" on public.official_residences;
create policy "gwansa_read" on public.official_residences for select using (true);
drop policy if exists "gwansa_write" on public.official_residences;
create policy "gwansa_write" on public.official_residences
  for all to authenticated using (true) with check (true);

-- 4) 기존 데이터 시드 (표가 비어 있을 때만 1회 입력)
insert into public.shared_housing (sort, name, address, households, residents, waiting, note)
select * from (values
  (10, '대덕사택', '안성시 대덕면 모산로 100', 50, 50, 11, '2008년 준공'),
  (20, '일죽사택', '안성시 일죽면 서동대로 7446', 42, 42, 4, '2009년 준공'),
  (30, '광덕사택', '안성시 대덕면 내리 695', 40, 40, 27, '2024년 준공')
) as v(sort, name, address, households, residents, waiting, note)
where not exists (select 1 from public.shared_housing);

insert into public.official_residences
  (sort, year, kind, name, address, households, capacity_per, capacity, residents, waiting, note)
select * from (values
  (10, 2025, '임대아파트', '롯데캐슬', '안성시 대덕면 서동대로 4725', 5, 2, 10, 10, 10, '2인 1실'),
  (20, 2025, '임대아파트', '서해그랑블', '안성시 공도읍 양기길 28', 3, 2, 6, 6, 0, '2인 1실'),
  (30, 2025, '임대아파트', '푸르지오', '경기 안성시 비봉로 37', 3, 2, 6, 6, 0, '2인 1실'),
  (40, 2025, '임대아파트', '우림아파트', '안성시 공도읍 진사길 27', 1, 1, 1, 1, 0, '1인 1실'),
  (50, 2026, 'LH행복주택', '평택 배다리마을 5단지 아파트', '경기 평택시 죽백4로 60', 10, 1, 10, 10, 1, '1인 1실'),
  (60, 2026, '오피스텔', '센스 오피스텔', '경기 안성시 대덕면 대학4길 1', 31, 1, 31, 31, 21, '1인 1실')
) as v(sort, year, kind, name, address, households, capacity_per, capacity, residents, waiting, note)
where not exists (select 1 from public.official_residences);
