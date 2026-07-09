// 메인화면 분류(카테고리 → 항목) 구조.
// 이 구조가 홈 화면 섹션과 상세 페이지 라우팅의 기준이 됩니다.
// 앞으로 백엔드/콘텐츠는 각 항목(slug) 단위로 붙이면 됩니다.

export type CatalogItem = {
  slug: string;
  title: string;
  description: string;
  special?: "gwansa" | "food"; // 전용 화면이 있는 항목
};

export type CatalogCategory = {
  key: string;
  sectionId: string; // 홈 화면 앵커(스크롤) id
  label: string; // 작은 라벨 / 상세 페이지 분류 표시
  heading: string; // 섹션 제목
  items: CatalogItem[];
  compact?: boolean; // 항목이 많은 섹션은 카드를 작게 표시
};

export const catalog: CatalogCategory[] = [
  {
    key: "work",
    sectionId: "work-areas",
    label: "업무",
    heading: "회계·예산·급여 업무",
    items: [
      {
        slug: "accounting",
        title: "회계",
        description: "학교회계 예산·지출·결산 업무를 확인합니다.",
      },
      {
        slug: "budget",
        title: "예산",
        description: "예산 편성과 집행 업무를 확인합니다.",
      },
      {
        slug: "salary-official",
        title: "공무원급여",
        description: "공무원 급여·수당 업무를 확인합니다.",
      },
      {
        slug: "salary-worker",
        title: "공무직급여",
        description: "공무직 급여·수당 업무를 확인합니다.",
      },
    ],
  },
  {
    key: "guide",
    sectionId: "work-guides",
    label: "업무 지침",
    heading: "행정공통분야",
    compact: true,
    items: [
      {
        slug: "service",
        title: "복무",
        description: "근무시간·휴가·출장 등 복무 기준을 안내합니다.",
      },
      {
        slug: "personnel",
        title: "인사",
        description: "임용·전보·평정 등 인사 업무를 안내합니다.",
      },
      {
        slug: "training",
        title: "교육훈련",
        description: "공무원 교육훈련 이수 방법을 안내합니다.",
      },
      {
        slug: "security",
        title: "보안",
        description: "문서·정보 보안 준수 사항을 안내합니다.",
      },
      {
        slug: "civil-affairs",
        title: "전화응대, 민원, 정보공개",
        description: "응대·민원 처리·정보공개 절차를 안내합니다.",
      },
      {
        slug: "welfare",
        title: "공무원복지",
        description: "맞춤형복지 등 복지 제도를 안내합니다.",
      },
      {
        slug: "budget-terms",
        title: "예산 용어 설명",
        description: "자주 쓰는 예산 용어를 정리했습니다.",
      },
      {
        slug: "records",
        title: "기록물관리",
        description: "기록물 등록·보존 방법을 안내합니다.",
      },
      {
        slug: "facility",
        title: "시설관리",
        description: "시설·물품 관리 기준을 안내합니다.",
      },
      {
        slug: "official-docs",
        title: "공문서작성법",
        description: "공문서 작성 기준과 예시를 확인합니다.",
      },
      {
        slug: "committee",
        title: "위원회 운영 기본 방법",
        description: "각종 위원회 구성·운영 방법을 안내합니다.",
      },
    ],
  },
  {
    key: "life",
    sectionId: "anseong-life",
    label: "생활 정보",
    heading: "신규자를 위한 안성 생활 정보",
    items: [
      {
        slug: "gwansa",
        title: "관사",
        description: "공동사택·관사 입주 현황을 확인합니다.",
        special: "gwansa",
      },
      {
        slug: "food",
        title: "맛집",
        description: "안성 지역 추천 맛집을 확인합니다.",
        special: "food",
      },
      {
        slug: "board",
        title: "자유게시판",
        description: "자유롭게 정보를 나누는 공간입니다.",
      },
    ],
  },
];

export function findItem(
  slug: string,
): { item: CatalogItem; category: CatalogCategory } | null {
  for (const category of catalog) {
    const item = category.items.find((i) => i.slug === slug);
    if (item) return { item, category };
  }
  return null;
}
