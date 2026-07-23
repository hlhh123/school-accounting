// 성장입문서(PDF) 내용을 카테고리별로 깔끔하게 재구성한 가이드 콘텐츠.
// 원문 이미지를 그대로 넣지 않고, 표·단계형 흐름도·용어·Q&A 등 블록으로 정리합니다.

export type Block =
  | { type: "text"; text: string }
  | { type: "terms"; items: { term: string; desc: string }[] }
  | { type: "table"; headers: string[]; rows: string[][]; note?: string }
  | { type: "steps"; items: string[]; note?: string }
  | { type: "list"; items: string[] }
  | { type: "qa"; items: { q: string; a: string }[] }
  | { type: "note"; title?: string; text: string }
  | {
      type: "files";
      // dir: public/docs/ 하위 폴더명(기본 "expense"). file: 그 폴더 안의 실제 파일명(ASCII),
      // name: 화면 표시용 제목, download: 내려받을 때 저장되는 원본 파일명(한글)
      dir?: string;
      items: {
        name: string;
        file: string;
        download: string;
        kind: "pdf" | "hwp" | "doc" | "xls" | "ppt" | "img";
      }[];
    };

export type GuideSection = { title: string; blocks: Block[] };
export type GuideTab = {
  key: string;
  label: string;
  // 업로드(Supabase) 네임스페이스 — 이 탭에 올린 자료는 guide=docKey 로 저장됩니다.
  // 업로드가 없는 특수 탭(예: 계산기)은 docKey 를 두지 않습니다.
  docKey?: string;
  sections: GuideSection[];
  // 기본은 자료(문서) 탭. "calculator" 면 계산기 자리(준비 중)로 표시합니다.
  kind?: "docs" | "calculator";
};
export type Guide = {
  source?: string;
  intro?: string;
  sections: GuideSection[];
  // tabs 가 있으면 GuideView 가 탭 UI 로 표시하고 각 탭의 sections 를 사용합니다.
  tabs?: GuideTab[];
};

// 업무·행정공통 카테고리는 기본적으로 '서식 / 매뉴얼' 탭 구조를 사용합니다(지출과 동일).
// calculator: true 를 주면 급여용 '계산기' 빈 탭(준비 중)이 추가됩니다.
function tabbed(
  slug: string,
  opts: {
    forms?: GuideSection[];
    manual?: GuideSection[];
    calculator?: boolean;
  } = {},
): GuideTab[] {
  const tabs: GuideTab[] = [
    { key: "forms", label: "서식", docKey: `${slug}-forms`, sections: opts.forms ?? [] },
    { key: "manual", label: "매뉴얼", docKey: slug, sections: opts.manual ?? [] },
  ];
  if (opts.calculator) {
    tabs.push({ key: "calc", label: "계산기", sections: [], kind: "calculator" });
  }
  return tabs;
}

