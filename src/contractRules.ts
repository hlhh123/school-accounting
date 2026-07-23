// 계약방법 찾기(계약 길잡이) — 데이터 + 판정 로직
//
// 근거: 경기도교육청 학교 업무매뉴얼 «제13편 계약» 및 그 첨부자료,
//       「지방자치단체를 당사자로 하는 계약에 관한 법률」 시행령·시행규칙,
//       「지방자치단체 입찰 및 계약 집행기준」(행정안전부 예규).
//
// 금액 단위는 "만원"으로 두고 계산 시 원으로 환산합니다.

// ── 수의계약 금액 기준 ─────────────────────────────────────────────────────
// 1인 견적서 제출 가능(일반) — 시행령 §25①5, 집행기준 제5장
export const QUOTE_ONE_LIMIT = 2000; // 2천만원
// 여성기업·장애인기업·사회적경제기업 특례 1인 견적 상한
export const QUOTE_SPECIAL_LIMIT = 5000; // 5천만원
// 견적서 제출 생략(물품·용역) — 시행규칙 §33
export const QUOTE_SKIP_LIMIT = 200; // 200만원

// 경기도교육청 발주처별 연간 동일업체 수의계약 횟수 제한
// (계약업무 개선사항, 재무관리과 2025. 2. / 시행 2025. 4. 1.)
export const REPEAT_RULE = {
  minAmount: 1000, // 추정가격 1천만원 이상 1인 견적 수의계약 요청 시 적용
  maxCount: 5, // 동일업체 회계연도 내 5회까지
  periodSchool: "학교 3월~다음연도 2월 (본청·교육지원청·직속기관은 1월~12월)",
  exceptions: [
    "지정정보처리장치로 2인 이상 견적서를 받은 경우",
    "사회적 배려 기업 등과의 계약(시행령 §30①2)",
    "긴급을 요하는 경우(재난·재해 복구, 소규모 시설수선 등)",
    "학생 안전을 우선 고려(급식 식자재, 돌봄 간식, 현장체험학습 버스 임차 등)",
  ],
  overNote: "5회를 초과하면 «수의계약 요청 사유서»를 작성해야 합니다(의무).",
};

// 견적서 제출방법
export const QUOTE_SUBMIT = {
  one: "1인 견적서 — 학교장터(S2B) 견적요청 기능 활용 권고",
  two: "지정정보처리장치 안내공고(공고기간 3일 이상, 토·공휴일 제외)",
};

// ── 분류 ───────────────────────────────────────────────────────────────────
export type ContractType = {
  code: string;
  label: string;
  /** 2인 이상 견적제출 수의계약 한도(만원). 0이면 금액과 무관한 별도 절차 */
  soLimit: number;
  /** 여성·장애인·사회적경제기업 1인 견적 특례 상한(만원) */
  specialLimit?: number;
  /** 계약심사(원가심사) 대상 기준 — 추정금액 기준(만원) */
  reviewLimit?: number;
  note?: string;
};

export type ContractField = {
  code: string;
  label: string;
  kind: "construction" | "goods" | "service";
  /** 일상감사 대상 기준 — 추정가격 기준(만원, 공립학교) */
  auditLimit: number;
  /** 수의계약 견적 낙찰하한율 안내 */
  lowestRate: string;
  types: ContractType[];
};

