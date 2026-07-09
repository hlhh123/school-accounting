// 직무달력: 월별 해야 할 일 (예시 템플릿 — 실제 일정으로 교체/추가 가능)
export type DutyTask = { day?: number; title: string; detail?: string };

export const dutyCalendar: Record<number, DutyTask[]> = {
  1: [
    { day: 10, title: "급여 연말정산 자료 취합", detail: "소득·세액공제 증빙 수합 및 검토" },
    { day: 20, title: "성과상여금 지급 준비" },
    { title: "1월분 급여 지급" },
  ],
  2: [
    { day: 10, title: "학교회계 결산 자료 정리" },
    { day: 25, title: "인사이동 대상자 급여 정리" },
  ],
  3: [
    { day: 2, title: "신학기 급여 세팅", detail: "인사발령 반영, 기간제교원 계약 등록" },
    { day: 15, title: "본예산 배정·집행 시작" },
  ],
  4: [
    { day: 10, title: "1분기 예산 집행률 점검" },
    { day: 20, title: "맞춤형복지 배정 안내" },
  ],
  5: [
    { day: 12, title: "근로소득 간이지급명세서 제출" },
    { day: 25, title: "스승의날 관련 복무·경비 정리" },
  ],
  6: [
    { day: 15, title: "상반기 결산 준비" },
    { day: 30, title: "1학기 기간제교원 계약 만료 점검" },
  ],
  7: [
    { day: 10, title: "성과상여금 지급 점검" },
    { day: 20, title: "하반기 예산 집행 계획 점검" },
    { title: "방학 중 복무 관리" },
  ],
  8: [
    { day: 20, title: "2학기 기간제교원 계약 등록" },
    { day: 28, title: "2학기 급여 세팅" },
  ],
  9: [
    { day: 5, title: "추석 상여·경비 지급" },
    { day: 25, title: "3분기 예산 집행률 점검" },
  ],
  10: [
    { day: 15, title: "연말정산 대비 안내" },
    { day: 25, title: "차년도 예산요구 준비" },
  ],
  11: [
    { day: 10, title: "차년도 본예산 편성 작업" },
    { day: 20, title: "맞춤형복지 잔여예산 정리" },
  ],
  12: [
    { day: 10, title: "지출 마감·이월 정리" },
    { day: 20, title: "연말 결산" },
    { day: 28, title: "연가보상비 산정" },
  ],
};

export function monthTasks(month: number): DutyTask[] {
  return dutyCalendar[month] ?? [];
}