export const guides: Record<string, Guide> = {
  // 지출
  expense: {
    intro:
      "지출 업무에 필요한 매뉴얼·지침·서식을 분류별로 모았습니다. 항목을 클릭하면 문서를 열거나 내려받을 수 있습니다.",
    sections: [],
    tabs: [
      {
        key: "forms",
        label: "서식",
        docKey: "expense-forms",
        sections: [
          {
            title: "품의·계약·지출 서식",
            blocks: [
              {
                type: "files",
                items: [
                  {
                    name: "품의서",
                    file: "form-pumui.hwpx",
                    download: "품의서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "예정가격조서",
                    file: "form-yejeong-price.hwpx",
                    download: "예정가격조서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "청구서",
                    file: "form-cheonggu.hwpx",
                    download: "청구서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "졸업앨범 제작구매 계약 요구",
                    file: "form-album-contract.hwpx",
                    download: "졸업앨범 제작구매 계약 요구.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "수련시설 이용계약",
                    file: "form-suryeon-contract.hwpx",
                    download: "수련시설 이용계약.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "전세버스 이용계약",
                    file: "form-bus-contract.hwpx",
                    download: "전세버스 이용계약.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "하자보수보증금납부서",
                    file: "form-haja-napbu.hwpx",
                    download: "하자보수보증금납부서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "하자보수보증금지급각서",
                    file: "form-haja-jigeup.hwpx",
                    download: "하자보수보증금지급각서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "불부합조서",
                    file: "form-bulbuhap.hwpx",
                    download: "불부합조서.hwpx",
                    kind: "hwp",
                  },
                ],
              },
            ],
          },
          {
            title: "업무추진비 서식",
            blocks: [
              {
                type: "files",
                items: [
                  {
                    name: "업무추진비 영수증서(예시)",
                    file: "form-chujin-receipt.hwpx",
                    download: "업무추진비 영수증서(예시).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "업무추진비 관련 해설자료(교육부)",
                    file: "form-chujin-guide.hwpx",
                    download: "업무추진비 관련 해설자료(교육부).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "업무추진비 사용 내역(서식)",
                    file: "form-chujin-usage.hwpx",
                    download: "업무추진비 사용 내역(서식).hwpx",
                    kind: "hwp",
                  },
                ],
              },
            ],
          },
          {
            title: "여비 서식",
            blocks: [
              {
                type: "files",
                items: [
                  {
                    name: "여비정산신청서",
                    file: "form-yeobi-settle.hwpx",
                    download: "여비정산신청서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "국내여비지급신청서",
                    file: "form-yeobi-domestic.hwpx",
                    download: "국내여비지급신청서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "항공마일리지 운영",
                    file: "form-mileage.hwpx",
                    download: "항공마일리지 운영.hwpx",
                    kind: "hwp",
                  },
                ],
              },
            ],
          },
          {
            title: "회계 공통·기타 서식",
            blocks: [
              {
                type: "files",
                items: [
                  {
                    name: "재정보증보험 설정",
                    file: "form-bond-insurance.hwpx",
                    download: "재정보증보험 설정.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "개인정보수집이용제공 동의서",
                    file: "form-privacy-consent.hwpx",
                    download: "개인정보수집이용제공 동의서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "도서관리대장",
                    file: "form-book-ledger.hwpx",
                    download: "도서관리대장.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "구매카드발급 및 현금영수증카드 사용대장",
                    file: "form-card-ledger.hwpx",
                    download: "구매카드발급 및 현금영수증카드 사용대장.hwpx",
                    kind: "hwp",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        key: "manual",
        label: "매뉴얼",
        docKey: "expense",
        sections: [
      {
        title: "신규자 필수자료",
        blocks: [
          {
            type: "files",
            items: [
              {
                name: "2026 학교회계 지출 업무매뉴얼",
                file: "jichul-manual-2026.hwp",
                download:
                  "경기도교육청 2026학년도 학교 업무매뉴얼-제12편 학교회계 지출.hwp",
                kind: "hwp",
              },
              {
                name: "2026 학교회계 예산편성 기본지침",
                file: "yesan-jichim-2026.pdf",
                download: "2026학년도 학교회계 예산편성 기본지침-최종.pdf",
                kind: "pdf",
              },
            ],
          },
        ],
      },
      {
        title: "지출·학교회계 기준",
        blocks: [
          {
            type: "files",
            items: [
              {
                name: "2026 학교회계 예산편성 기본지침",
                file: "yesan-jichim-2026.pdf",
                download: "2026학년도 학교회계 예산편성 기본지침-최종.pdf",
                kind: "pdf",
              },
              {
                name: "2026 교육비특별회계 예산편성 기본지침 [기관용]",
                file: "yesan-teukbyeol-2026.pdf",
                download: "2026년도 경기도교육비특별회계 예산편성 기본지침.pdf",
                kind: "pdf",
              },
              {
                name: "학교회계 지출업무 개선 방안",
                file: "jichul-improve-2024.hwpx",
                download: "학교회계 지출업무 개선 방안(재무관리과 2024).hwpx",
                kind: "hwp",
              },
              {
                name: "회계관계공무원의 관직지정",
                file: "gwanjik-designation.hwpx",
                download: "회계관계공무원의 관직지정.hwpx",
                kind: "hwp",
              },
              {
                name: "지출원인행위 정리구분표",
                file: "wonin-classification.hwpx",
                download: "지출원인행위 정리구분표.hwpx",
                kind: "hwp",
              },
              {
                name: "경기도교육청 상품권 구매 및 사용 집행 기준",
                file: "gift-card-standard.hwpx",
                download: "경기도교육청 상품권 구매 및 사용 집행 기준(20.09.).hwpx",
                kind: "hwp",
              },
            ],
          },
        ],
      },
      {
        title: "출장비·여비",
        blocks: [
          {
            type: "files",
            items: [
              {
                name: "국내 여비 지급표",
                file: "yeobi-jipyo.hwpx",
                download:
                  "국내 여비 지급표(제10조부터 제13조까지 및 제16조제1항 관련)(공무원 여비 규정).hwpx",
                kind: "hwp",
              },
              {
                name: "경기도교육청 여비 FAQ",
                file: "yeobi-faq.hwp",
                download:
                  "경기도교육청 이다산 여비 관련 FAQ 답변 모음(2025. 12. 12. 기준).hwp",
                kind: "hwp",
              },
              {
                name: "교육훈련여비 지급기준",
                file: "gyoyukhullyeon-yeobi.hwpx",
                download: "교육훈련여비지급기준표.hwpx",
                kind: "hwp",
              },
              {
                name: "공무원 여비 100문 100답",
                file: "yeobi-100mun.pdf",
                download: "공무원여비100문100답.pdf",
                kind: "pdf",
              },
            ],
          },
        ],
      },
      {
        title: "급여·인건비",
        blocks: [
          {
            type: "files",
            items: [
              {
                name: "2026 교육공무직 임금 지급기준",
                file: "gongmujik-imgeum-2026.pdf",
                download:
                  "2026년 경기도교육청 교육공무직원 임금 지급기준 안내(노사협력과, 2026. 3.).pdf",
                kind: "pdf",
              },
            ],
          },
        ],
      },
      {
        title: "지급방법·시스템·업무개선",
        blocks: [
          {
            type: "files",
            items: [
              {
                name: "K-에듀파인 기능개선 안내",
                file: "k-edufine-2024.pdf",
                download:
                  "K-에듀파인 선진화 구현 2024년 중점과제 사업 기능개선 사항 안내(교육정보화과 2025).pdf",
                kind: "pdf",
              },
              {
                name: "학교회계 업무 간소화를 위한 개선사항 알림",
                file: "eopmu-ganso.pdf",
                download: "학교회계 업무 간소화를 위한 개선사항 알림.pdf",
                kind: "pdf",
              },
              {
                name: "학교회계 종이통장 관리방법 개선 방안",
                file: "passbook-improve.pdf",
                download: "학교회계 종이통장 관리방법 개선 방안 [재무기획관 2022.6.].pdf",
                kind: "pdf",
              },
              {
                name: "인터넷뱅킹 사용기준",
                file: "internet-banking.pdf",
                download:
                  "학교회계 업무처리방식 개선시행에 따른 인터넷뱅킹제도 개선 세부지침(재무관리과 2021).pdf",
                kind: "pdf",
              },
            ],
          },
        ],
      },
        ],
      },
    ],
  },

  // 계약 (개요) — «계약방법 찾기» 검색기 + 서식/매뉴얼, 하위 유형 카드가 함께 표시됩니다.
  // 자료 출처: 경기도교육청 학교 업무매뉴얼 «제13편 계약» 및 첨부자료
  contract: {
    intro:
      "계약분야·유형과 추정가격을 입력해 적용 가능한 계약방법과 절차를 확인하세요. 아래 서식·매뉴얼과 세부 계약 유형도 함께 제공합니다.",
    sections: [],
    tabs: [
      {
        key: "forms",
        label: "서식",
        docKey: "contract-forms",
        sections: [
        {
          title: "계약 준비 서식",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-02-03 소규모 공사 계획서(옥상 방수공사 및 외부방수공사)",
                  file: "c022.hwpx",
                  download: "13-02-03 소규모 공사 계획서(옥상 방수공사 및 외부방수공사).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-02-04 물품 구입 계획서(가스 저감창치 구매 및 설치)",
                  file: "c023.hwpx",
                  download: "13-02-04 물품 구입 계획서(가스 저감창치 구매 및 설치).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-02-05 일반물품. 추첨물품평가표",
                  file: "c024.hwpx",
                  download: "13-02-05 일반물품. 추첨물품평가표.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-02-06 회의록(별지)",
                  file: "c025.hwpx",
                  download: "13-02-06 회의록(별지).hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "수의계약·입찰 서식",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-03-14 현장(품)설명청취조서",
                  file: "c041.hwpx",
                  download: "13-03-14 현장(품)설명청취조서.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-25 1인 수의계약 대상자 결정을 위한 사전점검 리스트",
                  file: "c052.hwpx",
                  download: "13-03-25 1인 수의계약 대상자 결정을 위한 사전점검 리스트.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-26 수의계약 요청 사유서",
                  file: "c053.hwpx",
                  download: "13-03-26 수의계약 요청 사유서.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-34 부정당업자 제재처분 요청",
                  file: "c061.hwpx",
                  download: "13-03-34 부정당업자 제재처분 요청.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-37 계약이행 촉구 등 시정 요구(서식 1)",
                  file: "c064.hwpx",
                  download: "13-03-37 계약이행 촉구 등 시정 요구(서식 1).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-38 수의계약 배제업무 등록 예정 안내 공문 발송",
                  file: "c065.hwpx",
                  download: "13-03-38 수의계약 배제업무 등록 예정 안내 공문 발송.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-39 수의계약 배제업체 등록 결재",
                  file: "c066.hwpx",
                  download: "13-03-39 수의계약 배제업체 등록 결재.hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "계약 체결 서식",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-04-01 표준계약서(지방계약법 시행규칙)",
                  file: "c069.hwpx",
                  download: "13-04-01 표준계약서(지방계약법 시행규칙).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-04-02 낙찰결정통지 및 계약체결 알림 공문(예시)",
                  file: "c070.hwpx",
                  download: "13-04-02 낙찰결정통지 및 계약체결 알림 공문(예시).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-04-03 계약이행 통합 서약서(개선 서식)",
                  file: "c071.hwpx",
                  download: "13-04-03 계약이행 통합 서약서(개선 서식).hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "계약 이행·관리 서식",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-05-03 건설공사의 직접시공계획서",
                  file: "c076.hwpx",
                  download: "13-05-03 건설공사의 직접시공계획서.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-04 산업안전보건관리비 사용계획서",
                  file: "c077.hwpx",
                  download: "13-05-04 산업안전보건관리비 사용계획서.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-05 환경관리비 사용(변경) 계획서",
                  file: "c078.hwpx",
                  download: "13-05-05 환경관리비 사용(변경) 계획서.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-09 노무비 구분관리제 및 지급확인제(착수)",
                  file: "c082.hwpx",
                  download: "13-05-09 노무비 구분관리제 및 지급확인제(착수).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-10 공공요금징수협약서(예시)",
                  file: "c083.hwpx",
                  download: "13-05-10 공공요금징수협약서(예시).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-11 공공요금징수 적용 제외 신청서(예시)",
                  file: "c084.hwpx",
                  download: "13-05-11 공공요금징수 적용 제외 신청서(예시).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-15 학교시설공사 시 공공요금 계산기(2025. 11.)",
                  file: "c088.xlsx",
                  download: "13-05-15 학교시설공사 시 공공요금 계산기(2025. 11.).xlsx",
                  kind: "xls",
                },
                {
                  name: "13-05-19 하도급지킴이 이용 확약서",
                  file: "c092.hwpx",
                  download: "13-05-19 하도급지킴이 이용 확약서.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-25 공사 중지 기안문(예시)",
                  file: "c098.hwpx",
                  download: "13-05-25 공사 중지 기안문(예시).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-26 공사 중지 해제 기안문(예시)",
                  file: "c099.hwpx",
                  download: "13-05-26 공사 중지 해제 기안문(예시).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-27 공공요금 납부 요청 기안문(예시)",
                  file: "c100.hwpx",
                  download: "13-05-27 공공요금 납부 요청 기안문(예시).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-35 준공정산사유서",
                  file: "c108.hwpx",
                  download: "13-05-35 준공정산사유서.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-36 노무비 구분관리제 및 지급확인제(준공)",
                  file: "c109.hwpx",
                  download: "13-05-36 노무비 구분관리제 및 지급확인제(준공).hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "검사·대가지급 서식",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-06-01 준공검사조서",
                  file: "c110.hwpx",
                  download: "13-06-01 준공검사조서.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-06-02 물품검수조서",
                  file: "c111.hwpx",
                  download: "13-06-02 물품검수조서.hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "하자 관리 서식",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-07-01 하자검사조서",
                  file: "c116.hwpx",
                  download: "13-07-01 하자검사조서.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-07-02 하자보수관리부",
                  file: "c117.hwpx",
                  download: "13-07-02 하자보수관리부.hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        ],
      },
      {
        key: "manual",
        label: "매뉴얼",
        docKey: "contract",
        sections: [
        {
          title: "계약 업무매뉴얼(제13편)",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "제13편 계약",
                  file: "c016.hwpx",
                  download: "제13편 계약.hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "계약업무 흐름도",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-02-01 공사 계약업무 흐름도",
                  file: "c020.hwpx",
                  download: "13-02-01 공사 계약업무 흐름도.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-02-02 물품, 용역계약업무 흐름도",
                  file: "c021.hwpx",
                  download: "13-02-02 물품, 용역계약업무 흐름도.hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "계약의 이해·업종 구분",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-01-01 계약체결 형태별 구분",
                  file: "c017.hwpx",
                  download: "13-01-01 계약체결 형태별 구분.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-01-02 건설업의 업종, 업종별 업무분야 및 업무내용(건설산업기본법 시행령 제7조 관련 별표1)",
                  file: "c018.hwpx",
                  download: "13-01-02 건설업의 업종, 업종별 업무분야 및 업무내용(건설산업기본법 시행령 제7조 관련 별표1).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-01-03 제한입찰 시 계약담당자 유의사항 안내(재무기획관-15654, 2021.8.17.)",
                  file: "c019.pdf",
                  download: "13-01-03 제한입찰 시 계약담당자 유의사항 안내(재무기획관-15654, 2021.8.17.).pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "법령·예규·규칙",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "[개정전문] 지방자치단체 입찰 및 계약집행기준",
                  file: "c011.hwpx",
                  download: "[개정전문] 지방자치단체 입찰 및 계약집행기준.hwpx",
                  kind: "hwp",
                },
                {
                  name: "[개정전문] 지방자치단체 입찰시 낙찰자 결정기준",
                  file: "c012.hwpx",
                  download: "[개정전문] 지방자치단체 입찰시 낙찰자 결정기준.hwpx",
                  kind: "hwp",
                },
                {
                  name: "경기도교육비특별회계 재무회계 규칙(경기도교육청규칙)(제00972호)(20250301)",
                  file: "c013.pdf",
                  download: "경기도교육비특별회계 재무회계 규칙(경기도교육청규칙)(제00972호)(20250301).pdf",
                  kind: "pdf",
                },
                {
                  name: "지방자치단체를 당사자로 하는 계약에 관한 법률 시행규칙(행정안전부령)(제00625호)(20260701)",
                  file: "c008.pdf",
                  download: "지방자치단체를 당사자로 하는 계약에 관한 법률 시행규칙(행정안전부령)(제00625호)(20260701).pdf",
                  kind: "pdf",
                },
                {
                  name: "지방자치단체를 당사자로 하는 계약에 관한 법률 시행령(대통령령)(제36338호)(20260603)",
                  file: "c009.pdf",
                  download: "지방자치단체를 당사자로 하는 계약에 관한 법률 시행령(대통령령)(제36338호)(20260603).pdf",
                  kind: "pdf",
                },
                {
                  name: "지방자치단체를 당사자로 하는 계약에 관한 법률(법률)(제19634호)(20240217)",
                  file: "c010.pdf",
                  download: "지방자치단체를 당사자로 하는 계약에 관한 법률(법률)(제19634호)(20240217).pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "계약심사·일상감사·물품선정위원회",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-02-07 물품선정위원회 추첨 운영 예시",
                  file: "c026.hwpx",
                  download: "13-02-07 물품선정위원회 추첨 운영 예시.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-02-08 물품선정위원회 운영 기준(2025. 4.)",
                  file: "c027.hwpx",
                  download: "13-02-08 물품선정위원회 운영 기준(2025. 4.).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-02-09 공사 원가계산",
                  file: "c028.hwpx",
                  download: "13-02-09 공사 원가계산.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-02-11 경기도교육청 계약심사 대상 정비 및 효율화 추진계획 알림",
                  file: "c029.pdf",
                  download: "13-02-11 경기도교육청 계약심사 대상 정비 및 효율화 추진계획 알림.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-02-12 경기도 일상감사 지침 개정",
                  file: "c030.hwpx",
                  download: "13-02-12 경기도 일상감사 지침 개정.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-02-13 일상감사 대상(계약업무) 요약 표",
                  file: "c031.pdf",
                  download: "13-02-13 일상감사 대상(계약업무) 요약 표.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-02-15 2025 현장체험학습 안전매뉴얼[융합교육정책과 2025. 2.]",
                  file: "c032.pdf",
                  download: "13-02-15 2025 현장체험학습 안전매뉴얼[융합교육정책과 2025. 2.].pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "입찰·수의계약 기준",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-03-01 중소기업자 우선 조달제도",
                  file: "c033.hwpx",
                  download: "13-03-01 중소기업자 우선 조달제도.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-03 2025년 공공구매제도 요약표_2025.6.1.기준",
                  file: "c034.hwpx",
                  download: "13-03-03 2025년 공공구매제도 요약표_2025.6.1.기준.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-04 사회적협동조합 제품 우선구매 지침(2025.01.)",
                  file: "c035.pdf",
                  download: "13-03-04 사회적협동조합 제품 우선구매 지침(2025.01.).pdf",
                  kind: "pdf",
                },
                {
                  name: "13-03-05 중증장애인생산품 우선구매 제도 안내",
                  file: "c036.hwpx",
                  download: "13-03-05 중증장애인생산품 우선구매 제도 안내 .hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-06 2025년도 녹색제품 구매지침",
                  file: "c037.pdf",
                  download: "13-03-06 2025년도 녹색제품 구매지침.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-03-07 사례1. 화장실 개선공사",
                  file: "c038.hwpx",
                  download: "13-03-07 사례1. 화장실 개선공사.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-08 사례2. 급식소 증축공사 건설폐기물 처리 용역",
                  file: "c039.hwpx",
                  download: "13-03-08 사례2. 급식소 증축공사 건설폐기물 처리 용역.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-09 사례3. 가구류 구입",
                  file: "c040.hwpx",
                  download: "13-03-09 사례3. 가구류 구입.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-15 입찰의 무효 사유",
                  file: "c042.hwpx",
                  download: "13-03-15 입찰의 무효 사유.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-16 유찰 시 처리 방법",
                  file: "c043.hwpx",
                  download: "13-03-16 유찰 시 처리 방법.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-17 적격심사 서류",
                  file: "c044.hwpx",
                  download: "13-03-17 적격심사 서류.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-18 지방교육행정기관 규격기술평가위원회 구성운영 기준",
                  file: "c045.pdf",
                  download: "13-03-18 지방교육행정기관 규격기술평가위원회 구성운영 기준.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-03-19 경기도교육청 홈페이지 계약공개 메뉴 수정·개선 사항 알림",
                  file: "c046.pdf",
                  download: "13-03-19 경기도교육청 홈페이지 계약공개 메뉴 수정·개선 사항 알림.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-03-20 사례1. 옥상 방수공사",
                  file: "c047.hwpx",
                  download: "13-03-20 사례1. 옥상 방수공사.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-21 사례2. 현장체험학습 전세버스 임차 용역",
                  file: "c048.hwpx",
                  download: "13-03-21 사례2. 현장체험학습 전세버스 임차 용역.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-22 사례3. 학습준비물 구입",
                  file: "c049.hwpx",
                  download: "13-03-22 사례3. 학습준비물 구입.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-23 하자구분 곤란 등에 따른 1인 견적서 제출 가능 수의계약",
                  file: "c050.hwpx",
                  download: "13-03-23  하자구분 곤란 등에 따른 1인 견적서 제출 가능 수의계약.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-24 천재지변 등에 따른 1인 견적서 제출 가능 수의계약",
                  file: "c051.hwpx",
                  download: "13-03-24 천재지변 등에 따른 1인 견적서 제출 가능 수의계약.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-27 지역경제 활성화 방안 추진 계획 알림",
                  file: "c054.pdf",
                  download: "13-03-27 지역경제 활성화 방안 추진 계획 알림.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-03-28 경기도교육청 계약업무 개선사항(재무관리과, 2025. 2.)",
                  file: "c055.hwpx",
                  download: "13-03-28 경기도교육청 계약업무 개선사항(재무관리과, 2025. 2.).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-29 다수공급자계약 2단계경쟁 업무추진 절차",
                  file: "c056.hwpx",
                  download: "13-03-29 다수공급자계약 2단계경쟁 업무추진 절차.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-30 학생용컴퓨터 구매",
                  file: "c057.hwpx",
                  download: "13-03-30 학생용컴퓨터 구매.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-31 가구류 구매",
                  file: "c058.hwpx",
                  download: "13-03-31 가구류 구매.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-32 [별표2] 부정당업자의 입찰 참가자격 제한기준(제76조 관련)",
                  file: "c059.hwpx",
                  download: "13-03-32 [별표2] 부정당업자의 입찰 참가자격 제한기준(제76조 관련).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-33 제재 사유(지방계약법 제31조 및 시행령 제92조)",
                  file: "c060.hwpx",
                  download: "13-03-33 제재 사유(지방계약법 제31조 및 시행령 제92조).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-35 부정당업자 입찰참가자격 제한 업무처리 요령(개정)",
                  file: "c062.hwpx",
                  download: "13-03-35 부정당업자 입찰참가자격 제한 업무처리 요령(개정).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-36 수의계약 배제사유",
                  file: "c063.hwpx",
                  download: "13-03-36 수의계약 배제사유.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-40 수의계약 배제업무 흐름도",
                  file: "c067.hwpx",
                  download: "13-03-40 수의계약 배제업무 흐름도.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-03-41 수의계약 배제업체 업무처리 방법(개정)(재무관리과, 2025. 2.)",
                  file: "c068.hwpx",
                  download: "13-03-41 수의계약 배제업체 업무처리 방법(개정)(재무관리과, 2025. 2.).hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "계약 체결 기준",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-04-04 지방계약법 시행령 수의계약 등 한시적 특례 적용기간 연장 안내",
                  file: "c072.pdf",
                  download: "13-04-04 지방계약법 시행령 수의계약 등 한시적 특례 적용기간 연장 안내.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-04-05 2024년 경기도교육청 클린계약 운영계획",
                  file: "c073.hwpx",
                  download: "13-04-05 2024년 경기도교육청 클린계약 운영계획.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-04-06 [사용자 지침서] DAE_계약관리_v1.0_학교회계_최종",
                  file: "c074.pdf",
                  download: "13-04-06 [사용자 지침서] DAE_계약관리_v1.0_학교회계_최종.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "계약 이행·안전·하도급 기준",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-05-01 2026년 경기도교육청 중대재해 예방 기본계획",
                  file: "c075.pdf",
                  download: "13-05-01 2026년 경기도교육청 중대재해 예방 기본계획.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-05-06 품질시험계획의 내용",
                  file: "c079.hwpx",
                  download: "13-05-06 품질시험계획의 내용.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-07 품질관리계획서 작성기준",
                  file: "c080.hwpx",
                  download: "13-05-07 품질관리계획서 작성기준.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-08 안전관리계획의 수립기준",
                  file: "c081.hwpx",
                  download: "13-05-08 안전관리계획의 수립기준.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-12 용역근로자 근로조건 보호지침",
                  file: "c085.hwpx",
                  download: "13-05-12 용역근로자 근로조건 보호지침.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-13 공사근로자 노무비 구분관리 및 지급확인제 실무요령(개정)",
                  file: "c086.hwpx",
                  download: "13-05-13 공사근로자 노무비 구분관리 및 지급확인제 실무요령(개정).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-14 (공문) 학교 시설공사 공공요금(수도광열비) 징수 기준 개선 알림(시설과 2025.11.25.)",
                  file: "c087.hwpx",
                  download: "13-05-14 (공문) 학교 시설공사 공공요금(수도광열비) 징수 기준 개선 알림(시설과 2025.11.25.).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-16 하도급계약 통보 시 제출 서류",
                  file: "c089.hwpx",
                  download: "13-05-16 하도급계약 통보 시 제출 서류.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-17 하도급지킴이 업무흐름",
                  file: "c090.hwpx",
                  download: "13-05-17 하도급지킴이 업무흐름.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-18 하도급대금 지급 처리 사항",
                  file: "c091.hwpx",
                  download: "13-05-18 하도급대금 지급 처리 사항.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-20 주요 날씨별 현장관리",
                  file: "c093.hwpx",
                  download: "13-05-20 주요 날씨별 현장관리.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-21 25년 미세먼지 건강장해 예방가이드",
                  file: "c094.pdf",
                  download: "13-05-21 25년 미세먼지 건강장해 예방가이드.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-05-22 25년 온열질환예방지침 및 점검표",
                  file: "c095.pdf",
                  download: "13-05-22 25년 온열질환예방지침 및 점검표.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-05-23 25년 장마철 건설현장 핵심안전 수칙",
                  file: "c096.pdf",
                  download: "13-05-23 25년 장마철 건설현장 핵심안전 수칙.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-05-24 한랭질환 예방가이드",
                  file: "c097.pdf",
                  download: "13-05-24 한랭질환 예방가이드.pdf",
                  kind: "pdf",
                },
                {
                  name: "13-05-28 공공발주자 임금직접지급제 주요내용 및 이행 철저(국토교통부, 2022.12.5.)",
                  file: "c101.hwpx",
                  download: "13-05-28 공공발주자 임금직접지급제 주요내용 및 이행 철저(국토교통부, 2022.12.5.).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-29 임금직접지급제와 전자카드제간 연계 확산 추진 계획(국토교통부, 2023. 1. 5.)",
                  file: "c102.hwpx",
                  download: "13-05-29 임금직접지급제와 전자카드제간 연계 확산 추진 계획(국토교통부, 2023. 1. 5.).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-30 전자카드제와 하도급지킴이 연계 매뉴얼(국토교통부, 2023. 1. 5.)",
                  file: "c103.pdf",
                  download: "13-05-30 전자카드제와 하도급지킴이 연계 매뉴얼(국토교통부, 2023. 1. 5.).pdf",
                  kind: "pdf",
                },
                {
                  name: "13-05-31 (국토교통부)일요일 휴무제 시행방안",
                  file: "c104.hwpx",
                  download: "13-05-31 (국토교통부)일요일 휴무제 시행방안.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-32 2026년 학교 내 공사장 화재 안전관리 강화 대책 알림(2025. 12.)",
                  file: "c105.hwpx",
                  download: "13-05-32 2026년 학교 내 공사장 화재 안전관리 강화 대책 알림(2025. 12.).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-33 물가변동으로 인한 계약금액의 조정",
                  file: "c106.hwpx",
                  download: "13-05-33 물가변동으로 인한 계약금액의 조정.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-05-34 계약 주체별 해제·해지 사유",
                  file: "c107.hwpx",
                  download: "13-05-34 계약 주체별 해제·해지 사유.hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "검사와 대가지급",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "13-06-03 조달청 납품검사 대행 절차",
                  file: "c112.hwpx",
                  download: "13-06-03 조달청 납품검사 대행 절차.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-06-04 지연배상금 산출 예시",
                  file: "c113.hwpx",
                  download: "13-06-04 지연배상금 산출 예시.hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-06-05 2024세입세출외현금관리요령(2024.3.)",
                  file: "c114.hwpx",
                  download: "13-06-05 2024세입세출외현금관리요령(2024.3.).hwpx",
                  kind: "hwp",
                },
                {
                  name: "13-06-06 채권압류 및 공탁업무 처리요령",
                  file: "c115.pdf",
                  download: "13-06-06 채권압류 및 공탁업무 처리요령.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "시스템·제도 안내",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "12-03-03 경기도교육청 계약업무 개선사항(재무관리과 2025.2)",
                  file: "c001.hwpx",
                  download: "12-03-03 경기도교육청 계약업무 개선사항(재무관리과 2025.2).hwpx",
                  kind: "hwp",
                },
                {
                  name: "2024년 10월 하반기 적용 시중노임단가 안내 및 최저임금 준수 철저(재무관리과 2024)",
                  file: "c002.pdf",
                  download: "2024년 10월 하반기 적용 시중노임단가 안내 및 최저임금 준수 철저(재무관리과 2024).pdf",
                  kind: "pdf",
                },
                {
                  name: "2025년 공공구매제도 요약표(2025.6.1.기준)",
                  file: "c003.hwpx",
                  download: "2025년 공공구매제도 요약표(2025.6.1.기준).hwpx",
                  kind: "hwp",
                },
                {
                  name: "2026년 상반기 적용 시중노임단가 안내 및 최저임금 준수 철저(재무관리과, 2026. 01.)",
                  file: "c004.pdf",
                  download: "2026년 상반기 적용 시중노임단가 안내 및 최저임금 준수 철저(재무관리과, 2026. 01.).pdf",
                  kind: "pdf",
                },
                {
                  name: "도서정가제 시행에 따른 지방계약 운영지침(통보)",
                  file: "c005.hwpx",
                  download: "도서정가제 시행에 따른 지방계약 운영지침(통보).hwpx",
                  kind: "hwp",
                },
                {
                  name: "지정정보처리장치 업무흐름",
                  file: "c006.hwpx",
                  download: "지정정보처리장치 업무흐름.hwpx",
                  kind: "hwp",
                },
                {
                  name: "차세대 나라장터 사용자매뉴얼",
                  file: "c007.hwpx",
                  download: "차세대 나라장터 사용자매뉴얼.hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "참고 매뉴얼·사례집",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "5. 계약(2025년 버전)",
                  file: "c015.hwpx",
                  download: "5. 계약(2025년 버전).hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "타 시·도 참고 편람",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "2025+계약실무편람(지방계약+예규+개정사항+반영)_대전",
                  file: "c118.pdf",
                  download: "2025+계약실무편람(지방계약+예규+개정사항+반영)_대전.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "타 기관 업무사이트 참고",
          blocks: [
            {
              type: "files",
              dir: "contract",
              items: [
                {
                  name: "서울교육청 계약길라잡이",
                  file: "c014.hwpx",
                  download: "서울교육청 계약길라잡이.hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        ],
      },
    ],
  },

  // 계약 > 물품
  "contract-goods": { sections: [], tabs: tabbed("contract-goods") },

  // 계약 > 공사
  "contract-construction": { sections: [], tabs: tabbed("contract-construction") },

  // 계약 > 용역
  "contract-service": { sections: [], tabs: tabbed("contract-service") },

  // 계약 > 급식
  "contract-meal": { sections: [], tabs: tabbed("contract-meal") },

  // 공무원급여 (지방공무원·교육공무원) — 서식 / 매뉴얼 / 계산기
  "salary-official": {
    intro: "공무원 급여·수당 관련 서식과 매뉴얼입니다. 계산기는 준비 중입니다.",
    sections: [],
    tabs: tabbed("salary-official", {
      forms: [
        {
          title: "계약제교원 운영지침 서식",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "2026 공립 유·초·중등·특수 학교 계약제 교원 운영 지침(2026.1월 개정판)_서식모음",
                    file: "o007.pdf",
                    download: "06-02 2026 공립 유·초·중등·특수 학교 계약제 교원 운영 지침(2026.1월 개정판)_서식모음.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "원천징수 서식",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "원천징수동의서",
                    file: "o009.pdf",
                    download: "08-01-03 원천징수동의서.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "원천징수 관리대장",
                    file: "o010.pdf",
                    download: "08-01-04 원천징수 관리대장.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "보수·수당 신고 서식",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "부양가족신고서",
                    file: "o026.pdf",
                    download: "08-02-15 부양가족신고서.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "자녀학비보조수당 신고서",
                    file: "o027.pdf",
                    download: "08-02-16 자녀학비보조수당 신고서.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "기술정보수당 가산금 신고서",
                    file: "o033.pdf",
                    download: "08-02-21 기술정보수당 가산금 신고서.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "채권압류·공탁 서식",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "채권압류자관리대장",
                    file: "o036.pdf",
                    download: "08-04-01 채권압류자관리대장.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "채권압류 및 지급내역",
                    file: "o037.pdf",
                    download: "08-04-02 채권압류 및 지급내역.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "공탁서류 기안 예시",
                    file: "o038.pdf",
                    download: "08-04-03 공탁서류 기안 예시.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "공탁양식",
                    file: "o039.pdf",
                    download: "08-04-04 공탁양식.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "연금·조위금 서식",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "사망조위금 청구서",
                    file: "o050.pdf",
                    download: "08-05-07 사망조위금 청구서.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
      ],
      manual: [
        {
          title: "법령·규정·업무지침",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "공무원보수규정(대통령령)(제36489호)(20260630)",
                    file: "o001.pdf",
                    download: "01 공무원보수규정(대통령령)(제36489호)(20260630).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "공무원수당 등에 관한 규정(대통령령)(제36015호)(20260102)",
                    file: "o002.pdf",
                    download: "02 공무원수당 등에 관한 규정(대통령령)(제36015호)(20260102).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "지방공무원 보수규정(대통령령)(제36430호)(20260701)",
                    file: "o003.pdf",
                    download: "03 지방공무원 보수규정(대통령령)(제36430호)(20260701).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2026 공무원보수 등의 업무지침(인사혁신처예규 제204호)_20260122",
                    file: "o004.pdf",
                    download: "04 2026 공무원보수 등의 업무지침(인사혁신처예규 제204호)_20260122.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "지방공무원보수업무 등 처리지침_20260102",
                    file: "o005.pdf",
                    download: "05 지방공무원보수업무 등 처리지침_20260102.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2026 공립 유·초·중등·특수 학교 계약제 교원 운영 지침(2026.1월 개정판)",
                    file: "o006.pdf",
                    download: "06-01 2026 공립 유·초·중등·특수 학교 계약제 교원 운영 지침(2026.1월 개정판).pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "제8편 보수 매뉴얼(본편)",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "제8편 보수",
                    file: "o008.pdf",
                    download: "제8편 보수.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "보수·수당 기준(별표·봉급표)",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "[별표 4] 대우공무원수당¸ 정근수당 가산금¸ 가족수당¸ 가족수당 가산금¸ 자녀학비보조수당 및 주택수당 감액 지급 구분표",
                    file: "o011.pdf",
                    download: "08-02-01 [별표 4] 대우공무원수당¸ 정근수당 가산금¸ 가족수당¸ 가족수당 가산금¸ 자녀학비보조수당 및 주택수당 감액 지급 구분표.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 7] 특수지근무수당(도서벽지수당) 지급 구분표(제12조제1항 관련)",
                    file: "o012.pdf",
                    download: "08-02-02 [별표 7] 특수지근무수당(도서벽지수당) 지급 구분표(제12조제1항 관련).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 8] 위험근무수당 등급별 구분표(제13조 관련)(지방공무원 수당 등에 관한 규정)",
                    file: "o013.pdf",
                    download: "08-02-03 [별표 8] 위험근무수당 등급별 구분표(제13조 관련)(지방공무원 수당 등에 관한 규정).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 9] 특수업무수당 지급 구분표(제14조 관련)(지방공무원 수당 등에 관한 규정)",
                    file: "o014.pdf",
                    download: "08-02-03 [별표 9] 특수업무수당 지급 구분표(제14조 관련)(지방공무원 수당 등에 관한 규정).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 16] 일반직공무원 등의 경력환산율표",
                    file: "o015.pdf",
                    download: "08-02-04 [별표 16] 일반직공무원 등의 경력환산율표.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 17] 연구직공무원의 경력환산율표",
                    file: "o016.pdf",
                    download: "08-02-05 [별표 17] 연구직공무원의 경력환산율표.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 19] 지도직공무원의 경력환산율표",
                    file: "o017.pdf",
                    download: "08-02-06 [별표 19] 지도직공무원의 경력환산율표.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 22] 교육공무원 등의 경력환산율표(공무원보수규정)",
                    file: "o018.pdf",
                    download: "08-02-07 [별표 22] 교육공무원 등의 경력환산율표(공무원보수규정).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "경기도교육청 소속 기간제교원 정근수당 지급방식 변경",
                    file: "o019.pdf",
                    download: "08-02-08 경기도교육청 소속 기간제교원 정근수당 지급방식 변경.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 6] 자녀학비보조수당 지급 구분표(제11조제1항 관련)(공무원수당 등에 관한 규정)",
                    file: "o020.pdf",
                    download: "08-02-09 [별표 6] 자녀학비보조수당 지급 구분표(제11조제1항 관련)(공무원수당 등에 관한 규정).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 1] 일반직공무원의 직급표(제3조제1항 관련)(공무원임용령)",
                    file: "o021.pdf",
                    download: "08-02-10 [별표 1] 일반직공무원의 직급표(제3조제1항 관련)(공무원임용령).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "경기도교육감 소속 지방공무원 업무대행제도 운영 계획(2026.1.)",
                    file: "o022.pdf",
                    download: "08-02-11 경기도교육감 소속 지방공무원 업무대행제도 운영 계획(2026.1.).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "교육공무원 국내출장 기간 중 초과근무수당 처리 사항 안내",
                    file: "o023.pdf",
                    download: "08-02-12 교육공무원 국내출장 기간 중 초과근무수당 처리 사항 안내.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "공무원별 봉급표",
                    file: "o024.pdf",
                    download: "08-02-13 공무원별 봉급표.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 11] 유치원ㆍ초등학교ㆍ중학교ㆍ고등학교 교원 등의 봉급표",
                    file: "o025.pdf",
                    download: "08-02-14 [별표 11] 유치원ㆍ초등학교ㆍ중학교ㆍ고등학교 교원 등의 봉급표.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "신분변동시 보수지급방법",
                    file: "o028.pdf",
                    download: "08-02-17 신분변동시 보수지급방법.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 1] 교원연구비 지급단가(제3조 관련)(교원연구비 지급에 관한 규정)",
                    file: "o029.pdf",
                    download: "08-02-18 [별표 1] 교원연구비 지급단가(제3조 관련)(교원연구비 지급에 관한 규정).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[별표 2] 정근수당 지급 구분표(제7조제1항 관련)(공무원수당 등에 관한 규정)",
                    file: "o030.pdf",
                    download: "08-02-18 [별표 2] 정근수당 지급 구분표(제7조제1항 관련)(공무원수당 등에 관한 규정).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2022년 단체(임금)협약 안내",
                    file: "o031.pdf",
                    download: "08-02-19 2022년 단체(임금)협약 안내.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[붙임] 지방공무원 위험근무수당 지급기준 준수 철저",
                    file: "o032.pdf",
                    download: "08-02-20 [붙임] 지방공무원 위험근무수당 지급기준 준수 철저.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "연말정산",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "연말정산 안내자료 예시",
                    file: "o034.pdf",
                    download: "08-03-01 연말정산 안내자료 예시.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "채권압류·공탁",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "채권압류 및 공탁업무 처리요령",
                    file: "o035.pdf",
                    download: "08-04-00 ★채권압류 및 공탁업무 처리요령.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "채권 관리업무 편람(2022.12.31.)",
                    file: "o040.pdf",
                    download: "08-04-05 채권 관리업무 편람(2022.12.31.).pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "공무원연금·대여학자금·조위금",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "2022년 공무원연금 가이드북",
                    file: "o041.pdf",
                    download: "08-05-00 2022년 공무원연금 가이드북.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "공무원연금 급여요약",
                    file: "o042.pdf",
                    download: "08-05-01 공무원연금 급여요약.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "퇴직급여 종류별 급여계산식장기급여요약",
                    file: "o043.pdf",
                    download: "08-05-02 퇴직급여 종류별 급여계산식장기급여요약.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2024년 대여학자금 업무처리기준-배포용",
                    file: "o044.pdf",
                    download: "08-05-03 2024년 대여학자금 업무처리기준-배포용.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2025년도 대여학자금 업무처리기준 책자_단면 (1)",
                    file: "o045.pdf",
                    download: "08-05-03 2025년도 대여학자금 업무처리기준 책자_단면 (1).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2021 공무원연금 실무",
                    file: "o046.pdf",
                    download: "08-05-04 2021 공무원연금 실무.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2025년도 대여학자금 업무처리기준",
                    file: "o047.pdf",
                    download: "08-05-05 2025년도 대여학자금 업무처리기준.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "대여학자금 신청 방법",
                    file: "o048.pdf",
                    download: "08-05-05 대여학자금 신청 방법.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2025년도 공무원 연금대부 업무처리기준(최종) (1)",
                    file: "o049.pdf",
                    download: "08-05-06 2025년도 공무원 연금대부 업무처리기준(최종) (1).pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "건강보험(EDI)",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "edi 건강보험 취득신고",
                    file: "o051.pdf",
                    download: "08-06-01 edi 건강보험 취득신고.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "edi 피부양자 등록",
                    file: "o052.pdf",
                    download: "08-06-02 edi 피부양자 등록.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "edi 건강보험 상실신고",
                    file: "o053.pdf",
                    download: "08-06-03 edi 건강보험 상실신고.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "edi 보수월액 변경 신고 방법",
                    file: "o054.pdf",
                    download: "08-06-04 edi 보수월액 변경 신고 방법.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "edi 직장가입자내용변경",
                    file: "o055.pdf",
                    download: "08-06-05 edi 직장가입자내용변경.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "edi 직장가입자 근무처 변동",
                    file: "o056.pdf",
                    download: "08-06-06 edi 직장가입자 근무처 변동.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "edi 고지유예 신청 해지",
                    file: "o057.pdf",
                    download: "08-06-07 edi 고지유예 신청 해지.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "edi 보수총액 신고",
                    file: "o058.pdf",
                    download: "08-06-08 edi 보수총액 신고.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "건강보험증 발급",
                    file: "o059.png",
                    download: "08-06-09 건강보험증 발급.png",
                    kind: "img",
                  },
                  {
                    name: "피부양자추가 방법",
                    file: "o060.pdf",
                    download: "08-06-10 피부양자추가 방법.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "웹EDI_가입_및_업무처리_매뉴얼",
                    file: "o061.pdf",
                    download: "08-06-11 웹EDI_가입_및_업무처리_매뉴얼.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "edi 건강보험증 신청 변경 방법",
                    file: "o062.pdf",
                    download: "08-06-12 edi 건강보험증 신청 변경 방법.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
        {
          title: "맞춤형복지",
          blocks: [
            {
              type: "files",
              dir: "salary-official",
              items: [
                  {
                    name: "2026년 맞춤형복지 제도 업무처리 기준",
                    file: "o063.pdf",
                    download: "08-08-01 2026년 맞춤형복지 제도 업무처리 기준.pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
      ],
      calculator: true,
    }),
  },

  // 공무직급여 (교육공무직원) — 서식 / 매뉴얼 / 계산기
  "salary-worker": {
    intro: "공무직 급여·수당 관련 서식과 매뉴얼입니다. 계산기는 준비 중입니다.",
    sections: [],
    tabs: tabbed("salary-worker", {
      forms: [
        {
          title: "급여·퇴직금 산출 서식·계산기",
          blocks: [
            {
              type: "files",
              dir: "salary-worker",
              items: [
                  {
                    name: "통상임금·퇴직금·연차수당 통합 산출 서식",
                    file: "w009.xlsx",
                    download: "[서식01] 통상임금·퇴직금·연차수당 통합 산출 서식.xlsx",
                    kind: "xls",
                  },
                  {
                    name: "4대보험 기관·개인 부담금 산출 서식(2026)",
                    file: "w010.xlsx",
                    download: "[서식02] 4대보험 기관·개인 부담금 산출 서식(2026).xlsx",
                    kind: "xls",
                  },
                  {
                    name: "확정기여형(DC) 퇴직금 산출 내역서",
                    file: "w011.xlsx",
                    download: "[서식03] 확정기여형(DC) 퇴직금 산출 내역서.xlsx",
                    kind: "xls",
                  },
                  {
                    name: "급식조리원 확정급여형(DB) 퇴직금 계산기",
                    file: "w012.xlsx",
                    download: "[서식04] 급식조리원 확정급여형(DB) 퇴직금 계산기.xlsx",
                    kind: "xls",
                  },
                  {
                    name: "시설당직원 연차휴가 및 미사용수당 계산기",
                    file: "w013.xlsx",
                    download: "[서식05] 시설당직원 연차휴가 및 미사용수당 계산기.xlsx",
                    kind: "xls",
                  },
                  {
                    name: "기간제교사 퇴직금 계산 양식",
                    file: "w018.xlsx",
                    download: "[참고] 기간제교사 퇴직금 계산 양식.xlsx",
                    kind: "xls",
                  },
              ],
            },
          ],
        },
      ],
      manual: [
        {
          title: "급여 업무 매뉴얼·지침",
          blocks: [
            {
              type: "files",
              dir: "salary-worker",
              items: [
                  {
                    name: "교육공무직원 급여 업무 매뉴얼(2025)",
                    file: "w007.pdf",
                    download: "[매뉴얼] 교육공무직원 급여 업무 매뉴얼(2025).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "교육공무직원 복무제도 안내(2026).",
                    file: "w014.pdf",
                    download: "[지침] 교육공무직원 복무제도 안내(2026)..pdf",
                    kind: "pdf",
                  },
                  {
                    name: "교육공무직원 생활안정지원금 지원 계획",
                    file: "w015.hwp",
                    download: "[지침] 교육공무직원 생활안정지원금 지원 계획.hwp",
                    kind: "hwp",
                  },
                  {
                    name: "교육공무직원 임금 지급기준 변경안(2025)",
                    file: "w016.hwp",
                    download: "[지침] 교육공무직원 임금 지급기준 변경안(2025).hwp",
                    kind: "hwp",
                  },
                  {
                    name: "교육공무직원 임금 지급기준(2026)",
                    file: "w017.hwp",
                    download: "[지침] 교육공무직원 임금 지급기준(2026).hwp",
                    kind: "hwp",
                  },
              ],
            },
          ],
        },
        {
          title: "나이스·연말정산",
          blocks: [
            {
              type: "files",
              dir: "salary-worker",
              items: [
                  {
                    name: "방학 중 생활안정지원금 재원 설정 방법",
                    file: "w001.pdf",
                    download: "[나이스] 방학 중 생활안정지원금 재원 설정 방법.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "(251217)수정사항",
                    file: "w002.hwp",
                    download: "(251217)수정사항.hwp",
                    kind: "hwp",
                  },
                  {
                    name: "2025년 개정세법 요약(재수정반영) (2)",
                    file: "w003.docx",
                    download: "2025년 개정세법 요약(재수정반영) (2).docx",
                    kind: "doc",
                  },
                  {
                    name: "2025년 귀속 연말정산 담당자 교육 강의자료(안성)",
                    file: "w004.pdf",
                    download: "2025년 귀속 연말정산 담당자 교육 강의자료(안성).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2025년 원천징수의무자를 위한 신고안내",
                    file: "w005.pdf",
                    download: "2025년 원천징수의무자를 위한 신고안내.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2025년 원천징수의무자를 위한 연말정산 신고안내",
                    file: "w006.pdf",
                    download: "2025년 원천징수의무자를 위한 연말정산 신고안내.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2025년 귀속 나이스 연말정산 사용자 설명서_260113 (1)",
                    file: "w008.pdf",
                    download: "[붙임] 2025년 귀속 나이스 연말정산 사용자 설명서_260113 (1).pdf",
                    kind: "pdf",
                  },
              ],
            },
          ],
        },
      ],
      calculator: true,
    }),
  },

  // 물품재산
  property: {
    intro: "물품·재산 관리에 필요한 서식과 매뉴얼입니다.",
    sections: [],
    tabs: tabbed("property", {
      forms: [
        {
          title: "물품 서식",
          blocks: [
            {
              type: "files",
              dir: "property",
              items: [
                  {
                    name: "2025년도 물품 증감 및 현재액보고서(재무관리과, 2025. 12.)",
                    file: "p004.hwpx",
                    download: "16-01-02 2025년도 물품 증감 및 현재액보고서(재무관리과, 2025. 12.).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "2025년도 정기 재물조사 보고서 작성 안내(재무관리과, 2025. 12.)",
                    file: "p006.hwpx",
                    download: "16-01-04 2025년도 정기 재물조사 보고서 작성 안내(재무관리과, 2025. 12.).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "물품의 품종ㆍ상태 구분[별표1]",
                    file: "p007.hwpx",
                    download: "16-02-01 물품의 품종ㆍ상태 구분[별표1].hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "분임물품출납원 임명",
                    file: "p008.hwpx",
                    download: "16-02-02 분임물품출납원 임명.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "물품망실보고서",
                    file: "p009.hwpx",
                    download: "16-02-03 물품망실보고서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "리스물품 에듀파인 물품대장 등록방법(재무관리과 2023.7.3)",
                    file: "p010.hwpx",
                    download: "16-02-04 리스물품 에듀파인 물품대장 등록방법(재무관리과 2023.7.3).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "물품관리공무원의 지정(경기도교육비특별회계 소관 물품관리조례 시행규칙[별표]",
                    file: "p011.hwp",
                    download: "16-02-05 물품관리공무원의 지정(경기도교육비특별회계 소관 물품관리조례 시행규칙[별표].hwp",
                    kind: "hwp",
                  },
                  {
                    name: "반납 및 인수증",
                    file: "p013.hwpx",
                    download: "16-02-07 반납 및 인수증.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "미술품 관리대장",
                    file: "p014.hwp",
                    download: "16-02-08 미술품 관리대장.hwp",
                    kind: "hwp",
                  },
                  {
                    name: "청구 및 출급증",
                    file: "p016.hwpx",
                    download: "16-02-10 청구 및 출급증.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "비소모품출납 및 운용카드",
                    file: "p017.hwpx",
                    download: "16-02-11 비소모품출납 및 운용카드.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "물품공차증",
                    file: "p018.hwpx",
                    download: "16-02-12 물품공차증.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "물품출납원 사무인계보고서",
                    file: "p019.hwpx",
                    download: "16-02-13 물품출납원 사무인계보고서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "물품의 정리 구분",
                    file: "p020.hwpx",
                    download: "16-02-14 물품의 정리 구분.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "[별표 1] 회계관계공무원의 관직지정",
                    file: "p021.hwp",
                    download: "16-02-15 [별표 1] 회계관계공무원의 관직지정.hwp",
                    kind: "hwp",
                  },
                  {
                    name: "불용결정조서",
                    file: "p022.hwpx",
                    download: "16-03-01 불용결정조서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "불용결정 신청조서 및 결정통보서",
                    file: "p023.hwpx",
                    download: "16-03-02 불용결정 신청조서 및 결정통보서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "물품관리전환합의서",
                    file: "p024.hwpx",
                    download: "16-04-01 물품관리전환합의서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "불용품매각처분조서",
                    file: "p025.hwpx",
                    download: "16-05-01 불용품매각처분조서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "매각 공고문",
                    file: "p027.hwpx",
                    download: "16-05-03 매각 공고문.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "수령증",
                    file: "p028.hwpx",
                    download: "16-05-04 수령증.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "저장매체 자료삭제 신청서",
                    file: "p030.hwpx",
                    download: "16-05-06 저장매체 자료삭제 신청서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "불용품(해체폐기)조서",
                    file: "p031.hwpx",
                    download: "16-05-07 불용품(해체폐기)조서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "조달청 무상양여 요청 기안",
                    file: "p032.hwpx",
                    download: "16-05-08 조달청 무상양여 요청 기안.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "정기재물조사 세부계획",
                    file: "p033.hwpx",
                    download: "16-06-01 정기재물조사 세부계획.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "차량정수배정 신청서",
                    file: "p036.hwpx",
                    download: "16-07-01 차량정수배정 신청서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "[별표1의]차량의 차종¸ 차형¸ 배정대상¸ 기준정수 및 차량 관리운행 기준(제4조 관련)",
                    file: "p037.hwpx",
                    download: "16-07-02 [별표1의]차량의 차종¸ 차형¸ 배정대상¸ 기준정수 및 차량 관리운행 기준(제4조 관련).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "차량 등록 또는 말소등록 보고",
                    file: "p038.hwpx",
                    download: "16-07-03 차량 등록 또는 말소등록 보고.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "차량 교체승인 신청서",
                    file: "p039.hwpx",
                    download: "16-07-04 차량 교체승인 신청서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "공무용 차량 관리대장",
                    file: "p040.hwpx",
                    download: "16-07-05 공무용 차량 관리대장.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "어린이통학버스신고서",
                    file: "p041.hwpx",
                    download: "16-07-06 어린이통학버스신고서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "차량 운행일지",
                    file: "p042.hwpx",
                    download: "16-07-07 차량 운행일지.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "차량 정비대장",
                    file: "p043.hwpx",
                    download: "16-07-08 차량 정비대장.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "유류 수불대장",
                    file: "p044.hwpx",
                    download: "16-07-09 유류 수불대장.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "안전운행기록",
                    file: "p045.hwpx",
                    download: "16-07-10 안전운행기록.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "운전원 근무수칙",
                    file: "p046.hwpx",
                    download: "16-07-11 운전원 근무수칙.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "차량배차 신청",
                    file: "p047.hwpx",
                    download: "16-07-12 차량배차 신청.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "경기도교육청 물품선정위원회 자동화 서식",
                    file: "p053.xlsx",
                    download: "6-1. 경기도교육청 물품선정위원회 자동화 서식.xlsx",
                    kind: "xls",
                  },
                  {
                    name: "회의록",
                    file: "p054.hwpx",
                    download: "6-2. 회의록.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "물품정보",
                    file: "p055.xlsx",
                    download: "물품정보.xlsx",
                    kind: "xls",
                  },
              ],
            },
          ],
        },
        {
          title: "재산 서식",
          blocks: [
            {
              type: "files",
              dir: "property",
              items: [
                  {
                    name: "건축계획수립",
                    file: "p061.hwpx",
                    download: "17-02-01 건축계획수립.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "건축물축조승인 신청서 및 승인서",
                    file: "p062.hwpx",
                    download: "17-02-02 건축물축조승인 신청서 및 승인서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "건축물 착공 신고",
                    file: "p063.hwpx",
                    download: "17-02-03 건축물 착공 신고.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "공사완료신고",
                    file: "p064.hwpx",
                    download: "17-02-04 공사완료신고.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "등기촉탁 신청",
                    file: "p065.hwpx",
                    download: "17-02-05 등기촉탁 신청.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "가설건축물 축조신고서",
                    file: "p066.hwpx",
                    download: "17-02-06 가설건축물 축조신고서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "가설건축물 축조 신고필증",
                    file: "p067.hwpx",
                    download: "17-02-07 가설건축물 축조 신고필증.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "가설건축물 관리대장",
                    file: "p068.hwpx",
                    download: "17-02-08 가설건축물 관리대장.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "가설건축물 존치기간 연장신고서",
                    file: "p069.hwpx",
                    download: "17-02-09 가설건축물 존치기간 연장신고서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "가설건축물 존치기간 연장 신고필증",
                    file: "p070.hwpx",
                    download: "17-02-10 가설건축물 존치기간 연장 신고필증.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "건물 용도폐지 및 철거 신청서",
                    file: "p072.hwpx",
                    download: "17-03-01 건물 용도폐지 및 철거 신청서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "공유재산심의회 안건",
                    file: "p073.hwpx",
                    download: "17-03-02 공유재산심의회 안건.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "건축물(해체 허가신청서¸ 해체 신고서)",
                    file: "p077.hwpx",
                    download: "17-03-06 건축물(해체 허가신청서¸ 해체 신고서).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "건축물 해체 허가와 신고 대상",
                    file: "p078.hwpx",
                    download: "17-03-07 건축물 해체 허가와 신고 대상.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "건축물(해체공사 완료신고서, 멸실 신고서)",
                    file: "p079.hwpx",
                    download: "17-03-08 건축물(해체공사 완료신고서, 멸실 신고서).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "건축물대장 말소신청서",
                    file: "p080.hwpx",
                    download: "17-03-09 건축물대장 말소신청서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "공유재산가격평정조서",
                    file: "p081.hwpx",
                    download: "17-04-01 공유재산가격평정조서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "대부료산정조서",
                    file: "p082.hwpx",
                    download: "17-04-02 대부료산정조서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "공유재산 사용·수익허가 및 대부 시 공공요금 부과에 관한 사항 알림",
                    file: "p083.pdf",
                    download: "17-04-03 공유재산 사용·수익허가 및 대부 시 공공요금 부과에 관한 사항 알림.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "입찰공고문",
                    file: "p084.hwpx",
                    download: "17-04-04 입찰공고문.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "허가조건",
                    file: "p085.hwpx",
                    download: "17-04-05 허가조건.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "공유재산(유상, 무상) 사용허가서",
                    file: "p089.hwpx",
                    download: "17-04-09 공유재산(유상, 무상) 사용허가서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "사용료 납부고지",
                    file: "p090.hwpx",
                    download: "17-04-10 사용료 납부고지.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "사용료·대부료를 감면하는 경우의 요약",
                    file: "p091.hwpx",
                    download: "17-04-11 사용료·대부료를 감면하는 경우의 요약.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "공유재산 대부 및 사용허가 정리부",
                    file: "p092.hwpx",
                    download: "17-04-12 공유재산 대부 및 사용허가 정리부.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "행정재산 일시사용 허가신청서",
                    file: "p093.hwpx",
                    download: "17-05-01 행정재산 일시사용 허가신청서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "행정재산 일시사용 허가대장",
                    file: "p094.hwpx",
                    download: "17-05-02 행정재산 일시사용 허가대장.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "관사사용 허가 신청서",
                    file: "p095.hwpx",
                    download: "17-06-01 관사사용 허가 신청서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "관사 입주 신고서",
                    file: "p096.hwpx",
                    download: "17-06-02 관사 입주 신고서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "서약서",
                    file: "p097.hwpx",
                    download: "17-06-03 서약서.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "관사 관리대장",
                    file: "p098.hwpx",
                    download: "17-06-04 관사 관리대장.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "건물가입 시 기본 보장(기본교구, 기본설비, 기본부속물)",
                    file: "p099.hwpx",
                    download: "17-07-01 건물가입 시 기본 보장(기본교구, 기본설비, 기본부속물).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "재난사진대장",
                    file: "p103.hwpx",
                    download: "17-07-05 재난사진대장.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "화재증명원",
                    file: "p104.hwpx",
                    download: "17-07-06 화재증명원.hwpx",
                    kind: "hwp",
                  },
              ],
            },
          ],
        },
      ],
      manual: [
        {
          title: "물품관리 매뉴얼·지침",
          blocks: [
            {
              type: "files",
              dir: "property",
              items: [
                  {
                    name: "[e-DASAN현장지원] 물품선정위원회 관련 FAQ 답변 모음 [재무관리과 2024.12.] (1)",
                    file: "p001.hwp",
                    download: "[e-DASAN현장지원] 물품선정위원회 관련 FAQ 답변 모음 [재무관리과 2024.12.] (1).hwp",
                    kind: "hwp",
                  },
                  {
                    name: "제16편 물품관리",
                    file: "p002.hwpx",
                    download: "제16편 물품관리.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "지방자치단체 물품관리 운영기준(2024)",
                    file: "p003.pdf",
                    download: "16-01-01 지방자치단체 물품관리 운영기준(2024).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "지방자치단체 물품수급관리계획 업무 흐름도",
                    file: "p005.png",
                    download: "16-01-03 지방자치단체 물품수급관리계획 업무 흐름도.PNG",
                    kind: "img",
                  },
                  {
                    name: "K-에듀파인 통합자산관리 물품관리 사용자 매뉴얼_v1.3(2025.8.)",
                    file: "p012.pptx",
                    download: "16-02-06 K-에듀파인 통합자산관리 물품관리 사용자 매뉴얼_v1.3(2025.8.).pptx",
                    kind: "ppt",
                  },
                  {
                    name: "차세대 지방교육행재정통합시스템 미술품관리 매뉴얼",
                    file: "p015.pdf",
                    download: "16-02-09 차세대 지방교육행재정통합시스템 미술품관리 매뉴얼.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "전자자산처분시스템 입찰 흐름도",
                    file: "p026.hwpx",
                    download: "16-05-02 전자자산처분시스템 입찰 흐름도.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "저장매체 처리장비 이용 안내",
                    file: "p029.hwpx",
                    download: "16-05-05 저장매체 처리장비 이용 안내.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "K-에듀파인 통합자산관리시스템 물품결산 및 재물조사 매뉴얼(2024.12.)",
                    file: "p034.pdf",
                    download: "16-06-02 K-에듀파인 통합자산관리시스템 물품결산 및 재물조사 매뉴얼(2024.12.).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2024년도 경기도교육청 정기 재물조사 지침[재무관리과 2025.1]",
                    file: "p035.hwp",
                    download: "16-06-03 2024년도 경기도교육청 정기 재물조사 지침[재무관리과 2025.1].hwp",
                    kind: "hwp",
                  },
                  {
                    name: "장비 구입, 구축 용역 규격서 및 과업지시서(예시) [재무관리과 2023.12.]",
                    file: "p048.hwpx",
                    download: "16-08-01 장비 구입, 구축 용역 규격서 및 과업지시서(예시) [재무관리과 2023.12.].hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "자체보안대책 표준(안) [재무관리과 2023.12.]",
                    file: "p049.hwpx",
                    download: "16-08-02 자체보안대책 표준(안) [재무관리과 2023.12.].hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "2024년도 전자태그(RFID) 기반 물품관리시스템 구축 사업 계획 [재무관리과 2023.12.]",
                    file: "p050.hwpx",
                    download: "16-08-03 2024년도 전자태그(RFID) 기반 물품관리시스템 구축 사업 계획 [재무관리과 2023.12.].hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "RFID 물품관리 사용자지침서",
                    file: "p051.pdf",
                    download: "16-08-04 RFID 물품관리 사용자지침서.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "물품선정위원회 운영 기준 [재무관리과 2024.12.]",
                    file: "p052.hwp",
                    download: "물품선정위원회 운영 기준 [재무관리과 2024.12.].hwp",
                    kind: "hwp",
                  },
                  {
                    name: "참고_물품선정위원회 운영 기준",
                    file: "p056.hwp",
                    download: "참고_물품선정위원회 운영 기준.hwp",
                    kind: "hwp",
                  },
              ],
            },
          ],
        },
        {
          title: "공유재산 매뉴얼·지침",
          blocks: [
            {
              type: "files",
              dir: "property",
              items: [
                  {
                    name: "제17편 공유재산관리",
                    file: "p057.hwpx",
                    download: "제17편 공유재산관리.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "2022.12.31. 채권 관리 업무 편람(개정판)",
                    file: "p058.pdf",
                    download: "★ 2022.12.31. 채권 관리 업무 편람(개정판).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2024 공유재산업무편람",
                    file: "p059.pdf",
                    download: "17-01-01 2024 공유재산업무편람.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "[사용자지침서] EAA_재산관리_v1.3",
                    file: "p060.pdf",
                    download: "17-01-02 [사용자지침서] EAA_재산관리_v1.3.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "경기도 31개 시군 건축조례(차양 및 비가람시설) 개정 결과 안내",
                    file: "p071.pdf",
                    download: "17-02-11 경기도 31개 시군 건축조례(차양 및 비가람시설) 개정 결과 안내.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "공작물 처분 흐름도",
                    file: "p074.hwpx",
                    download: "17-03-03 공작물 처분 흐름도.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "2023년 K-에듀파인 통합자산관리(재산관리) 시스템 교육자료v1.0",
                    file: "p075.pptx",
                    download: "17-03-04 2023년 K-에듀파인 통합자산관리(재산관리) 시스템 교육자료v1.0.pptx",
                    kind: "ppt",
                  },
                  {
                    name: "K-에듀파인 통합자산관리(재산 주요기능 및 FAQ)",
                    file: "p076.pptx",
                    download: "17-03-05 K-에듀파인 통합자산관리(재산 주요기능 및 FAQ).pptx",
                    kind: "ppt",
                  },
                  {
                    name: "사용허가 입찰 흐름도",
                    file: "p086.hwpx",
                    download: "17-04-06 사용허가 입찰 흐름도.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "전자자산처분시스템 입찰 흐름도",
                    file: "p087.hwpx",
                    download: "17-04-07 전자자산처분시스템 입찰 흐름도.hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "공유재산(매점 및 자동판매기) 우선 사용허가 유의사항 알림",
                    file: "p088.pdf",
                    download: "17-04-08 공유재산(매점 및 자동판매기) 우선 사용허가 유의사항 알림.pdf",
                    kind: "pdf",
                  },
                  {
                    name: "2026년도 교육시설공제 가입 및 재난관리 교육(정기가입 교재)",
                    file: "p100.pdf",
                    download: "17-07-02 2026년도 교육시설공제 가입 및 재난관리 교육(정기가입 교재).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "교육시설공제사업운영규정(교육시설공제정보망-게시판-정관규정법령)",
                    file: "p101.pdf",
                    download: "17-07-03 교육시설공제사업운영규정(교육시설공제정보망-게시판-정관규정법령).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "공제급여 신청안내(신청절차, 신청서류, 정보망 이용안내)",
                    file: "p102.hwpx",
                    download: "17-07-04 공제급여 신청안내(신청절차, 신청서류, 정보망 이용안내).hwpx",
                    kind: "hwp",
                  },
                  {
                    name: "경기도교육청 재무관리과_(붙임) 폐교재산 활용 가이드라인(26.1.)",
                    file: "p105.pdf",
                    download: "경기도교육청 재무관리과_(붙임) 폐교재산 활용 가이드라인(26.1.).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "공유재산 및 물품 관리법(법률)(제19990호)(20240710)",
                    file: "p106.pdf",
                    download: "공유재산 및 물품 관리법(법률)(제19990호)(20240710).pdf",
                    kind: "pdf",
                  },
                  {
                    name: "공유재산관리 관련 FAQ 답변 모음 (2023. 2. 20.)",
                    file: "p107.hwp",
                    download: "공유재산관리 관련 FAQ 답변 모음 (2023. 2. 20.).hwp",
                    kind: "hwp",
                  },
              ],
            },
          ],
        },
      ],
    }),
  },

  // ── 행정공통분야 ──────────────────────────────────────────────

  // 복무
  service: {
    intro: "복무 관련 자료입니다.",
    sections: [],
    tabs: tabbed("service", {
      manual: [
        {
          title: "신규공무원 성장입문서(행정공통)",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "성장입문서 발췌 — Ⅲ. 복무·출장·초과근무",
                  file: "primer-service.pdf",
                  download: "신규공무원 성장입문서(행정공통) - 복무.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "복무 자료",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "나이스 복무 연가저축 사용자 설명서",
                  file: "nice-leave-savings.pdf",
                  download: "나이스 복무 연가저축 사용자 설명서(2025.12.).pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 인사
  personnel: {
    sections: [],
    tabs: tabbed("personnel", {
      manual: [
        {
          title: "신규공무원 성장입문서(행정공통)",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "성장입문서 발췌 — Ⅳ. 발령·전보·승진",
                  file: "primer-personnel.pdf",
                  download: "신규공무원 성장입문서(행정공통) - 인사(발령·전보·승진).pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 교육훈련
  training: {
    sections: [],
    tabs: tabbed("training", {
      manual: [
        {
          title: "신규공무원 성장입문서(행정공통)",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "성장입문서 발췌 — Ⅳ. 교육훈련",
                  file: "primer-training.pdf",
                  download: "신규공무원 성장입문서(행정공통) - 교육훈련.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 보안
  security: {
    intro: "정보보안·개인정보보호 관련 자료입니다.",
    sections: [],
    tabs: tabbed("security", {
      manual: [
        {
          title: "신규공무원 성장입문서(행정공통)",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "성장입문서 발췌 — Ⅴ. 보안",
                  file: "primer-security.pdf",
                  download: "신규공무원 성장입문서(행정공통) - 보안.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "정보보안",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "정보보안 및 개인정보보호 교육자료",
                  file: "security-privacy-edu.hwp",
                  download: "[정보보안] 정보보안 및 개인정보보호 교육자료.hwp",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 전화응대, 민원, 정보공개
  "civil-affairs": {
    intro: "민원(국민신문고)·정보공개 관련 자료입니다.",
    sections: [],
    tabs: tabbed("civil-affairs", {
      manual: [
        {
          title: "신규공무원 성장입문서(행정공통)",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "성장입문서 발췌 — Ⅴ. 전화민원 응대",
                  file: "primer-civil.pdf",
                  download: "신규공무원 성장입문서(행정공통) - 전화민원 응대.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "국민신문고·민원",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "국민신문고 민원 처리 매뉴얼",
                  file: "sinmungo-manual.hwpx",
                  download: "[신문고] 국민신문고 민원 처리 매뉴얼(25.6.).hwpx",
                  kind: "hwp",
                },
                {
                  name: "국민신문고 모범 답변 표준안",
                  file: "sinmungo-answer.hwpx",
                  download: "[신문고] 국민신문고 모범 답변 표준안(26. 4.).hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "정보공개",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "정보공개 결정통지 표준안",
                  file: "infodisclosure-notice.hwpx",
                  download: "[정보공개] 정보공개 결정통지 표준안(2026).hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 홍보·보도
  "pr-press": {
    intro: "보도자료 작성·제출 관련 자료입니다.",
    sections: [],
    tabs: tabbed("pr-press", {
      manual: [
        {
          title: "보도자료",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "2026 보도자료 서식",
                  file: "press-form-2026.hwp",
                  download: "[보도자료] ＃2026 보도자료 서식.hwp",
                  kind: "hwp",
                },
                {
                  name: "보도자료 제출절차 및 유의사항",
                  file: "press-guide.pdf",
                  download: "[보도자료] 보도자료 제출절차 및 유의사항.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 공무원복지
  welfare: {
    intro: "맞춤형 복지제도 관련 서식과 매뉴얼입니다.",
    sections: [],
    tabs: tabbed("welfare", {
      forms: [
        {
          title: "맞춤형 복지 서식",
          blocks: [
            {
              type: "files",
              dir: "welfare",
              items: [
                {
                  name: "2026년 맞춤형복지 신청서",
                  file: "w009.hwpx",
                  download: "2026년 신청서.hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
      ],
      manual: [
        {
          title: "신규공무원 성장입문서(행정공통)",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "성장입문서 발췌 — Ⅱ. 나를 위한 보상, 공무원 복지",
                  file: "primer-welfare.pdf",
                  download: "신규공무원 성장입문서(행정공통) - 공무원 복지.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "업무처리 기준",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "2026년 맞춤형 복지제도 업무처리 기준",
                  file: "welfare-2026.hwp",
                  download:
                    "경기도교육복지종합센터 기획운영부_붙임1. 2026년 맞춤형 복지제도 업무처리 기준.hwp",
                  kind: "hwp",
                },
              ],
            },
            {
              type: "files",
              dir: "welfare",
              items: [
                {
                  name: "2026학년도 기간제교원 맞춤형복지제도 업무처리 기준",
                  file: "w005.hwp",
                  download:
                    "경기도교육복지종합센터 기획운영부_[붙임2] 2026학년도 기간제교원 맞춤형복지제도 업무처리 기준.hwp",
                  kind: "hwp",
                },
                {
                  name: "2026년 사립학교 교육공무직원 맞춤형복지 업무처리 기준",
                  file: "w006.hwp",
                  download:
                    "경기도교육청 사립학교과_(발송)2026년 사립학교 교육공무직원 맞춤형복지 업무처리 기준.hwp",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
        {
          title: "업무매뉴얼·지급처리",
          blocks: [
            {
              type: "files",
              dir: "welfare",
              items: [
                {
                  name: "맞춤형복지 기관담당자 업무매뉴얼",
                  file: "w001.pdf",
                  download: "맞춤형복지 기관담당자 업무매뉴얼.pdf",
                  kind: "pdf",
                },
                {
                  name: "맞춤형복지 기관담당자 업무매뉴얼(지급처리 및 마감)",
                  file: "w002.pdf",
                  download:
                    "(지급처리 및 마감)맞춤형복지기관담당자 업무매뉴얼.pdf",
                  kind: "pdf",
                },
                {
                  name: "맞춤형복지 지급처리 방법",
                  file: "w003.hwp",
                  download: "맞춤형복지 지급처리 방법.hwp",
                  kind: "hwp",
                },
                {
                  name: "2026년 맞춤형복지 지급일정",
                  file: "w004.xlsx",
                  download: "2026년 맞춤형복지 지급일정.xlsx",
                  kind: "xls",
                },
              ],
            },
          ],
        },
        {
          title: "안내·질의응답",
          blocks: [
            {
              type: "files",
              dir: "welfare",
              items: [
                {
                  name: "2026년 공무원 단체보험 안내문(실손의료비 포함)",
                  file: "w007.pdf",
                  download:
                    "경기도교육복지종합센터 기획운영부_붙임2. 2026년 공무원 단체보험 안내문(실손의료비 포함).pdf",
                  kind: "pdf",
                },
                {
                  name: "2026년 맞춤형복지 담당자 교육 현장 주요 질의응답",
                  file: "w008.pdf",
                  download: "2026년 맞춤형복지 담당자 교육 현장 주요 질의응답.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 예산 용어 설명
  "budget-terms": {
    sections: [],
    tabs: tabbed("budget-terms", {
      manual: [
        {
          title: "신규공무원 성장입문서(행정공통)",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "성장입문서 발췌 — Ⅴ. 예산",
                  file: "primer-budget.pdf",
                  download: "신규공무원 성장입문서(행정공통) - 예산.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 기록물관리
  records: { sections: [], tabs: tabbed("records") },

  // 시설관리
  facility: { sections: [], tabs: tabbed("facility") },

  // 공문서작성법
  "official-docs": {
    sections: [],
    tabs: tabbed("official-docs", {
      manual: [
        {
          title: "신규공무원 성장입문서(행정공통)",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "성장입문서 발췌 — Ⅴ. 공문서 작성",
                  file: "primer-docs.pdf",
                  download: "신규공무원 성장입문서(행정공통) - 공문서.pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 위원회 운영 기본 방법
  committee: {
    intro: "각종 위원회 설치·운영 관련 자료입니다.",
    sections: [],
    tabs: tabbed("committee", {
      manual: [
        {
          title: "위원회 운영",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "각종 위원회 설치 및 운영 업무처리 지침(2026)",
                  file: "committee-guide-2026.hwpx",
                  download:
                    "[지원청 위원회] 안성교육지원청 각종 위원회 설치 및 운영 업무처리 지침(2026년).hwpx",
                  kind: "hwp",
                },
              ],
            },
          ],
        },
      ],
    }),
  },

  // 행정공통 전반
  "admin-general": {
    intro: "행정공통 전반의 종합 매뉴얼·입문서·참고자료입니다.",
    sections: [],
    tabs: tabbed("admin-general", {
      manual: [
        {
          title: "종합 매뉴얼·입문서",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "신규공무원을 위한 성장입문서(행정공통)",
                  file: "primer-2026.pdf",
                  download: "1. 신규공무원을 위한 성장입문서(행정공통).pdf",
                  kind: "pdf",
                },
                {
                  name: "2026 학교 업무매뉴얼 행정",
                  file: "admin-manual-2026.pdf",
                  download: "2026 학교 업무매뉴얼 행정 - 최종 - 수정.pdf",
                  kind: "pdf",
                },
                {
                  name: "2026 학교 업무매뉴얼[행정] 개정 내역(2차)",
                  file: "admin-manual-changes.pdf",
                  download:
                    "경기도교육청 행정관리담당관_[붙임2] 2026학년도 학교 업무매뉴얼[행정] 인쇄본[책자형] 개정 내역(2차).pdf",
                  kind: "pdf",
                },
              ],
            },
          ],
        },
        {
          title: "시스템·참고자료",
          blocks: [
            {
              type: "files",
              dir: "gongtong",
              items: [
                {
                  name: "교데통(데이터취합) 사용자 메뉴얼",
                  file: "gyodaetong-manual.pdf",
                  download: "[교데통] 데이터취합 사용자 메뉴얼.pdf",
                  kind: "pdf",
                },
                {
                  name: "업무에 참고하면 좋은 사이트 모음집",
                  file: "useful-sites.docx",
                  download: "업무에 참고하면 좋은 사이트 모음집.docx",
                  kind: "doc",
                },
              ],
            },
          ],
        },
      ],
    }),
  },
};
