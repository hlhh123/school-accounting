// 호봉 계산과 «책정근거» 생성 — 파이썬 hobong/calc.py 이식.
//
// A 임용후 경력   : 직급별 재직기간을 그대로 합산
// B 임용전 경력   : 기간 × 환산율
// C 제한(제외)기간 : 징계 등으로 승급이 제한된 기간
// 산정경력 = A − C,  호봉경력 = 산정경력 + B
// 획정호봉 = (호봉경력 ÷ 360일) + 승진조정
// 승진조정 = 첫 직급 +1, 이후 승진마다 −1 한 누계의 최솟값

import {
  DAYS_PER_MONTH,
  DAYS_PER_YEAR,
  convert,
  compareYMD,
  fromDays,
  periodText,
  totalDays,
  type Period,
  type YMD,
  ymdText,
} from "./period";
import { spanPeriod, type Record, type Span } from "./types";

export type Line = {
  section: "임용후" | "임용전" | "제한";
  label: string;
  span: string;
  period: Period;
  ratio: number | null;
  converted: Period;
  start: YMD | null;
  end: YMD | null;
  same_career: boolean;
};

export type Result = {
  record: Record;
  lines: Line[];
  after_total: Period;
  before_total: Period;
  limit_total: Period;
  counted: Period;
  career: Period;
  promotion_adjust: number;
  step: number;
  remainder_months: number;
  remainder_days: number;
  next_raise: YMD | null;
  same_career: Period;
  service: Period;
  service_years: number;
  service_remainder_months: number;
  service_remainder_days: number;
  next_service_change: YMD | null;
  reasons: string[];
  warnings: string[];
  current_step: number | null;
  gap: number | null;
};

function spanTextOf(s: Span): string {
  return `${ymdText(s.start)} ~ ${ymdText(s.end)}`;
}

