// 성장입문서(PDF) 내용을 카테고리별로 깔끔하게 재구성한 가이드 콘텐츠.
// 원문 이미지를 그대로 넣지 않고, 표·단계형 흐름도·용어·Q&A 등 블록으로 정리합니다.

export type Block =
  | { type: "text"; text: string }
  | { type: "terms"; items: { term: string; desc: string }[] }
  | { type: "table"; headers: string[]; rows: string[][]; note?: string }
  | { type: "steps"; items: string[]; note?: string }
  | { type: "list"; items: string[] }
  | { type: "qa"; items: { q: string; a: string }[] }
  | { type: "note"; title?: string; text: string };

export type GuideSection = { title: string; blocks: Block[] };
export type Guide = { source?: string; intro?: string; sections: GuideSection[] };

export const guides: Record<string, Guide> = {
  // 지출
  expense: { sections: [] },

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
