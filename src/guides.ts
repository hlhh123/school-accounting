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
        kind: "pdf" | "hwp";
      }[];
    };

export type GuideSection = { title: string; blocks: Block[] };
export type GuideTab = {
  key: string;
  label: string;
  // 업로드(Supabase) 네임스페이스 — 이 탭에 올린 자료는 guide=docKey 로 저장됩니다.
  docKey: string;
  sections: GuideSection[];
};
export type Guide = {
  source?: string;
  intro?: string;
  sections: GuideSection[];
  // tabs 가 있으면 GuideView 가 탭 UI 로 표시하고 각 탭의 sections 를 사용합니다.
  tabs?: GuideTab[];
};

export const guides: Record<string, Guide> = {
  // 지출
  expense: {
    intro:
      "지출 업무에 필요한 매뉴얼·지침·서식을 분류별로 모았습니다. 항목을 클릭하면 문서를 열거나 내려받을 수 있습니다.",
    sections: [],
    tabs: [
      {
        key: "forms",
        label: "지출서식",
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

  // 계약 (개요)
  contract: { sections: [] },

  // 계약 > 물품
  "contract-goods": { sections: [] },

  // 계약 > 공사
  "contract-construction": { sections: [] },

  // 계약 > 용역
  "contract-service": { sections: [] },

  // 계약 > 급식
  "contract-meal": { sections: [] },

  // 공무원급여 (지방공무원·교육공무원)
  "salary-official": { sections: [] },

  // 공무직급여 (교육공무직원)
  "salary-worker": { sections: [] },

  // 물품재산
  property: { sections: [] },

  // ── 행정공통분야 ──────────────────────────────────────────────

  // 복무
  service: {
    intro: "복무 관련 자료입니다.",
    sections: [
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
  },

  // 보안
  security: {
    intro: "정보보안·개인정보보호 관련 자료입니다.",
    sections: [
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
  },

  // 전화응대, 민원, 정보공개
  "civil-affairs": {
    intro: "민원(국민신문고)·정보공개 관련 자료입니다.",
    sections: [
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
  },

  // 공무원복지
  welfare: {
    intro: "공무원 복지제도 관련 자료입니다.",
    sections: [
      {
        title: "맞춤형 복지",
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
        ],
      },
    ],
  },

  // 위원회 운영 기본 방법
  committee: {
    intro: "각종 위원회 설치·운영 관련 자료입니다.",
    sections: [
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
  },
};