function pct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function calculate(record: Record): Result {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const lines: Line[] = [];
  const say = (s: string) => reasons.push(s);

  say(
    `■ ${record.school || "소속미상"} / ${record.name || "성명미상"}` +
      ` / ${record.grade || "직급미상"}` +
      (record.fixed_on ? ` / 호봉획정일 ${ymdText(record.fixed_on)}` : ""),
  );
  say("");

  // ── A. 임용후 경력 ─────────────────────────────────────────
  say("【A】 임용후 경력");
  let afterDays = 0;
  for (const span of record.after) {
    const p = spanPeriod(span);
    afterDays += totalDays(p);
    lines.push({
      section: "임용후",
      label: span.label,
      span: spanTextOf(span),
      period: p,
      ratio: null,
      converted: p,
      start: span.start,
      end: span.end,
      same_career: true,
    });
    say(`  · ${span.label}  ${spanTextOf(span)}  →  ${periodText(p)}`);
  }
  const afterTotal = fromDays(afterDays);
  say(`  합계 A = ${periodText(afterTotal)}  (${afterDays}일)`);
  say("");

  // ── B. 임용전·유사경력 ─────────────────────────────────────
  say("【B】 임용전·유사경력 (환산율 적용)");
  let beforeDays = 0;
  if (record.before.length === 0) say("  · 없음");
  for (const span of record.before) {
    const p = spanPeriod(span);
    const c = convert(p, span.ratio);
    beforeDays += totalDays(c);
    lines.push({
      section: "임용전",
      label: span.label,
      span: spanTextOf(span),
      period: p,
      ratio: span.ratio,
      converted: c,
      start: span.start,
      end: span.end,
      same_career: span.same_career,
    });
    say(
      `  · ${span.label}  ${spanTextOf(span)}  →  ${periodText(p)}` +
        `  × ${pct(span.ratio)}  =  ${periodText(c)}`,
    );
  }
  const beforeTotal = fromDays(beforeDays);
  say(`  합계 B = ${periodText(beforeTotal)}  (${beforeDays}일)`);
  say("");

  // ── C. 제한(제외) 기간 ─────────────────────────────────────
  say("【C】 제한(제외) 기간");
  let limitDays = 0;
  if (record.limits.length === 0) say("  · 없음");
  for (const span of record.limits) {
    const p = spanPeriod(span);
    limitDays += totalDays(p);
    lines.push({
      section: "제한",
      label: span.label,
      span: spanTextOf(span),
      period: p,
      ratio: null,
      converted: p,
      start: span.start,
      end: span.end,
      same_career: true,
    });
    say(`  · ${span.label}  ${spanTextOf(span)}  →  ${periodText(p)}`);
  }
  const limitTotal = fromDays(limitDays);
  say(`  합계 C = ${periodText(limitTotal)}  (${limitDays}일)`);
  say("");

  // ── 산정경력 · 호봉경력 ────────────────────────────────────
  const countedDays = afterDays - limitDays;
  const careerDays = countedDays + beforeDays;
  const counted = fromDays(countedDays);
  const career = fromDays(careerDays);

  say("【산정】");
  say(
    `  산정경력 = A − C = ${periodText(afterTotal)} − ${periodText(limitTotal)} = ${periodText(counted)}  (${countedDays}일)`,
  );
  say(
    `  호봉경력 = 산정경력 + B = ${periodText(counted)} + ${periodText(beforeTotal)} = ${periodText(career)}  (${careerDays}일)`,
  );
  say("");

  // ── 승진 조정 ─────────────────────────────────────────────
  const promotionAdjust = promotionAdjustOf(record.after);
  const grades = record.after.map((s) => s.label).join(" → ") || "없음";
  say("【승진 조정】");
  say(`  직급 이동: ${grades}`);
  say(
    `  첫 직급 +1, 이후 승진마다 −1 한 누계의 최솟값 = ${signed(promotionAdjust)}호봉`,
  );
  say("");

  // ── 획정 호봉 ─────────────────────────────────────────────
  const baseYears = Math.floor(careerDays / DAYS_PER_YEAR);
  const remainder = careerDays % DAYS_PER_YEAR;
  const remainderMonths = Math.floor(remainder / DAYS_PER_MONTH);
  const remainderDays = remainder % DAYS_PER_MONTH;
  const step = baseYears + promotionAdjust;

  say("【결과】");
  say(
    `  호봉경력 ${careerDays}일 ÷ 360일 = ${baseYears}년 (잔여 ${remainderMonths}월 ${remainderDays}일)`,
  );
  say(`  획정호봉 = ${baseYears} ${signed(promotionAdjust)} = ${step}호봉`);

  let nextRaise: YMD | null = null;
  if (record.fixed_on) {
    nextRaise = nextRaiseOf(record.fixed_on, remainderMonths);
    say(
      `  차기승급일 = ${ymdText(record.fixed_on)} 기준, 잔여 ${remainderMonths}월 반영 → ${ymdText(nextRaise)}`,
    );
  }

  // ── 근무연수 ──────────────────────────────────────────────
  say("");
  say("【근무연수】  동일경력만 산입 (유사경력은 환산율이 100%여도 미산입)");
  let sameDays = 0;
  for (const span of record.before) {
    const p = spanPeriod(span);
    if (span.same_career) {
      sameDays += totalDays(p);
      say(
        `  · 산입   ${span.label}  ${periodText(p)}  (동일경력, 환산율 ${pct(span.ratio)})`,
      );
    } else {
      say(
        `  · 미산입 ${span.label}  ${periodText(p)}  (유사경력, 환산율 ${pct(span.ratio)})`,
      );
    }
  }
  const serviceDays = countedDays + sameDays;
  const sameCareer = fromDays(sameDays);
  const service = fromDays(serviceDays);
  const serviceYears = Math.floor(serviceDays / DAYS_PER_YEAR);
  const serviceRemainder = serviceDays % DAYS_PER_YEAR;
  const serviceRemainderMonths = Math.floor(serviceRemainder / DAYS_PER_MONTH);
  const serviceRemainderDays = serviceRemainder % DAYS_PER_MONTH;
  say(
    `  근무연수경력 = 산정경력 ${periodText(counted)} + 동일경력 ${periodText(sameCareer)} = ${periodText(service)}  (${serviceDays}일)`,
  );
  say(
    `  근무연수 = ${serviceYears}년 (잔여 ${serviceRemainderMonths}월 ${serviceRemainderDays}일)`,
  );
  let nextServiceChange: YMD | null = null;
  if (record.fixed_on) {
    nextServiceChange = nextRaiseOf(record.fixed_on, serviceRemainderMonths);
    say(`  차기 근무년 변경일 = ${ymdText(nextServiceChange)}`);
  }
  if (record.limits.length > 0) {
    say(
      "  ※ 징계로 인한 제한기간이 있어 실제 승급일·근무년 변경일은 호봉 재획정 시점에 따라 달라질 수 있습니다.",
    );
    warnings.push(
      "징계 제한기간이 있는 사람입니다. 호봉·근무연수 «연수»는 맞지만, 차기 승급일과 근무년 변경일은 재획정 시점에 따라 달라질 수 있으니 확인하세요.",
    );
  }
  say("");

  let gap: number | null = null;
  if (record.current_step !== null) {
    gap = record.current_step - step;
    if (gap === 0) {
      say(`  현 호봉 ${record.current_step}호봉과 일치합니다.`);
    } else {
      const direction = gap > 0 ? "과다" : "과소";
      say(
        `  ※ 현 호봉 ${record.current_step}호봉 → 획정 ${step}호봉, ${Math.abs(gap)}호봉 ${direction}`,
      );
      warnings.push(
        `현 호봉(${record.current_step})과 획정 호봉(${step})이 ${Math.abs(gap)}호봉 다릅니다(${direction}).`,
      );
    }
  }

  warnings.push(...record.problems);
  warnings.push(...overlapWarnings(record));

  return {
    record,
    lines,
    after_total: afterTotal,
    before_total: beforeTotal,
    limit_total: limitTotal,
    counted,
    career,
    promotion_adjust: promotionAdjust,
    step,
    remainder_months: remainderMonths,
    remainder_days: remainderDays,
    next_raise: nextRaise,
    same_career: sameCareer,
    service,
    service_years: serviceYears,
    service_remainder_months: serviceRemainderMonths,
    service_remainder_days: serviceRemainderDays,
    next_service_change: nextServiceChange,
    reasons,
    warnings,
    current_step: record.current_step,
    gap,
  };
}

