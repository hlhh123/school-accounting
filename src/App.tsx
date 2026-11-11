import { useEffect, useRef, useState, type ReactNode } from "react";
import "./App.css";
import {
  fetchMessages,
  sendMessage,
  subscribeMessages,
  deleteMessage,
  type ChatMessage,
} from "./lib/chat";
import { useAdminAuth } from "./lib/useAdminAuth";
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
import { DutyCalendarView } from "./DutyCalendarUI";
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
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3 11l9-7 9 7" />
                <path d="M5.5 10v10h13V10" />
                <path d="M10 20v-6h4v6" />
              </svg>
            </span>
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

// 공지사항 모달 (상단바 종 아이콘으로 열림)
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
      className="portal-overlay"
      role="button"
      tabIndex={0}
      aria-label="닫기"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") onClose();
      }}
    >
      <div
        className="portal-modal"
        role="dialog"
        aria-modal="true"
        aria-label="공지사항"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>공지사항</h2>
        {notices.length === 0 ? (
          <p className="portal-modal-empty">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="portal-notice-list">
            {notices.map((n) => {
              const open = openId === n.id;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    className="portal-notice-line"
                    onClick={() => toggle(n.id)}
                    aria-expanded={open}
                  >
                    <span className="portal-notice-title">
                      {n.pinned && <span className="portal-notice-pin">고정</span>}
                      {n.title}
                    </span>
                    <span className="portal-notice-date">
                      {n.created_at.slice(0, 10)}
                    </span>
                  </button>
                  {open && n.body && (
                    <p className="portal-notice-body">{n.body}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="actions">
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </div>
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
  "unilife-2026": (
    <>
      <path d="M4 5.5C4 4.1 5.1 3 6.5 3H12v18H6.5A2.5 2.5 0 014 18.5z" />
      <path d="M20 5.5C20 4.1 18.9 3 17.5 3H12v18h5.5a2.5 2.5 0 002.5-2.5z" />
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
  { label: "안성시청", href: "https://www.anseong.go.kr/main.do" },
  { label: "안성 문화관광", href: "https://www.anseong.go.kr/tour/main.do" },
];

// 대관·신청 계열은 아래에 따로 묶어 둔다.
const ANSEONG_APPLY_LINKS: { label: string; href: string }[] = [
  {
    label: "아트홀 · 평생학습관",
    href: "https://www.anseong.go.kr/portal/rentFacility/apiList.do?mId=0710000000",
  },
  {
    label: "공유학교",
    href: "https://gong-u.goe.go.kr/anseong/contents/view?contentsNo=142&menuLevel=2&menuNo=297",
  },
];

// 두 자리로 맞춘 시각 표시(HH:MM)
function chatTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// 사이드바 실시간 질문방(Supabase Realtime 기반 익명 채팅)
function ChatRoom() {
  const { isLoggedIn } = useAdminAuth();
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [nick, setNick] = useState(
    () =>
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("chat-nick")) ||
      "",
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState<ChatMessage | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    fetchMessages()
      .then((m) => {
        if (alive) {
          setMsgs(m);
          setReady(true);
        }
      })
      .catch(() => {
        if (alive) {
          setFailed(true);
          setReady(true);
        }
      });
    const unsub = subscribeMessages(
      (m) => {
        setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      },
      (id) => {
        setMsgs((prev) => prev.filter((x) => x.id !== id));
      },
    );
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  // 새 메시지가 오면 맨 아래로 스크롤
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    const name = nick.trim() || "익명";
    try {
      localStorage.setItem("chat-nick", name);
    } catch {
      /* 무시 */
    }
    setSending(true);
    try {
      const saved = await sendMessage(
        name,
        body,
        reply ? { id: reply.id, nickname: reply.nickname, body: reply.body } : null,
      );
      setText("");
      setReply(null);
      setMsgs((prev) =>
        prev.some((x) => x.id === saved.id) ? prev : [...prev, saved],
      );
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const startReply = (m: ChatMessage) => {
    setReply(m);
    inputRef.current?.focus();
  };

  const remove = async (m: ChatMessage) => {
    if (!window.confirm("이 메시지를 삭제할까요?")) return;
    try {
      await deleteMessage(m.id);
      setMsgs((prev) => prev.filter((x) => x.id !== m.id));
    } catch {
      window.alert("삭제하지 못했습니다.");
    }
  };

  return (
    <section className="dash-chat" aria-label="실시간 질문방">
      <div className="dash-chat-head">
        <span className="dash-chat-title">
          <span className="dash-chat-dot" aria-hidden="true" />
          실시간 질문방
        </span>
      </div>

      <div className="dash-chat-list" ref={listRef}>
        {!ready ? (
          <p className="dash-chat-empty">불러오는 중…</p>
        ) : failed ? (
          <p className="dash-chat-empty">
            질문방을 불러오지 못했습니다. (chat-setup.sql 실행 필요)
          </p>
        ) : msgs.length === 0 ? (
          <p className="dash-chat-empty">
            첫 질문을 남겨보세요. 실시간으로 함께 나눠요.
          </p>
        ) : (
          msgs.map((m) => (
            <div className="dash-chat-msg" key={m.id}>
              <span className="dash-chat-meta">
                <b>{m.nickname}</b>
                <span className="dash-chat-time">{chatTime(m.created_at)}</span>
                <span className="dash-chat-actions">
                  <button
                    type="button"
                    className="dash-chat-reply-btn"
                    onClick={() => startReply(m)}
                    aria-label={`${m.nickname} 님에게 답글`}
                  >
                    답글
                  </button>
                  {isLoggedIn && (
                    <button
                      type="button"
                      className="dash-chat-delete-btn"
                      onClick={() => remove(m)}
                      aria-label={`${m.nickname} 님 메시지 삭제`}
                    >
                      삭제
                    </button>
                  )}
                </span>
              </span>
              {m.reply_body && (
                <span className="dash-chat-quote">
                  <b>{m.reply_nick || "익명"}</b>
                  <span>{m.reply_body}</span>
                </span>
              )}
              <span className="dash-chat-body">{m.body}</span>
            </div>
          ))
        )}
      </div>

      <div className="dash-chat-form">
        {reply && (
          <div className="dash-chat-replybar">
            <span className="dash-chat-replybar-tx">
              <b>{reply.nickname}</b>
              <span>{reply.body}</span>
            </span>
            <button
              type="button"
              className="dash-chat-replybar-x"
              onClick={() => setReply(null)}
              aria-label="답글 취소"
            >
              ✕
            </button>
          </div>
        )}
        <input
          className="dash-chat-nick"
          type="text"
          value={nick}
          maxLength={12}
          onChange={(e) => setNick(e.target.value)}
          placeholder="닉네임"
          aria-label="닉네임"
        />
        <div className="dash-chat-send">
          <input
            ref={inputRef}
            className="dash-chat-input"
            type="text"
            value={text}
            maxLength={300}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
              else if (e.key === "Escape" && reply) setReply(null);
            }}
            placeholder="질문을 입력하세요"
            aria-label="질문 입력"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !text.trim()}
            aria-label="보내기"
          >
            ↑
          </button>
        </div>
      </div>
    </section>
  );
}

function WorkCard({ item }: { item: CatalogItem }) {
  const inner = (
    <>
      <span className="portal-workcard-top">
        <span className="portal-glyph">
          <ItemIcon slug={item.slug} />
        </span>
        <span className="portal-arrow" aria-hidden="true">
          ↗
        </span>
      </span>
      <span>
        <div className="portal-card-title">{item.title}</div>
        <div className="portal-card-desc">{item.description}</div>
      </span>
    </>
  );
  if (item.externalUrl) {
    return (
      <a
        className="portal-workcard"
        href={item.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      className="portal-workcard"
      onClick={() => openItem(item.slug)}
    >
      {inner}
    </button>
  );
}

function CommonCard({ item }: { item: CatalogItem }) {
  return (
    <button
      type="button"
      className="portal-commoncard"
      onClick={() => openItem(item.slug)}
    >
      <span className="portal-smallglyph">
        <ItemIcon slug={item.slug} />
      </span>
      <span>
        <strong>{item.title}</strong>
        <small>{item.description}</small>
      </span>
      <span className="portal-arrow" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

type PortalFilter = "전체" | "업무" | "행정공통분야";

function matchesQuery(item: CatalogItem, q: string): boolean {
  if (!q) return true;
  return `${item.title} ${item.description}`.toLowerCase().includes(q);
}

function DashboardHome() {
  const [showNotices, setShowNotices] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [active, setActive] = useState<PortalFilter>("전체");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // 대시보드에서는 #root의 1126px 둥근 틀을 풀어 화면 전체를 채운다.
  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.add("root-dashboard");
    return () => root?.classList.remove("root-dashboard");
  }, []);

  // Ctrl/Cmd+K로 검색창 포커스
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const workItems = WORK_CAT?.items ?? [];
  const guideItems = GUIDE_CAT?.items ?? [];
  const lifeItems = LIFE_CAT?.items ?? [];

  const workMatches = workItems.filter((i) => matchesQuery(i, q));
  const guideMatches = guideItems.filter((i) => matchesQuery(i, q));
  const featuredMatches = guideMatches.filter((i) => i.featured);
  const groupMatches = GROUP_ORDER.map((name) => ({
    name,
    items: guideMatches.filter((i) => i.group === name),
  })).filter((g) => g.items.length > 0);
  const lifeMatches = lifeItems.filter((i) => matchesQuery(i, q));

  const showWork =
    workMatches.length > 0 && (active === "전체" || active === "업무");
  const showGuide =
    (featuredMatches.length > 0 || groupMatches.length > 0) &&
    (active === "전체" || active === "행정공통분야");
  const showEmpty = !showWork && !showGuide;

  const siteLinks = [...ANSEONG_LINKS, ...ANSEONG_APPLY_LINKS];

  return (
    <div className="portal">
      <div className="portal-app">
        {/* 좌측 사이드바 */}
        <aside className="portal-sidebar">
          <div className="portal-brand">
            <span className="portal-brandmark">A</span>
            안성 <span style={{ color: "#3182f6" }}>행정업무+</span>
          </div>
          <button
            type="button"
            className={`portal-side-item${active === "전체" ? " is-active" : ""}`}
            onClick={() => setActive("전체")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 11l9-7 9 7" />
              <path d="M5.5 10v10h13V10" />
            </svg>
            전체 메뉴
          </button>
          <p className="portal-side-label">업무</p>
          <button
            type="button"
            className={`portal-side-item${active === "업무" ? " is-active" : ""}`}
            onClick={() => setActive("업무")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            업무 분야
          </button>
          {workItems.map((item) => (
            <button
              type="button"
              key={item.slug}
              className="portal-side-sub"
              onClick={() =>
                item.externalUrl
                  ? window.open(item.externalUrl, "_blank", "noopener")
                  : openItem(item.slug)
              }
            >
              {item.title}
            </button>
          ))}
          <p className="portal-side-label">행정공통분야</p>
          <button
            type="button"
            className={`portal-side-item${active === "행정공통분야" ? " is-active" : ""}`}
            onClick={() => setActive("행정공통분야")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" />
            </svg>
            행정공통분야
          </button>
          {guideItems.map((item) => (
            <button
              type="button"
              key={item.slug}
              className="portal-side-sub"
              onClick={() => openItem(item.slug)}
            >
              {item.title}
            </button>
          ))}
          <div className="portal-sidebar-bottom">
            <button
              type="button"
              className="portal-side-item"
              onClick={() => {
                window.location.hash = "#/calendar";
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
              직무달력
            </button>
            <button
              type="button"
              className="portal-side-item"
              onClick={() => {
                window.location.hash = "#/admin";
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
              </svg>
              관리자
            </button>
          </div>
        </aside>

        <div className="portal-main">
          <header className="portal-topbar">
            <span className="portal-crumb">안성교육지원청 · 업무자료 통합 안내</span>
            <div className="portal-topright">
              <span>학교 행정업무를 더 간편하게</span>
              <button
                type="button"
                className="portal-topicon"
                aria-label="공지사항"
                title="공지사항"
                onClick={() => setShowNotices(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 18v1a3 3 0 006 0v-1M5 11a7 7 0 1114 0c0 4 1.5 5.5 1.5 5.5H3.5S5 15 5 11z" />
                </svg>
              </button>
              <button
                type="button"
                className="portal-pill"
                onClick={() => searchRef.current?.focus()}
              >
                자료 검색 ⌕
              </button>
            </div>
          </header>

          <main className="portal-content">
            <div className="portal-hero">
              <p className="portal-eyebrow">안성 행정업무+ &nbsp;/&nbsp; WORK GUIDE</p>
              <h1>
                복잡한 행정업무,
                <br />
                <em>찾기는 간단하게.</em>
              </h1>
              <p>
                업무와 행정공통분야의 필요한 자료를
                <br />한눈에 확인하고 빠르게 찾아보세요.
              </p>
              <label className="portal-searchwrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 5 5" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="어떤 업무를 찾으시나요? 예: 지출, 복무, 기록물관리"
                  autoComplete="off"
                  aria-label="메뉴 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <span className="portal-key">Ctrl K</span>
              </label>
            </div>

            <nav className="portal-filterbar" aria-label="업무 구분">
              {(["전체", "업무", "행정공통분야"] as PortalFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`portal-filter${active === f ? " is-active" : ""}`}
                  onClick={() => setActive(f)}
                >
                  {f === "전체" ? "전체 보기" : f === "업무" ? "업무 분야" : f}
                </button>
              ))}
            </nav>

            {showWork && (
              <section className="portal-section">
                <div className="portal-sectionhead">
                  <div>
                    <h2>업무 분야</h2>
                    <p>학교 행정 실무에서 자주 사용하는 핵심 메뉴</p>
                  </div>
                  <span className="portal-count">{workMatches.length}개 메뉴</span>
                </div>
                <div className="portal-workgrid">
                  {workMatches.map((item) => (
                    <WorkCard key={item.slug} item={item} />
                  ))}
                </div>
              </section>
            )}

            {showWork && showGuide && <div className="portal-divider" />}

            {showGuide && (
              <section className="portal-section">
                <div className="portal-sectionhead">
                  <div>
                    <h2>행정공통분야</h2>
                    <p>근무·인사부터 문서·시설 운영까지 필요한 업무 안내</p>
                  </div>
                  <span className="portal-count">
                    {guideMatches.length - featuredMatches.length}개 메뉴
                  </span>
                </div>
                {featuredMatches.length > 0 && (
                  <div className="portal-commongrid" style={{ marginBottom: 27 }}>
                    {featuredMatches.map((item) => (
                      <CommonCard key={item.slug} item={item} />
                    ))}
                  </div>
                )}
                {groupMatches.map((group) => (
                  <div key={group.name}>
                    <h3 className="portal-grouphead">{group.name}</h3>
                    <div className="portal-commongrid">
                      {group.items.map((item) => (
                        <CommonCard key={item.slug} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {showEmpty && (
              <div className="portal-empty">
                일치하는 메뉴가 없습니다. 다른 검색어를 입력해 보세요.
              </div>
            )}

            <div className="portal-footer">
              본 사이트는 행정업무 편의를 위한 참고용 시스템입니다.
            </div>
          </main>
        </div>

        {/* 우측 사이드바: 질문방 · 생활정보 · 기관 바로가기 */}
        <aside className="portal-rightbar">
          <button
            type="button"
            className="portal-rb-chat"
            onClick={() => setShowChat(true)}
          >
            <span className="portal-smallglyph">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 11.5a8.4 8.4 0 01-8.4 8.4 8.3 8.3 0 01-4-1L3 20l1.1-3.3a8.3 8.3 0 01-1-4A8.4 8.4 0 0111.5 4a8.4 8.4 0 019.5 7.5z" />
              </svg>
              <span className="portal-rb-livedot" />
            </span>
            <span>
              <strong>실시간 질문방</strong>
              <small>지금 바로 질문하고 답해보세요</small>
            </span>
          </button>

          <div className="portal-rb-section">
            <p className="portal-rb-head">안성 생활 정보</p>
            <div className="portal-rb-list">
              {lifeMatches.map((item) => (
                <CommonCard key={item.slug} item={item} />
              ))}
            </div>
          </div>

          <div className="portal-rb-section">
            <p className="portal-rb-head">기관·지역 바로가기</p>
            <div className="portal-rb-list">
              {siteLinks.map((l) => (
                <a
                  key={l.href}
                  className="portal-commoncard"
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="portal-smallglyph" aria-hidden="true">
                    ↗
                  </span>
                  <span>
                    <strong>{l.label}</strong>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <a
        className="portal-fab"
        href="https://gdp.goe.go.kr/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3l9 4.5v9L12 21l-9-4.5v-9z" />
          <path d="M12 12v9M12 12L3 7.5M12 12l9-4.5" />
        </svg>
        G-ONE AI 업무도우미
      </a>

      {showNotices && <NoticesModal onClose={() => setShowNotices(false)} />}
      {showChat && (
        <div
          className="portal-overlay"
          role="button"
          tabIndex={0}
          aria-label="닫기"
          onClick={() => setShowChat(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowChat(false);
          }}
        >
          <div
            className="portal-chat-box"
            role="dialog"
            aria-modal="true"
            aria-label="실시간 질문방"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="portal-chat-close"
              onClick={() => setShowChat(false)}
              aria-label="닫기"
            >
              ✕
            </button>
            <ChatRoom />
          </div>
        </div>
      )}
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
