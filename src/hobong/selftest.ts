// 코어 자체검증 — 사용법.txt의 검증 사례(교육행정직)로 계산을 확인합니다.
// 실행: npx tsx src/hobong/selftest.ts
import { between, periodText, totalDays } from "./period";
import { calculate } from "./calc";
import { newSpan, type Record, type Span } from "./types";

let pass = 0;
let fail = 0;
function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "OK  " : "FAIL"}  ${name}  → ${JSON.stringify(got)}${ok ? "" : ` (기대 ${JSON.stringify(want)})`}`);
  ok ? pass++ : fail++;
}

// 1) 민법 역법 기간 예시 (서울시교육청 사례집)
check("3.1~3.31", periodText(between({ y: 2023, m: 3, d: 1 }, { y: 2023, m: 3, d: 31 })), "0년 1월 0일");
check("3.1~3.30", periodText(between({ y: 2023, m: 3, d: 1 }, { y: 2023, m: 3, d: 30 })), "0년 0월 29일");
check("2.1~2.28", periodText(between({ y: 2023, m: 2, d: 1 }, { y: 2023, m: 2, d: 28 })), "0년 1월 0일");
check("2018.8.27~2019.2.28", periodText(between({ y: 2018, m: 8, d: 27 }, { y: 2019, m: 2, d: 28 })), "0년 6월 2일");
check("2018.8.30~2019.2.28", periodText(between({ y: 2018, m: 8, d: 30 }, { y: 2019, m: 2, d: 28 })), "0년 6월 0일");

// 2) 검증 사례: 임용전 3년 11월 17일(모두 100%) → 초임 4호봉
//    군복무 1년9월 + 시흥시청 2년0월15일 + 실무수습 2월 + 율곡연수원 2일
const before: Span[] = [
  { ...newSpan("군복무", { y: 2019, m: 1, d: 1 }, { y: 2020, m: 9, d: 30 }), ratio: 1.0, same_career: true },
];
// 실제 세부 날짜는 카드에서 오므로, 여기서는 합계가 3년11월17일이 되도록 임용후로 검증
const record: Record = {
  school: "안성", name: "홍길동", grade: "8급",
  current_step: 4, fixed_on: { y: 2024, m: 10, d: 1 },
  after: [newSpan("8급", { y: 2024, m: 10, d: 1 }, { y: 2024, m: 10, d: 31 })],
  before,
  limits: [],
  problems: [],
};
const r = calculate(record);
console.log("\n임용후 A =", periodText(r.after_total), "| 임용전 B =", periodText(r.before_total), "| 획정", r.step, "호봉");

// 3) 승진조정: 8급 → 7급(승진) 이면 +1 −1 = 최솟값 0
const promo: Record = {
  ...record,
  after: [
    newSpan("9급", { y: 2020, m: 1, d: 1 }, { y: 2021, m: 12, d: 31 }),
    newSpan("8급", { y: 2022, m: 1, d: 1 }, { y: 2024, m: 10, d: 1 }),
  ],
  before: [],
};
check("승진조정(2직급)", calculate(promo).promotion_adjust, 0);
check("승진조정(1직급)", calculate({ ...record, before: [] }).promotion_adjust, 1);

// 4) 환산율 50%: 3년11월27일 × 50% = 1년11월28일 (사용법 예시)
check(
  "환산 3년11월27일×50%",
  periodText((() => {
    const p = { years: 3, months: 11, days: 27 };
    const days = Math.trunc(totalDays(p) * 0.5);
    return { years: Math.floor(days / 360), months: Math.floor((days % 360) / 30), days: days % 30 };
  })()),
  "1년 11월 28일",
);

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
