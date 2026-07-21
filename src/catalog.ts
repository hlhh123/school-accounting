// 메인화면 분류(카테고리 → 항목) 구조.
// 이 구조가 홈 화면 섹션과 상세 페이지 라우팅의 기준이 됩니다.
// 앞으로 백엔드/콘텐츠는 각 항목(slug) 단위로 붙이면 됩니다.

export type CatalogItem = {
  slug: string;
  title: string;
  description: string;
  special?: "gwansa" | "food" | "board"; // 전용 화면이 있는 항목
  children?: CatalogItem[]; // 하위 카테고리가 있는 항목 (예: 계약 → 공사/물품/용역/급식)
  group?: string; // 홈 화면에서 묶어 표시할 주제 그룹 (grouped 섹션에서만 사용)
  featured?: boolean; // 그룹 위에 대표 항목으로 크게 표시
};

export type CatalogCategory = {
  key: string;
  sectionId: string; // 홈 화면 앵커(스크롤) id
  label: string; // 작은 라벨 / 상세 페이지 분류 표시
  heading: string; // 섹션 제목
  items: CatalogItem[];
  compact?: boolean; // 항목이 많은 섹션은 카드를 작게 표시
  grouped?: boolean; // 주제 그룹 + 아이콘 타일 형태로 표시
};

// grouped 섹션에서 그룹을 표시할 순서
export const GROUP_ORDER = ["근무와 인사", "문서와 정보", "예산·시설·운영"];

export const catalog: CatalogCategory[] = [
  {
    key: "work",
    sectionId: "work-areas",
    label: "업무",
    heading: "지출·계약·급여 업무",
    items: [
      {
        slug: "expense",
        title: "지출",
        description: "지출 원인행위·품의·정산 등 지출 업무를 안내합니다.",
      },
      {
        slug: "contract",
        title: "계약",
        description: "공사·물품·용역·급식 계약 업무를 안내합니다.",
        children: [
          {
            slug: "contract-construction",
            title: "공사",
            description: "공사 계약 절차와 기준을 안내합니다.",
          },
          {
            slug: "contract-goods",
            title: "물품",
            description: "물품 구매 계약 절차를 안내합니다.",
          },
          {
            slug: "contract-service",
            title: "용역",
            description: "용역 계약 절차를 안내합니다.",
          },
          {
            slug: "contract-meal",
            title: "급식",
            description: "급식 관련 계약 절차를 안내합니다.",
          },
        ],
      },
      {
        slug: "property",
        title: "물품재산",
        description: "물품·재산의 취득·관리·처분을 안내합니다.",
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
    label: "행정공통분야",
    heading: "행정공통분야",
    grouped: true,
    items: [
      {
        slug: "admin-general",
        title: "행정공통 전반",
        description: "행정 종합 매뉴얼·성장입문서 등 전반 자료를 안내합니다.",
        featured: true,
      },
      {
        slug: "service",
        title: "복무",
        description: "근무시간·휴가·출장 등 복무 기준을 안내합니다.",
        group: "근무와 인사",
      },
      {
        slug: "personnel",
        title: "인사",
        description: "임용·전보·평정 등 인사 업무를 안내합니다.",
        group: "근무와 인사",
      },
      {
        slug: "training",
        title: "교육훈련",
        description: "공무원 교육훈련 이수 방법을 안내합니다.",
        group: "근무와 인사",
      },
      {
        slug: "welfare",
        title: "공무원복지",
        description: "맞춤형복지 등 복지 제도를 안내합니다.",
        group: "근무와 인사",
      },
      {
        slug: "official-docs",
        title: "공문서작성법",
        description: "공문서 작성 기준과 예시를 확인합니다.",
        group: "문서와 정보",
      },
      {
        slug: "records",
        title: "기록물관리",
        description: "기록물 등록·보존 방법을 안내합니다.",
        group: "문서와 정보",
      },
      {
        slug: "security",
        title: "보안",
        description: "문서·정보 보안 준수 사항을 안내합니다.",
        group: "문서와 정보",
      },
      {
        slug: "civil-affairs",
        title: "전화응대, 민원, 정보공개",
        description: "응대·민원 처리·정보공개 절차를 안내합니다.",
        group: "문서와 정보",
      },
      {
        slug: "pr-press",
        title: "홍보·보도",
        description: "보도자료 서식·제출 절차 등 홍보 자료를 안내합니다.",
        group: "문서와 정보",
      },
      {
        slug: "budget-terms",
        title: "예산 용어 설명",
        description: "자주 쓰는 예산 용어를 정리했습니다.",
        group: "예산·시설·운영",
      },
      {
        slug: "facility",
        title: "시설관리",
        description: "시설·물품 관리 기준을 안내합니다.",
        group: "예산·시설·운영",
      },
      {
        slug: "committee",
        title: "위원회 운영 기본 방법",
        description: "각종 위원회 구성·운영 방법을 안내합니다.",
        group: "예산·시설·운영",
      },
    ],
  },
  {
    key: "life",
    sectionId: "anseong-life",
    label: "생활 정보",
    heading: "안성 생활 정보",
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
        special: "board",
      },
    ],
  },
];

// 항목(및 하위 카테고리)을 찾아 반환. crumb 은 상세 페이지에 표시할 분류명.
export function findItem(
  slug: string,
): { item: CatalogItem; crumb: string } | null {
  for (const category of catalog) {
    for (const item of category.items) {
      if (item.slug === slug) return { item, crumb: category.label };
      if (item.children) {
        const child = item.children.find((c) => c.slug === slug);
        if (child) return { item: child, crumb: item.title };
      }
    }
  }
  return null;
}