export const CONTRACT_FIELDS: ContractField[] = [
  {
    code: "construction",
    label: "공사",
    kind: "construction",
    auditLimit: 50000, // 5억원
    lowestRate:
      "예정가격에서 국민연금보험료 등 법정경비를 뺀 금액 대비 89.745% 이상 중 최저가",
    types: [
      {
        code: "build-general",
        label: "종합공사",
        soLimit: 40000, // 4억원
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 50000, // 종합공사 추정금액 5억원 이상
        note: "「건설산업기본법」상 종합공사(5종). 분할계약(쪼개기) 금지에 유의.",
      },
      {
        code: "build-pro",
        label: "전문공사",
        soLimit: 20000, // 2억원
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 30000, // 그 밖의 공사 추정금액 3억원 이상
        note: "「건설산업기본법」상 전문공사(14개 대업종).",
      },
      {
        code: "build-etc",
        label: "전기·소방·정보통신 그 밖의 공사",
        soLimit: 16000, // 1억6천만원
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 30000,
        note: "전기·정보통신·소방시설·석면공사 등은 개별법에 따라 분리발주가 원칙.",
      },
    ],
  },
  {
    code: "goods",
    label: "물품",
    kind: "goods",
    auditLimit: 10000, // 1억원
    lowestRate:
      "예정가격 대비 88% 이상 중 최저가 (추정가격 2천만원 이하는 90%, 간행물 구매는 90%)",
    types: [
      {
        code: "goods-buy",
        label: "물품구매",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 2000,
        note: "중소기업자 우선 조달·공공구매 법정비율 확인. 물품선정위원회 심의 여부 검토.",
      },
      {
        code: "goods-make",
        label: "물품제조",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 2000,
      },
      {
        code: "goods-supply",
        label: "조달구매(제3자단가·다수공급자)",
        soLimit: 0,
        note: "조달청 종합쇼핑몰 이용. 제3자단가·다수공급자(MAS) 2단계경쟁 구매는 계약심사 제외.",
      },
      {
        code: "goods-book",
        label: "도서구매(간행물)",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        note: "도서정가제 적용. 간행물은 S2B 이용 시 금액 한도 없음. 계약심사 제외 대상.",
      },
      {
        code: "goods-uniform",
        label: "교복구매(학교주관구매)",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 2000,
        note: "교복 학교주관구매 운영요령에 따른 별도 절차(품질기준·공동구매).",
      },
      {
        code: "goods-album",
        label: "졸업앨범",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 2000,
      },
      {
        code: "goods-milk",
        label: "우유급식",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        note: "급식 식재료에 준하여 처리. 계약심사 제외 대상.",
      },
      {
        code: "goods-food",
        label: "급식 식재료",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        note: "공공급식전자조달시스템(eaT) 이용. 계약심사 제외 대상.",
      },
      {
        code: "goods-supplies",
        label: "학습준비물 구매",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        note: "계약심사 제외 대상. 매뉴얼 «사례3. 학습준비물 구입» 참고.",
      },
    ],
  },
  {
    code: "service",
    label: "용역",
    kind: "service",
    auditLimit: 30000, // 3억원
    lowestRate:
      "예정가격 대비 88% 이상 중 최저가 (추정가격 2천만원 이하는 90%)",
    types: [
      {
        code: "svc-clean",
        label: "청소용역",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 7000,
        note: "용역근로자 근로조건 보호지침·시중노임단가·최저임금 준수 확인.",
      },
      {
        code: "svc-guard",
        label: "유인경비(경비용역)",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 7000,
        note: "경비업법상 허가업체 여부 확인. 시중노임단가 준수.",
      },
      {
        code: "svc-bus",
        label: "전세버스 임차용역",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        note: "현장체험학습 안전매뉴얼 준수. 계약심사 제외(여행 용역), 동일업체 횟수 제한 예외.",
      },
      {
        code: "svc-schoolbus",
        label: "통학(스쿨)버스",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 7000,
        note: "어린이통학버스 신고·안전기준 확인.",
      },
      {
        code: "svc-training",
        label: "수련활동·수학여행",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        note: "현장체험학습 용역은 계약심사 제외 대상.",
      },
      {
        code: "svc-afterschool",
        label: "늘봄(방과후)학교 용역",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        note: "늘봄(방과후)학교 용역은 계약심사 제외 대상.",
      },
      {
        code: "svc-meal",
        label: "일부위탁급식 / 배식도우미",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 7000,
        note: "학교급식법상 위탁 범위·근로자 관리 확인.",
      },
      {
        code: "svc-tech",
        label: "기술용역(설계·감리·측량)",
        soLimit: 10000,
        specialLimit: QUOTE_SPECIAL_LIMIT,
        reviewLimit: 7000,
      },
    ],
  },
];

// ── 결과 타입 ──────────────────────────────────────────────────────────────
export type MethodStatus = "recommended" | "possible" | "unavailable";

export type MethodResult = {
  key: string;
  label: string;
  status: MethodStatus;
  reason: string;
  submit?: string;
};

export type FinderStep = {
  title: string;
  points: string[];
  refs?: string[];
};

