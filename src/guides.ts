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
      // file: public/docs/expense/ 안의 실제 파일명(ASCII), name: 화면 표시용 제목,
      // download: 내려받을 때 저장되는 원본 파일명(한글)
      items: {
        name: string;
        file: string;
        download: string;
        kind: "pdf" | "hwp";
      }[];
    };

export type GuideSection = { title: string; blocks: Block[] };
export type Guide = { source?: string; intro?: string; sections: GuideSection[] };

export const guides: Record<string, Guide> = {
  // 지출
  expense: {
    intro:
      "지출 업무에 필요한 매뉴얼·지침·서식을 분류별로 모았습니다. 항목을 클릭하면 문서를 열거나 내려받을 수 있습니다.",
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
                name: "업무추진비 증빙 간소화 안내",
                file: "eopmu-ganso.pdf",
                download: "학교회계 업무 간소화를 위한 개선사항 알림.pdf",
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
};
