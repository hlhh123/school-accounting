// 계산기 레지스트리 — «계산기» 탭 안에서 여러 계산기를 서브탭으로 보여줍니다.
//
// ▶ 계산기를 새로 추가하려면:
//   1) 계산기 컴포넌트를 src/ 에 만들고 export default 로 내보냅니다.
//   2) 아래 CALCULATORS 의 해당 분야 배열에 한 줄 추가합니다.
//        { key, title, desc, Component: lazy(() => import("./새컴포넌트")) }
//   → 서브탭이 자동으로 생깁니다. (각 계산기는 지연 로딩되어 별도 청크로 분리됨)

import {
  lazy,
  Suspense,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from "react";

const HobongCalculator = lazy(() => import("./HobongCalculator"));
const DcRetirement = lazy(() => import("./calc/DcRetirement"));
const Insurance4 = lazy(() => import("./calc/Insurance4"));
const Preparing = lazy(() => import("./calc/Preparing"));

export type CalcEntry = {
  key: string;
  title: string; // 서브탭에 보일 이름
  desc?: string; // 서브탭 아래 짧은 설명
  Component: LazyExoticComponent<ComponentType>;
};

// 분야(가이드 slug) → 계산기 목록. 위에서부터 순서대로 서브탭이 만들어집니다.
export const CALCULATORS: Record<string, CalcEntry[]> = {
  "salary-official": [
    {
      key: "hobong-local",
      title: "공무원 호봉(근속년수)",
      desc: "나이스 «개인인사기록카드» 엑셀을 올리면 획정호봉·근무연수·차기승급일을 계산합니다. 임용전 경력의 환산율·동일경력은 자동 판정되며 아래에서 직접 조정할 수 있습니다.",
      Component: HobongCalculator,
    },
    // 앞으로 추가할 계산기 예시:
    // {
    //   key: "yeobi",
    //   title: "국내 여비",
    //   desc: "출장 일수·등급으로 여비를 계산합니다.",
    //   Component: lazy(() => import("./YeobiCalculator")),
    // },
  ],
  // 공무직급여 계산기 — 교육공무직원 급여 서식(01~05)을 웹으로 재구성.
  "salary-worker": [
    {
      key: "f01",
      title: "통상임금·퇴직금·연차수당",
      desc: "통상임금 산정 → 퇴직금·연차수당을 통합 산출합니다. (구현 예정)",
      Component: Preparing,
    },
    {
      key: "f02",
      title: "4대보험 부담금",
      desc: "보수월액으로 개인·기관 부담 4대보험료를 계산합니다(2026년 요율).",
      Component: Insurance4,
    },
    {
      key: "f03",
      title: "확정기여형(DC) 퇴직금",
      desc: "연간 임금 항목으로 연간임금총액(A)과 DC 적립퇴직금(A÷12)을 계산합니다.",
      Component: DcRetirement,
    },
    {
      key: "f04",
      title: "급식조리원 DB 퇴직금",
      desc: "기본급·근속수당으로 1일 통상임금·연차수당·퇴직금을 계산합니다. (구현 예정)",
      Component: Preparing,
    },
    {
      key: "f05",
      title: "시설당직원 연차·미사용수당",
      desc: "요일별 근무시간으로 연차일수·미사용수당을 계산합니다. (구현 예정)",
      Component: Preparing,
    },
  ],
};

export function CalculatorTabs({
  slug,
  itemTitle,
}: {
  slug?: string;
  itemTitle: string;
}) {
  const list = (slug && CALCULATORS[slug]) || [];
  const [active, setActive] = useState(list[0]?.key ?? "");

  if (list.length === 0) {
    return (
      <div className="detail-placeholder">
        <p className="detail-placeholder-title">준비 중입니다</p>
        <p>«{itemTitle}» 계산기 기능이 이곳에 추가될 예정입니다.</p>
      </div>
    );
  }

  const current = list.find((c) => c.key === active) ?? list[0];
  const Active = current.Component;

  return (
    <div className="calc">
      <div className="calc-tabs" role="tablist">
        {list.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={c.key === current.key}
            className={`calc-tab${c.key === current.key ? " is-active" : ""}`}
            onClick={() => setActive(c.key)}
          >
            {c.title}
          </button>
        ))}
      </div>

      {current.desc && <p className="calc-desc">{current.desc}</p>}

      <Suspense fallback={<p className="guide-empty">계산기를 불러오는 중…</p>}>
        <Active key={current.key} />
      </Suspense>
    </div>
  );
}