export type CheckItem = {
  label: string;
  hit: boolean;
  detail: string;
};

export type FinderResult = {
  field: ContractField;
  type: ContractType;
  price: number;
  bandLabel: string;
  methods: MethodResult[];
  checks: CheckItem[]; // 계약심사·일상감사·반복 수의계약 등
  system: string; // 이용할 지정정보처리장치
  steps: FinderStep[];
};

const won = (manwon: number) => manwon * 10000;
const fmt = (n: number) => n.toLocaleString("ko-KR");

export function manwonText(manwon: number): string {
  if (manwon <= 0) return "0원";
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  const cheonman = Math.floor(rest / 1000);
  const man = rest % 1000;
  let s = "";
  if (eok) s += `${eok}억`;
  if (cheonman) s += `${eok ? " " : ""}${cheonman}천만`;
  if (man) s += `${s ? " " : ""}${man}만`;
  return (s || `${manwon}만`) + "원";
}

// ── 계약방법 판정 ──────────────────────────────────────────────────────────
export function decideMethods(
  field: ContractField,
  type: ContractType,
  price: number,
): MethodResult[] {
  const methods: MethodResult[] = [];

  if (type.soLimit === 0) {
    methods.push({
      key: "supply",
      label: "조달청 종합쇼핑몰 구매",
      status: "recommended",
      reason:
        "제3자단가·다수공급자(MAS) 계약 물품은 별도 입찰 없이 종합쇼핑몰에서 구매합니다. 2단계경쟁 대상인지 확인하세요.",
    });
    methods.push({
      key: "bid",
      label: "경쟁입찰",
      status: "possible",
      reason: "쇼핑몰 미등록 품목이면 일반 물품구매 절차(입찰·수의)로 진행합니다.",
    });
    return methods;
  }

  const specialMax = type.specialLimit ?? 0;
  const soLimitWon = won(type.soLimit);
  const oneLimitWon = won(QUOTE_ONE_LIMIT);
  const specialWon = won(specialMax);
  const isGoodsOrService = field.kind !== "construction";

  // 견적서 제출 생략(물품·용역 200만원 미만)
  if (isGoodsOrService && price < won(QUOTE_SKIP_LIMIT)) {
    methods.push({
      key: "skip",
      label: "견적서 제출 생략",
      status: "recommended",
      reason: `추정가격 ${manwonText(
        QUOTE_SKIP_LIMIT,
      )} 미만인 물품·용역은 견적서 제출을 생략할 수 있습니다(신용카드 구매 포함).`,
    });
  }

  // 1인 견적
  if (price <= oneLimitWon) {
    methods.push({
      key: "quote1",
      label: "1인 견적서 제출 수의계약",
      status: "recommended",
      reason: `추정가격이 1인 견적 한도(${manwonText(QUOTE_ONE_LIMIT)}) 이하입니다.`,
      submit: QUOTE_SUBMIT.one,
    });
  } else if (specialMax && price <= specialWon) {
    methods.push({
      key: "quote1-special",
      label: "1인 견적 수의계약 — 여성·장애인·사회적경제기업",
      status: "recommended",
      reason: `여성기업·장애인기업 또는 취약계층 고용 30% 이상 사회적경제기업이면 ${manwonText(
        specialMax,
      )}까지 1인 견적이 가능합니다.`,
      submit: QUOTE_SUBMIT.one,
    });
  } else {
    methods.push({
      key: "quote1",
      label: "1인 견적서 제출 수의계약",
      status: "unavailable",
      reason: `추정가격이 1인 견적 한도(${manwonText(
        QUOTE_ONE_LIMIT,
      )}, 특례기업 ${manwonText(QUOTE_SPECIAL_LIMIT)})를 초과합니다. 하자 구분곤란·천재지변 등 별도 사유는 예외.`,
    });
  }

  // 2인 이상 견적제출
  const twoMax = Math.max(soLimitWon, specialWon);
  if (price > oneLimitWon && price <= twoMax) {
    methods.push({
      key: "quote2",
      label: "2인 이상 견적제출 수의계약",
      status: "recommended",
      reason: `추정가격이 수의계약 한도(${manwonText(
        type.soLimit,
      )}) 이내입니다. 계약상대방을 지정하지 않고 안내공고로 견적서를 받습니다.`,
      submit: QUOTE_SUBMIT.two,
    });
  } else if (price <= oneLimitWon) {
    methods.push({
      key: "quote2",
      label: "2인 이상 견적제출 수의계약",
      status: "possible",
      reason:
        "1인 견적 대상이지만, 2인 이상 견적을 받으면 동일업체 횟수 제한에서 제외됩니다.",
      submit: QUOTE_SUBMIT.two,
    });
  }

  // 경쟁입찰
  if (price > soLimitWon) {
    methods.push({
      key: "bid",
      label: "경쟁입찰(적격심사)",
      status: "recommended",
      reason: `추정가격이 수의계약 한도(${manwonText(
        type.soLimit,
      )})를 초과하여 경쟁입찰 대상입니다. 유효한 2인 이상 입찰로 성립합니다.`,
    });
  } else {
    methods.push({
      key: "bid",
      label: "경쟁입찰(적격심사)",
      status: "possible",
      reason: "수의계약 대상이지만, 필요 시 경쟁입찰로 진행할 수 있습니다.",
    });
  }

  return methods;
}

