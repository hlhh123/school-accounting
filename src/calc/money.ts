// 공무직 급여 계산기 공용 유틸 — 금액 처리.

// 원 단위 정수 → "1,234,560" 표시
export function won(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("ko-KR");
}

// 입력 문자열(콤마·비숫자 포함) → 숫자
export function parseWon(s: string): number {
  const n = Number(String(s).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// 엑셀 ROUNDDOWN(x, -1) = 10원 단위 내림
export function floor10(n: number): number {
  return Math.floor(n / 10) * 10;
}

// 엑셀 ROUNDUP(x, -1) = 10원 단위 올림
export function ceil10(n: number): number {
  return Math.ceil(n / 10) * 10;
}
