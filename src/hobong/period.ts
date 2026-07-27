// 경력 기간(년·월·일) 계산 — 파이썬 hobong/period.py 이식.
//
// 경력기간은 「민법」 제160조 «역(曆)에 의한 계산»으로 셉니다(달력으로 셈, 종료일 포함).
// 환산율을 곱하거나 더하고 뺄 때만 «12월=1년, 30일=1월»로 보고 일수로 바꿉니다.

export const DAYS_PER_YEAR = 360;
export const DAYS_PER_MONTH = 30;

export type Period = { years: number; months: number; days: number };

export const ZERO: Period = { years: 0, months: 0, days: 0 };

export function periodText(p: Period): string {
  return `${p.years}년 ${p.months}월 ${p.days}일`;
}

// 1년=360일, 1월=30일로 본 총 일수
export function totalDays(p: Period): number {
  return p.years * DAYS_PER_YEAR + p.months * DAYS_PER_MONTH + p.days;
}

export function fromDays(total: number): Period {
  const sign = total < 0 ? -1 : 1;
  const n = Math.abs(total);
  return {
    years: sign * Math.floor(n / DAYS_PER_YEAR),
    months: sign * Math.floor((n % DAYS_PER_YEAR) / DAYS_PER_MONTH),
    days: sign * (n % DAYS_PER_MONTH),
  };
}

// ── 날짜 유틸 (UTC 기준으로 다뤄 타임존 영향 제거) ────────────────────────
export type YMD = { y: number; m: number; d: number };

function daysInMonth(year: number, month1: number): number {
  // month1: 1-12
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

function toEpochDay(dt: YMD): number {
  return Math.floor(Date.UTC(dt.y, dt.m - 1, dt.d) / 86400000);
}

function fromEpochDay(days: number): YMD {
  const dd = new Date(days * 86400000);
  return { y: dd.getUTCFullYear(), m: dd.getUTCMonth() + 1, d: dd.getUTCDate() };
}

export function addDays(dt: YMD, n: number): YMD {
  return fromEpochDay(toEpochDay(dt) + n);
}

export function compareYMD(a: YMD, b: YMD): number {
  return toEpochDay(a) - toEpochDay(b);
}

export function ymdText(dt: YMD): string {
  return `${dt.y}.${String(dt.m).padStart(2, "0")}.${String(dt.d).padStart(2, "0")}`;
}

// cursor 부터 «1개월»이 끝난 다음 날 (민법 제160조)
function nextPeriodStart(cursor: YMD): YMD {
  const [year, month] =
    cursor.m === 12 ? [cursor.y + 1, 1] : [cursor.y, cursor.m + 1];
  const last = daysInMonth(year, month);
  if (cursor.d <= last) return { y: year, m: month, d: cursor.d };
  return addDays({ y: year, m: month, d: last }, 1);
}

// 시작일부터 종료일까지의 기간(종료일 포함). 「민법」 제160조 역법.
export function between(start: YMD, end: YMD): Period {
  if (compareYMD(end, start) < 0) return { ...ZERO };

  const exclusive = addDays(end, 1); // 종료일 포함 → 그 다음 날까지
  let months = 0;
  let cursor = start;
  for (;;) {
    const nxt = nextPeriodStart(cursor);
    if (compareYMD(nxt, exclusive) > 0) break;
    months += 1;
    cursor = nxt;
  }
  let days = toEpochDay(exclusive) - toEpochDay(cursor);
  // 30일은 «1월»이므로 남은 날로 30일이 나올 수 없습니다 → 29일로 봅니다.
  if (days === 30) days = 29;
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days,
  };
}

// 환산율 적용. 예) 3년 11월 27일 × 50% = 1년 11월 28일
export function convert(p: Period, ratio: number): Period {
  return fromDays(Math.trunc(totalDays(p) * ratio));
}