// ── 사전 확인사항(계약심사·일상감사·반복 수의계약) ────────────────────────
function buildChecks(
  field: ContractField,
  type: ContractType,
  price: number,
): CheckItem[] {
  const checks: CheckItem[] = [];

  // 계약심사는 '추정금액' 기준 → 추정가격 + 부가세(10%)로 근사
  const estTotal = Math.round(price * 1.1);
  if (type.reviewLimit) {
    const hit = estTotal >= won(type.reviewLimit);
    checks.push({
      label: "계약심사(재무관리과)",
      hit,
      detail: hit
        ? `추정금액 약 ${fmt(estTotal)}원으로 기준(${manwonText(
            type.reviewLimit,
          )} 이상)에 해당합니다. 재무관리과에 계약심사를 요청하세요.`
        : `기준(${manwonText(type.reviewLimit)} 이상) 미만으로 계약심사 대상이 아닙니다.`,
    });
  } else {
    checks.push({
      label: "계약심사(재무관리과)",
      hit: false,
      detail: "해당 유형은 계약심사 제외 대상입니다.",
    });
  }

  const auditHit = price >= won(field.auditLimit);
  checks.push({
    label: "일상감사(감사관)",
    hit: auditHit,
    detail: auditHit
      ? `추정가격이 ${manwonText(
          field.auditLimit,
        )} 이상으로 공립학교 일상감사 대상입니다.`
      : `${manwonText(field.auditLimit)} 미만으로 일상감사 대상이 아닙니다.`,
  });

  const repeatHit = price >= won(REPEAT_RULE.minAmount);
  checks.push({
    label: "동일업체 수의계약 횟수 제한",
    hit: repeatHit,
    detail: repeatHit
      ? `추정가격 ${manwonText(
          REPEAT_RULE.minAmount,
        )} 이상 1인 견적 수의계약은 동일업체 기준 회계연도 내 ${REPEAT_RULE.maxCount}회까지 가능합니다(${REPEAT_RULE.periodSchool}). ${REPEAT_RULE.overNote}`
      : `${manwonText(REPEAT_RULE.minAmount)} 미만으로 횟수 제한 적용 대상이 아닙니다.`,
  });

  return checks;
}

// ── 지정정보처리장치 안내 ──────────────────────────────────────────────────
function systemFor(
  field: ContractField,
  type: ContractType,
  price: number,
): string {
  if (type.code === "goods-food" || type.code === "goods-milk")
    return "공공급식전자조달시스템(eaT) — 급식 식재료 입찰";
  if (type.code === "goods-supply") return "나라장터(G2B) 종합쇼핑몰";
  if (type.code === "goods-book")
    return "학교장터(S2B) — 간행물 구매는 금액 한도 없이 이용 가능";

  if (field.kind === "construction") {
    if (price <= won(QUOTE_ONE_LIMIT))
      return "학교장터(S2B) 또는 나라장터(G2B) — 공사 1인수의·입찰은 추정가격 2천만원 이하까지 S2B 이용 가능";
    if (price <= won(type.soLimit))
      return "학교장터(S2B) 또는 나라장터(G2B) — 견적제출 수의계약은 S2B 이용 가능";
    return "나라장터(G2B) — 공사 입찰";
  }

  if (price <= won(10000))
    return "학교장터(S2B) — 물품·용역은 추정가격 1억원 이하까지 이용 가능";
  return "나라장터(G2B) — 추정가격 1억원 초과 물품·용역";
}

