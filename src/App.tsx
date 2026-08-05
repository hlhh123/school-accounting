import { useEffect, useState, type ReactNode } from "react";
import "./App.css";
import AdminPage from "./AdminPage";
import { fetchNotices, type Notice } from "./lib/notices";
import { summaryBase, sharedBase, gwansaBase, type TableData } from "./gwansaData";
import { fetchGwansaBundle, type GwansaBundle } from "./lib/gwansa";
import { matjibRegions, type MatjibRegion } from "./matjibData";
import {
  fetchMatjibRegions,
  createRestaurant,
  type MatjibKind,
} from "./lib/matjib";
import { DutyCalendarCard, DutyCalendarView } from "./DutyCalendarUI";
import GuideView from "./GuideView";
import BoardView from "./BoardView";
import { guides } from "./guides";
import {
  catalog,
  findItem,
  GROUP_ORDER,
  type CatalogItem,
} from "./catalog";

function goHome() {
  window.location.hash = "";
}

function openItem(slug: string) {
  window.location.hash = `#/i/${slug}`;
}

function DataTable({ data }: { data: TableData }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {data.headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
          {data.footer && (
            <tr className="table-footer-row">
              {data.footer.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// 상세 페이지 공통 레이아웃(헤더 + 푸터)
function DetailShell({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <button type="button" className="logo-area" onClick={goHome}>
            <img
              className="logo-mark"
              src="/logo.png"
              alt="안성교육지원청"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="logo">안성교육지원청 행정업무지원기</span>
          </button>
          <nav className="navigation">
            <button type="button" className="nav-link" onClick={goHome}>
              홈
            </button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="footer-inner">
          <strong>안성교육지원청 행정업무지원기</strong>
          <p>본 사이트는 행정업무 편의를 위한 참고용 시스템입니다.</p>
        </div>
      </footer>
    </div>
  );
}

type GwansaTab = "summary" | "shared" | "gwansa";

function GwansaView() {
  const [tab, setTab] = useState<GwansaTab>("summary");
  const [bundle, setBundle] = useState<GwansaBundle | null>(null);

  useEffect(() => {
    fetchGwansaBundle().then(setBundle);
  }, []);

  const selectTab = (next: GwansaTab) => {
    // 활성화된 버튼을 다시 누르면 요약으로 돌아갑니다.
    setTab((prev) => (prev === next ? "summary" : next));
  };

  return (
    <section className="gwansa">
      <div className="section-inner">
        <button type="button" className="back-link" onClick={goHome}>
          ← 홈으로 돌아가기
        </button>

        <div className="gwansa-heading">
          <p>생활 정보</p>
          <h3>공동사택·관사 입주 현황</h3>
        </div>

        {!bundle ? (
          <p className="gwansa-loading">불러오는 중…</p>
        ) : (
          <>
            <div className="gwansa-tabs">
              <button
                type="button"
                className={`gwansa-tab${tab === "shared" ? " is-active" : ""}`}
                onClick={() => selectTab("shared")}
              >
                공동사택
              </button>
              <button
                type="button"
                className={`gwansa-tab${tab === "gwansa" ? " is-active" : ""}`}
                onClick={() => selectTab("gwansa")}
              >
                관사
              </button>
            </div>

            {tab === "summary" && (
              <div className="gwansa-panel">
                <div className="panel-head">
                  <h4>전체 요약</h4>
                  <span className="panel-base">{summaryBase}</span>
                </div>

                <p className="panel-caption">구분별 현황</p>
                <DataTable data={bundle.summaryType} />

                <p className="panel-caption">세부구분 현황</p>
                <DataTable data={bundle.summaryDetail} />

                <p className="panel-hint">
                  위 <strong>공동사택</strong> 또는 <strong>관사</strong> 버튼을
                  누르면 각 항목의 상세 현황을 확인할 수 있습니다.
                </p>
              </div>
            )}

            {tab === "shared" && (
              <div className="gwansa-panel">
                <div className="panel-head">
                  <h4>공동사택 현황</h4>
                  <span className="panel-base">{sharedBase}</span>
                </div>
                <DataTable data={bundle.shared} />
              </div>
            )}

            {tab === "gwansa" && (
              <div className="gwansa-panel">
                <div className="panel-head">
                  <h4>관사 현황</h4>
                  <span className="panel-base">{gwansaBase}</span>
                </div>
                <DataTable data={bundle.gwansa} />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// 일반 항목의 상세 페이지(추후 백엔드/콘텐츠 연결 지점)
function DetailPage({ item, crumb }: { item: CatalogItem; crumb: string }) {
  return (
    <section className="detail">
      <div className="section-inner">
        <button type="button" className="back-link" onClick={goHome}>
          ← 홈으로 돌아가기
        </button>

        <div className="detail-heading">
          <p>{crumb}</p>
          <h3>{item.title}</h3>
          <p className="detail-desc">{item.description}</p>
        </div>

        <div className="detail-placeholder">
          <p className="detail-placeholder-title">준비 중입니다</p>
          <p>«{item.title}» 관련 자료와 기능이 이곳에 추가될 예정입니다.</p>
        </div>
      </div>
    </section>
  );
}

// 하위 카테고리가 있는 항목(예: 계약)의 목록 페이지
function SubCategoryPage({ item, crumb }: { item: CatalogItem; crumb: string }) {
  return (
    <section className="detail">
      <div className="section-inner">
        <button type="button" className="back-link" onClick={goHome}>
          ← 홈으로 돌아가기
        </button>

        <div className="detail-heading">
          <p>{crumb}</p>
          <h3>{item.title}</h3>
          <p className="detail-desc">{item.description}</p>
        </div>

        <div className="service-grid">
          {item.children?.map((child) => (
            <button
              type="button"
              className="service-card"
              key={child.slug}
              onClick={() => openItem(child.slug)}
            >
              <span className="service-title">{child.title}</span>
              <span className="service-description">{child.description}</span>
              <span className="service-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

const MATJIB_FIELDS: {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
}[] = [
  { key: "region", label: "지역", placeholder: "예: 공도읍", required: true },
  { key: "category", label: "분류", placeholder: "예: 한 식 · 디저트" },
  { key: "name", label: "상호", placeholder: "가게 이름", required: true },
  { key: "phone", label: "연락처", placeholder: "예: 031-000-0000" },
  { key: "address", label: "주소", placeholder: "도로명 주소" },
  { key: "hours", label: "영업시간/휴무", placeholder: "예: 매일 11:00~21:00" },
];

const EMPTY_MATJIB = {
  region: "",
  category: "",
  name: "",
  phone: "",
  address: "",
  hours: "",
};

function MatjibAddForm({
  kind,
  kindLabel,
  regions,
  onAdded,
}: {
  kind: MatjibKind;
  kindLabel: string;
  regions: MatjibRegion[];
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_MATJIB });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.region.trim() || !form.name.trim()) {
      setError("지역과 상호는 필수입니다.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createRestaurant({
        region: form.region.trim(),
        category: form.category.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        hours: form.hours.trim(),
        kind,
      });
      setForm({ ...EMPTY_MATJIB });
      setOpen(false);
      onAdded();
    } catch {
      setError("등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="matjib-add-bar">
        <button
          type="button"
          className="matjib-add-toggle"
          onClick={() => setOpen(true)}
        >
          + {kindLabel} 추가
        </button>
      </div>
    );
  }

  return (
    <form className="matjib-add-form" onSubmit={submit}>
      <div className="matjib-add-head">
        <h4>{kindLabel} 추가</h4>
        <span>누구나 자유롭게 등록할 수 있어요.</span>
      </div>
      <div className="matjib-add-grid">
        {MATJIB_FIELDS.map((field) => (
          <label className="matjib-add-field" key={field.key}>
            <span>
              {field.label}
              {field.required && <em> *</em>}
            </span>
            <input
              type="text"
              value={form[field.key as keyof typeof form]}
              placeholder={field.placeholder}
              list={field.key === "region" ? "matjib-region-list" : undefined}
              onChange={(e) => set(field.key, e.target.value)}
            />
          </label>
        ))}
      </div>
      <datalist id="matjib-region-list">
        {regions.map((r) => (
          <option value={r.region} key={r.region} />
        ))}
      </datalist>
      {error && <p className="matjib-add-error">{error}</p>}
      <div className="matjib-add-actions">
        <button
          type="button"
          className="matjib-add-cancel"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          취소
        </button>
        <button type="submit" className="matjib-add-submit" disabled={saving}>
          {saving ? "등록 중…" : "등록"}
        </button>
      </div>
    </form>
  );
}

const MATJIB_TABS: { key: MatjibKind; label: string }[] = [
  { key: "restaurant", label: "음식점" },
  { key: "cafe", label: "카페" },
];

function MatjibView() {
  const [kind, setKind] = useState<MatjibKind>("restaurant");
  const [region, setRegion] = useState<string>("전체");
  const [data, setData] = useState<Record<MatjibKind, MatjibRegion[]>>({
    restaurant: matjibRegions,
    cafe: [],
  });

  const reload = () =>
    Promise.all([
      fetchMatjibRegions("restaurant"),
      fetchMatjibRegions("cafe"),
    ]).then(([restaurant, cafe]) => setData({ restaurant, cafe }));

  useEffect(() => {
    reload();
  }, []);

  const kindLabel =
    MATJIB_TABS.find((t) => t.key === kind)?.label ?? "음식점";
  const regions = data[kind];
  const total = regions.reduce((acc, r) => acc + r.items.length, 0);
  const shown =
    region === "전체" ? regions : regions.filter((r) => r.region === region);

  return (
    <section className="matjib">
      <div className="section-inner">
        <button type="button" className="back-link" onClick={goHome}>
          ← 홈으로 돌아가기
        </button>

        <div className="matjib-heading">
          <p>생활 정보</p>
          <h3>안성 맛집</h3>
          <p className="matjib-count">
            {kindLabel} · 총 {total}곳 · {regions.length}개 지역
          </p>
        </div>

        <div className="matjib-tabs">
          {MATJIB_TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              className={`matjib-tab${kind === t.key ? " is-active" : ""}`}
              onClick={() => {
                setKind(t.key);
                setRegion("전체");
              }}
            >
              {t.label}
              <span>{data[t.key].reduce((a, r) => a + r.items.length, 0)}</span>
            </button>
          ))}
        </div>

        <MatjibAddForm
          kind={kind}
          kindLabel={kindLabel}
          regions={regions}
          onAdded={reload}
        />

        {regions.length === 0 ? (
          <p className="matjib-empty">
            아직 등록된 {kindLabel}이(가) 없어요. 위 “+ {kindLabel} 추가”로 첫
            번째 장소를 등록해 보세요.
          </p>
        ) : null}

        <div className="matjib-filter">
          <button
            type="button"
            className={`matjib-chip${region === "전체" ? " is-active" : ""}`}
            onClick={() => setRegion("전체")}
          >
            전체
          </button>
          {regions.map((r) => (
            <button
              type="button"
              key={r.region}
              className={`matjib-chip${region === r.region ? " is-active" : ""}`}
              onClick={() => setRegion(r.region)}
            >
              {r.region}
            </button>
          ))}
        </div>

        {shown.map((r) => (
          <div className="matjib-region" key={r.region}>
            <h4 className="matjib-region-title">
              {r.region}
              <span>{r.items.length}곳</span>
            </h4>
            <div className="matjib-grid">
              {r.items.map((it, i) => (
                <div className="matjib-card" key={i}>
                  <div className="matjib-card-head">
                    <span className="matjib-name">{it.name}</span>
                    {it.category && (
                      <span className="matjib-cat">{it.category}</span>
                    )}
                  </div>
                  {it.address && <p className="matjib-addr">{it.address}</p>}
                  <div className="matjib-meta">
                    {it.phone && (
                      <a
                        className="matjib-phone"
                        href={`tel:${it.phone.replace(/[^0-9]/g, "")}`}
                      >
                        {it.phone}
                      </a>
                    )}
                    {it.hours && (
                      <span className="matjib-hours">{it.hours}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// 공지사항 모달 (대시보드 사이드바 버튼으로 열림, 어두운 테마)
function NoticesModal({ onClose }: { onClose: () => void }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices()
      .then(setNotices)
      .catch(() => setNotices([]));
  }, []);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div
      className="dash-modal-overlay"
      role="button"
      tabIndex={0}
      aria-label="닫기"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") onClose();
      }}
    >
      <div
        className="dash-modal"
        role="dialog"
        aria-modal="true"
        aria-label="공지사항"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dash-modal-head">
          <h3>공지사항</h3>
          <button type="button" className="dash-modal-x" onClick={onClose}>
            ✕
          </button>
        </div>
        {notices.length === 0 ? (
          <p className="dash-modal-empty">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="dash-notice-list">
            {notices.map((n) => {
              const open = openId === n.id;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    className="dash-notice-line"
                    onClick={() => toggle(n.id)}
                    aria-expanded={open}
                  >
                    <span className="dash-notice-title">
                      {n.pinned && <span className="dash-notice-pin">고정</span>}
                      {n.title}
                    </span>
                    <span className="dash-notice-date">
                      {n.created_at.slice(0, 10)}
                    </span>
                  </button>
                  {open && n.body && <p className="dash-notice-body">{n.body}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// 항목별 아이콘 (단색 선 아이콘)
const ITEM_ICONS: Record<string, ReactNode> = {
  // 업무
  expense: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  contract: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 13l2 2 4-4" />
    </>
  ),
  property: (
    <>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </>
  ),
  "salary-official": (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10.5h18M16 15h2.5" />
    </>
  ),
  "salary-worker": (
    <>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
      <path d="M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
    </>
  ),
  // 생활 정보
  gwansa: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5.5 10v10h13V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  food: (
    <>
      <path d="M6 3v7a2 2 0 104 0V3" />
      <path d="M8 10v11" />
      <path d="M16.5 3c-1.7 0-3 2.2-3 5s1.3 4 3 4v9" />
    </>
  ),
  board: (
    <>
      <path d="M4 5h12v9H9l-5 4z" />
      <path d="M7.5 9.5h5" />
    </>
  ),
  // 행정공통분야
  "admin-general": (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v16" />
    </>
  ),
  service: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  personnel: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0114 0" />
    </>
  ),
  training: (
    <>
      <path d="M4 6h16v13H4z" />
      <path d="M12 6v13M4 6l8-2 8 2" />
    </>
  ),
  welfare: <path d="M12 20s-7-4.5-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.5-7 9-7 9z" />,
  "official-docs": (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 12h7M9 16h5" />
    </>
  ),
  records: <path d="M4 6h6l2 2h8v11H4z" />,
  security: <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />,
  "civil-affairs": (
    <path d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" />
  ),
  "pr-press": (
    <>
      <path d="M4 9v6h4l6 4V5L8 9z" />
      <path d="M18 8a6 6 0 010 8" />
    </>
  ),
  "budget-terms": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 10.5h5M9.5 13.5h5" />
    </>
  ),
  facility: (
    <>
      <path d="M4 20V9l8-5 8 5v11z" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  committee: (
    <>
      <circle cx="8" cy="9" r="2.5" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3 19a5 5 0 0110 0M11 19a5 5 0 0110 0" />
    </>
  ),
};

function ItemIcon({ slug }: { slug: string }) {
  const paths = ITEM_ICONS[slug];
  if (!paths) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths}
    </svg>
  );
}

// ── 홈 대시보드 ──────────────────────────────────────────────
const WORK_CAT = catalog.find((c) => c.key === "work");
const GUIDE_CAT = catalog.find((c) => c.key === "guide");
const LIFE_CAT = catalog.find((c) => c.key === "life");

// 오른쪽 배너 열의 안성 바로가기 링크(외부 사이트, 새 탭)
const ANSEONG_LINKS: { label: string; href: string }[] = [
  { label: "안성 배움e", href: "https://www.anseong.go.kr/edu/main.do" },
  { label: "안성교육지원청", href: "https://www.goean.kr/" },
  { label: "안성시청 홈페이지", href: "https://www.anseong.go.kr/main.do" },
  { label: "아트홀 / 평생학습관", href: "https://www.anseong.go.kr/arthall/main.do" },
  { label: "안성 문화관광", href: "https://www.anseong.go.kr/tour/main.do" },
];

type DashMenu = { key: string; label: string; icon: ReactNode };
const DASH_MENU: DashMenu[] = [
  {
    key: "home",
    label: "홈 대시보드",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    key: "cal",
    label: "직무달력",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </>
    ),
  },
  {
    key: "work",
    label: "업무",
    icon: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
  },
  {
    key: "gong",
    label: "행정공통분야",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 4v16" />
      </>
    ),
  },
  {
    key: "life",
    label: "안성 생활정보",
    icon: (
      <>
        <path d="M3 11l9-7 9 7" />
        <path d="M5.5 10v10h13V10" />
      </>
    ),
  },
];

type Theme = "dark" | "light";

function DashboardHome() {
  const [active, setActive] = useState("home");
  const [showNotices, setShowNotices] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("dash-theme")
        : null;
    return saved === "light" ? "light" : "dark";
  });

  // 대시보드에서는 #root의 1126px 둥근 틀을 풀어 화면 전체를 채운다.
  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.add("root-dashboard");
    return () => root?.classList.remove("root-dashboard");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dash-theme", theme);
    } catch {
      /* 저장 불가 환경 무시 */
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  const onMenu = (key: string) => {
    setActive(key);
    if (key === "cal") {
      // 직무달력 카드로 포커스(상세는 카드의 '전체 보기'에서 이동)
      document.getElementById("dash-cal")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      return;
    }
    if (key === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(`dash-${key}`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  const featured = GUIDE_CAT ? GUIDE_CAT.items.filter((i) => i.featured) : [];
  const groups = GUIDE_CAT
    ? GROUP_ORDER.map((name) => ({
        name,
        items: GUIDE_CAT.items.filter((i) => i.group === name),
      })).filter((g) => g.items.length > 0)
    : [];

  return (
    <div className={`dashboard${theme === "light" ? " is-light" : ""}`}>
      <div className="dash-layout">
        {/* 사이드바 */}
        <aside className="dash-side">
          <div className="dash-brand">
            <span className="dash-logo" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3 11l9-7 9 7" />
                <path d="M5.5 10v10h13V10" />
                <path d="M10 20v-6h4v6" />
              </svg>
            </span>
            <span className="dash-brand-tx">
              <span className="dash-brand-org">안성교육지원청</span>
              <span className="dash-brand-title">
                학교 행정업무
                <br />
                활동지원기
              </span>
            </span>
          </div>

          <nav className="dash-menu" aria-label="바로가기">
            <p className="dash-menu-h">바로가기</p>
            {DASH_MENU.map((m) => (
              <button
                type="button"
                key={m.key}
                className={`dash-m${active === m.key ? " is-active" : ""}`}
                onClick={() => onMenu(m.key)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {m.icon}
                </svg>
                {m.label}
              </button>
            ))}
          </nav>

          <div className="dash-side-bottom">
            <button
              type="button"
              className="dash-theme"
              onClick={toggleTheme}
              aria-label="화면 모드 전환"
            >
              {theme === "dark" ? (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
                  </svg>
                  라이트 모드
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 14.5A8 8 0 019.5 4 7 7 0 1020 14.5z" />
                  </svg>
                  다크 모드
                </>
              )}
            </button>
            <div className="dash-side-mini">
              <button type="button" onClick={() => setShowNotices(true)}>
                공지사항
              </button>
              <a href="#/admin">관리자</a>
            </div>
            <p className="dash-side-note">
              본 사이트는 행정업무 편의를 위한 참고용 시스템입니다.
            </p>
          </div>
        </aside>

        {/* 오른쪽 2×2 */}
        <div className="dash-main">
          <div className="dash-col dash-col-left">
            {/* 업무 */}
            <section className="dash-card sz-work" id="dash-work">
              <div className="dash-card-head">
                <h2 className="dash-card-title">업무</h2>
              </div>
              <div className="dash-card-body">
                <div className="dash-work-grid">
                  {WORK_CAT?.items.map((item) => (
                    <button
                      type="button"
                      key={item.slug}
                      className="dash-tile"
                      onClick={() => openItem(item.slug)}
                    >
                      <span className="dash-tile-ic">
                        <ItemIcon slug={item.slug} />
                      </span>
                      <span className="dash-tile-tx">
                        <span className="dash-tile-t">{item.title}</span>
                        <span className="dash-tile-d">{item.description}</span>
                      </span>
                      <span className="dash-tile-go" aria-hidden="true">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 행정공통분야 */}
            <section className="dash-card sz-gong" id="dash-gong">
              <div className="dash-card-head">
                <h2 className="dash-card-title">행정공통분야</h2>
              </div>
              <div className="dash-card-body">
                {featured.length > 0 && (
                  <div className="dash-tags dash-overview-row">
                    {featured.map((item) => (
                      <button
                        type="button"
                        key={item.slug}
                        className="dash-tag"
                        onClick={() => openItem(item.slug)}
                      >
                        <ItemIcon slug={item.slug} />
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
                {groups.map((group) => (
                  <div className="dash-grp" key={group.name}>
                    <p className="dash-grp-h">{group.name}</p>
                    <div className="dash-tags">
                      {group.items.map((item) => (
                        <button
                          type="button"
                          key={item.slug}
                          className="dash-tag"
                          onClick={() => openItem(item.slug)}
                        >
                          <ItemIcon slug={item.slug} />
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="dash-col dash-col-right">
            {/* 직무달력 */}
            <section className="dash-card sz-cal" id="dash-cal">
              <div className="dash-card-head">
                <h2 className="dash-card-title">직무달력</h2>
                <button
                  type="button"
                  className="dash-more"
                  onClick={() => {
                    window.location.hash = "#/calendar";
                  }}
                >
                  전체 보기 ›
                </button>
              </div>
              <div className="dash-card-body">
                <DutyCalendarCard />
              </div>
            </section>

            {/* 안성 생활 정보 */}
            <section className="dash-card sz-life" id="dash-life">
              <div className="dash-card-head">
                <h2 className="dash-card-title">안성 생활 정보</h2>
              </div>
              <div className="dash-card-body">
                <div className="dash-life">
                  {LIFE_CAT?.items.map((item) => (
                    <button
                      type="button"
                      key={item.slug}
                      className="dash-lf"
                      onClick={() => openItem(item.slug)}
                    >
                      <span className="dash-lf-ic">
                        <ItemIcon slug={item.slug} />
                      </span>
                      <span className="dash-lf-tx">
                        <span className="dash-lf-t">{item.title}</span>
                        <span className="dash-lf-d">{item.description}</span>
                      </span>
                      <span className="dash-lf-go" aria-hidden="true">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* 오른쪽 배너 열 (G-ONE + 추후 배너) */}
        <aside className="dash-banners" aria-label="배너">
          <a
            className="dash-gbanner"
            href="https://gdp.goe.go.kr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="dash-gb-head">
              <span className="dash-gb-logo">G-ONE</span>
              <span className="dash-gb-portal">경기 업무협업포털</span>
            </div>
            <div className="dash-gb-card">
              <p className="dash-gb-ai">[AI 대화] 무엇을 도와드릴까요?</p>
              <span className="dash-gb-input">무엇이든 물어보세요</span>
            </div>
            <p className="dash-gb-desc">
              지원이가 필요한 지침·매뉴얼을 AI로 찾아드려요
            </p>
            <span className="dash-gb-go">바로가기 ›</span>
          </a>

          <nav className="dash-links" aria-label="안성 바로가기">
            <p className="dash-links-h">안성 바로가기</p>
            {ANSEONG_LINKS.map((l) => (
              <a
                key={l.href}
                className="dash-link"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="dash-link-t">{l.label}</span>
                <span className="dash-link-go" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </nav>
        </aside>
      </div>

      {showNotices && <NoticesModal onClose={() => setShowNotices(false)} />}
    </div>
  );
}

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

function App() {
  const hash = useHashRoute();

  // 관리자 (#/admin 또는 이전 #admin 호환)
  if (hash.startsWith("#/admin") || hash.startsWith("#admin")) {
    return <AdminPage onExit={goHome} />;
  }

  // 직무달력 (#/calendar)
  if (hash.startsWith("#/calendar")) {
    return (
      <DetailShell>
        <DutyCalendarView />
      </DetailShell>
    );
  }

  // 상세 페이지 (#/i/{slug})
  if (hash.startsWith("#/i/")) {
    const slug = decodeURIComponent(hash.slice("#/i/".length));
    const found = findItem(slug);
    if (found) {
      return (
        <DetailShell>
          {found.item.special === "gwansa" ? (
            <GwansaView />
          ) : found.item.special === "board" ? (
            <BoardView />
          ) : found.item.special === "food" ? (
            <MatjibView />
          ) : guides[slug] ? (
            <GuideView
              key={slug}
              item={found.item}
              crumb={found.crumb}
              guide={guides[slug]}
              docGuideKey={slug}
            />
          ) : found.item.children?.length ? (
            <SubCategoryPage item={found.item} crumb={found.crumb} />
          ) : (
            <DetailPage item={found.item} crumb={found.crumb} />
          )}
        </DetailShell>
      );
    }
  }

  return <DashboardHome />;
}

export default App;
