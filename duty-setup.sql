-- 안성교육지원청 · 직무달력 테이블 설정 SQL (Supabase SQL Editor에서 1회 실행)

create table if not exists public.duty_tasks (
  id uuid primary key default gen_random_uuid(),
  sort integer not null default 0,
  month integer not null,          -- 1~12
  day integer not null default 0,  -- 1~31, 0이면 '해당 월 전체(날짜 미지정)'
  title text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

alter table public.duty_tasks enable row level security;
drop policy if exists "duty_read" on public.duty_tasks;
create policy "duty_read" on public.duty_tasks for select using (true);
drop policy if exists "duty_write" on public.duty_tasks;
create policy "duty_write" on public.duty_tasks for all to authenticated using (true) with check (true);

insert into public.duty_tasks (sort, month, day, title, detail)
select * from (values
  (1, 1, 10, '급여 연말정산 자료 취합', '소득·세액공제 증빙 수합 및 검토'),
  (2, 1, 20, '성과상여금 지급 준비', ''),
  (3, 1, 0, '1월분 급여 지급', ''),
  (4, 2, 10, '학교회계 결산 자료 정리', ''),
  (5, 2, 25, '인사이동 대상자 급여 정리', ''),
  (6, 3, 2, '신학기 급여 세팅', '인사발령 반영, 기간제교원 계약 등록'),
  (7, 3, 15, '본예산 배정·집행 시작', ''),
  (8, 4, 10, '1분기 예산 집행률 점검', ''),
  (9, 4, 20, '맞춤형복지 배정 안내', ''),
  (10, 5, 12, '근로소득 간이지급명세서 제출', ''),
  (11, 5, 25, '스승의날 관련 복무·경비 정리', ''),
  (12, 6, 15, '상반기 결산 준비', ''),
  (13, 6, 30, '1학기 기간제교원 계약 만료 점검', ''),
  (14, 7, 10, '성과상여금 지급 점검', ''),
  (15, 7, 20, '하반기 예산 집행 계획 점검', ''),
  (16, 7, 0, '방학 중 복무 관리', ''),
  (17, 8, 20, '2학기 기간제교원 계약 등록', ''),
  (18, 8, 28, '2학기 급여 세팅', ''),
  (19, 9, 5, '추석 상여·경비 지급', ''),
  (20, 9, 25, '3분기 예산 집행률 점검', ''),
  (21, 10, 15, '연말정산 대비 안내', ''),
  (22, 10, 25, '차년도 예산요구 준비', ''),
  (23, 11, 10, '차년도 본예산 편성 작업', ''),
  (24, 11, 20, '맞춤형복지 잔여예산 정리', ''),
  (25, 12, 10, '지출 마감·이월 정리', ''),
  (26, 12, 20, '연말 결산', ''),
  (27, 12, 28, '연가보상비 산정', '')
) as v(sort, month, day, title, detail)
where not exists (select 1 from public.duty_tasks);
