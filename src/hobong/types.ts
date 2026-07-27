// 호봉획정 데이터 모델 — 파이썬 hobong/form.py 의 Span/Record 이식.
import { between, type Period, type YMD } from "./period";

export type Span = {
  label: string;
  start: YMD;
  end: YMD;
  ratio: number; // 환산율 (임용전 경력에만 의미)
  same_career: boolean; // 근무연수 산입(=동일경력) 여부. 환산율과 별개.
  reason?: string; // 판정 근거(자동 분류 시)
  certain?: boolean; // 카드만으로 확정 가능한 판단인가
};

export function spanPeriod(s: Span): Period {
  return between(s.start, s.end);
}

export type Record = {
  school: string;
  name: string;
  grade: string;
  current_step: number | null;
  fixed_on: YMD | null;
  after: Span[]; // 임용후 경력(A)
  before: Span[]; // 임용전·유사경력(B)
  limits: Span[]; // 제한(제외)기간(C)
  problems: string[];
};

export function newSpan(label: string, start: YMD, end: YMD): Span {
  return { label, start, end, ratio: 1.0, same_career: true };
}