function bandLabel(type: ContractType, price: number): string {
  if (price <= 0) return "추정가격을 입력해 주세요.";
  const priceText = `${fmt(price)}원`;
  if (type.soLimit === 0) return `${priceText} · 조달 구매 대상`;
  if (price <= won(QUOTE_ONE_LIMIT)) return `${priceText} · 1인 견적 한도 이하`;
  if (type.specialLimit && price <= won(type.specialLimit))
    return `${priceText} · 특례기업 1인 견적 가능 구간`;
  if (price <= won(type.soLimit))
    return `${priceText} · 수의계약 한도(${manwonText(type.soLimit)}) 이내`;
  return `${priceText} · 수의계약 한도 초과 → 입찰`;
}

// ── 계약 절차(경기도교육청 «제13편 계약» 업무흐름도) ──────────────────────
function buildSteps(field: ContractField, hasBid: boolean): FinderStep[] {
  const flowRef =
    field.kind === "construction"
      ? "13-02-01 공사 계약업무 흐름도"
      : "13-02-02 물품·용역 계약업무 흐름도";

  return [
    {
      title: "Ⅱ. 계약의 추진",
      points: [
        "사업계획(품의) 작성 — 사업부서",
        field.kind === "construction"
          ? "설계서·시방서 확정 후 기초금액 작성(공사 원가계산)"
          : "규격서·과업지시서 확정 후 기초금액 작성",
        "계약심사(재무관리과)·일상감사(감사관) 대상 여부 확인",
        "추정가격에 따른 계약방법 결정 및 자격 결정",
      ],
      refs: [flowRef, "13-02-09 공사 원가계산", "제13편 Ⅱ. 계약의 추진"],
    },
    {
      title: "Ⅲ. 계약 상대자 결정",
      points: hasBid
        ? [
            "입찰방법 결정 후 나라장터(G2B) 등에 입찰공고",
            "기초금액 입력 → 복수예비가격 작성(기초금액 ±3% 중 15개) → 현장설명",
            "개찰 후 적격심사로 낙찰자 결정",
            "부정당업자·수의계약 배제업체 해당 여부 최종 확인",
          ]
        : [
            "견적서 접수 — 안내공고 시 공고기간 3일 이상(토·공휴일 제외)",
            "예정가격 작성절차: 추정가격 → 설계·조사가격 → 기초금액 → (복수예비가격) → 예정가격",
            `낙찰자 결정: ${field.lowestRate}`,
            "수의계약 배제사유·자격요건, 직접생산 여부 확인",
          ],
      refs: hasBid
        ? ["13-03-17 적격심사 서류", "13-03-15 입찰의 무효 사유", "13-03-16 유찰 시 처리 방법"]
        : [
            "13-03-25 1인 수의계약 대상자 결정을 위한 사전점검 리스트",
            "13-03-36 수의계약 배제사유",
            "13-03-26 수의계약 요청 사유서",
          ],
    },
    {
      title: "Ⅳ. 계약의 체결",
      points: [
        "계약서 초안 송부 → 계약응답서 수신 → 계약보증서 징구 → 계약 체결",
        "계약이행 통합 서약서(청렴·클린계약) 징구",
        "수의계약 내역은 경기도교육청 홈페이지 계약공개 메뉴로 자동 공개(매월 10일 업데이트)",
      ],
      refs: [
        "13-04-01 표준계약서(지방계약법 시행규칙)",
        "13-04-03 계약이행 통합 서약서",
        "13-04-05 경기도교육청 클린계약 운영계획",
      ],
    },
    {
      title: "Ⅴ. 계약의 운영",
      points:
        field.kind === "construction"
          ? [
              "착수계·직접시공계획서·안전관리계획 등 접수",
              "노무비 구분관리제·지급확인제, 하도급지킴이 운영",
              "공공요금(수도광열비) 징수, 중대재해 예방 및 현장 안전관리",
              "물가변동·설계변경에 따른 계약금액 조정",
            ]
          : [
              "과업 이행 관리 및 근로조건 보호지침 준수 확인",
              "물가변동·과업내용 변경에 따른 계약금액 조정",
              "계약 해제·해지 사유 발생 시 처리",
            ],
      refs:
        field.kind === "construction"
          ? [
              "13-05-13 공사근로자 노무비 구분관리 및 지급확인제 실무요령",
              "13-05-17 하도급지킴이 업무흐름",
              "13-05-02 중대재해처벌법 업무 매뉴얼",
            ]
          : ["13-05-12 용역근로자 근로조건 보호지침", "13-05-33 물가변동으로 인한 계약금액의 조정"],
    },
    {
      title: "Ⅵ. 계약의 검사와 대가지급",
      points: [
        "이행완료 통지를 받은 날부터 14일 이내 검사(검수)",
        "검사 합격 후 청구를 받은 날부터 5일 이내 대가 지급(토·공휴일 제외)",
        "기성대가는 30일마다 검사·지급",
      ],
      refs:
        field.kind === "construction"
          ? ["13-06-01 준공검사조서", "13-06-04 지연배상금 산출 예시"]
          : ["13-06-02 물품검수조서", "13-06-04 지연배상금 산출 예시"],
    },
    {
      title: "Ⅶ. 계약의 사후관리",
      points:
        field.kind === "construction"
          ? [
              "하자보수보증금 예치 및 하자담보책임기간 관리",
              "하자검사 실시 및 하자보수관리부 기록",
              "계약 사후평가 등록(물품선정위원회 품질하자 평가에 활용)",
            ]
          : [
              "필요 시 하자·품질보증 확인",
              "계약 사후평가 등록(물품선정위원회 품질하자 평가에 활용)",
            ],
      refs: ["13-07-01 하자검사조서", "13-07-02 하자보수관리부"],
    },
  ];
}