function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function promotionAdjustOf(after: Span[]): number {
  if (after.length === 0) return 0;
  let running = 0;
  const values: number[] = [];
  for (let i = 0; i < after.length; i++) {
    running += i === 0 ? 1 : -1;
    values.push(running);
  }
  return Math.min(...values);
}

function nextRaiseOf(fixedOn: YMD, remainderMonths: number): YMD {
  let year = fixedOn.y + 1;
  let month = fixedOn.m - remainderMonths;
  while (month <= 0) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  return { y: year, m: month, d: 1 };
}

function overlapWarnings(record: Record): string[] {
  const out: string[] = [];
  const spans: [string, Span][] = [
    ...record.after.map((s) => ["임용후", s] as [string, Span]),
    ...record.before.map((s) => ["임용전", s] as [string, Span]),
  ];
  for (let i = 0; i < spans.length; i++) {
    for (let j = i + 1; j < spans.length; j++) {
      const [secA, a] = spans[i];
      const [secB, b] = spans[j];
      if (compareYMD(a.start, b.end) <= 0 && compareYMD(b.start, a.end) <= 0) {
        out.push(
          `기간이 겹칩니다: [${secA}] ${a.label} ${spanTextOf(a)} ↔ [${secB}] ${b.label} ${spanTextOf(b)}`,
        );
      }
    }
  }
  return out;
}