export function findContractMethod(
  fieldCode: string,
  typeCode: string,
  price: number,
): FinderResult | null {
  const field = CONTRACT_FIELDS.find((f) => f.code === fieldCode);
  const type = field?.types.find((t) => t.code === typeCode);
  if (!field || !type) return null;

  const methods = decideMethods(field, type, price);
  const hasBid =
    methods.find((m) => m.key === "bid")?.status === "recommended";

  return {
    field,
    type,
    price,
    bandLabel: bandLabel(type, price),
    methods,
    checks: buildChecks(field, type, price),
    system: systemFor(field, type, price),
    steps: buildSteps(field, hasBid),
  };
}

// ── 근거 법령·지침(자료실 표시용) ─────────────────────────────────────────
export const CONTRACT_LAWS: { name: string; note: string }[] = [
  {
    name: "경기도교육청 학교 업무매뉴얼 «제13편 계약»",
    note: "이 검색기의 절차·기준이 근거로 삼은 주 매뉴얼(첨부 13-01~13-07 포함).",
  },
  {
    name: "지방자치단체를 당사자로 하는 계약에 관한 법률 / 시행령 / 시행규칙",
    note: "수의계약(§25·§30)·입찰·낙찰자 결정의 근거 법령.",
  },
  {
    name: "지방자치단체 입찰 및 계약 집행기준(행정안전부 예규)",
    note: "제3장 계약심사 운영요령, 제5장 수의계약 운영요령 등 실무 세부기준.",
  },
  {
    name: "지방자치단체 입찰시 낙찰자 결정기준(행정안전부 예규)",
    note: "적격심사 세부 배점·기준.",
  },
  {
    name: "경기도교육청 계약업무 개선사항(재무관리과, 2025. 2.)",
    note: "동일업체 수의계약 횟수 제한, 수의계약 배제 확대 등(2025. 4. 1. 시행).",
  },
  {
    name: "경기도교육청 계약심사업무 처리 규칙 / 경기도교육비특별회계 재무회계 규칙",
    note: "계약심사 대상·절차 및 회계 처리 근거.",
  },
  {
    name: "물품선정위원회 운영 기준(2025. 4.)",
    note: "물품 규격·업체 선정 심의 기준 및 평가항목.",
  },
];
