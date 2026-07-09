import { useEffect, useState, type ReactNode } from "react";
import "./App.css";
import AdminPage from "./AdminPage";
import { fetchNotices, type Notice } from "./lib/notices";
import { summaryBase, sharedBase, gwansaBase, type TableData } from "./gwansaData";
import { fetchGwansaBundle, type GwansaBundle } from "./lib/gwansa";
import { matjibRegions, type MatjibRegion } from "./matjibData";
import { fetchMatjibRegions } from "./lib/matjib";
import { DutyCalendarPanel, DutyCalendarView } from "./DutyCalendarUI";
import {
  catalog,
  findItem,
  type CatalogCategory,
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
function DetailPage({
  item,
  category,
}: {
  item: CatalogItem;
  category: CatalogCategory;
}) {
  return (
    <section className="detail">
      <div className="section-inner">
        <button type="button" className="back-link" onClick={goHome}>
          ← 홈으로 돌아가기
        </button>

        <div className="detail-heading">
          <p>{category.label}</p>
          <h3>{item.title}</h3>
          <p className="detail-desc">{item.description}</p>
        </div>

        <div className="detail-placeholder">
          <p className="detail-placeholder-title">준비 중입니다</p>
          <p>
            «{item.title}» 관련 자료와 기능이 이곳에 추가될 예정입니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function MatjibView() {
  const [region, setRegion] = useState<string>("전체");
  const [regions, setRegions] = useState<MatjibRegion[]>(matjibRegions);

  useEffect(() => {
    fetchMatjibRegions().then(setRegions);
  }, []);

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
            총 {total}곳 · {regions.length}개 지역
          </p>
        </div>

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

function NoticesPanel() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices()
      .then(setNotices)
      .catch(() => setNotices([]));
  }, []);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="notices-panel" id="notices">
      <div className="notices-head">
        <h3>공지사항</h3>
      </div>

      {notices.length === 0 ? (
        <p className="notices-empty">등록된 공지사항이 없습니다.</p>
      ) : (
        <ul className="notice-list">
          {notices.map((n) => {
            const open = openId === n.id;
            return (
              <li key={n.id} className="notice-row">
                <button
                  type="button"
                  className="notice-line"
                  onClick={() => toggle(n.id)}
                  aria-expanded={open}
                >
                  <span className="notice-title">
                    {n.pinned && <span className="notice-pin">고정</span>}
                    {n.title}
                  </span>
                  <span className="notice-date">
                    {n.created_at.slice(0, 10)}
                  </span>
                </button>
                {open && n.body && <p className="notice-body">{n.body}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CategorySection({ category }: { category: CatalogCategory }) {
  return (
    <section className="banner" id={category.sectionId}>
      <div className="section-inner">
        <div className="section-heading">
          {category.label !== category.heading && <p>{category.label}</p>}
          <h3>{category.heading}</h3>
        </div>

        <div className={`service-grid${category.compact ? " is-compact" : ""}`}>
          {category.items.map((item) => (
            <button
              type="button"
              className="service-card"
              key={item.slug}
              onClick={() => openItem(item.slug)}
            >
              <span className="service-title">{item.title}</span>
              <span className="service-description">{item.description}</span>
              <span className="service-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a className="logo-area" href="#home">
            <img
              className="logo-mark"
              src="/logo.png"
              alt="안성교육지원청"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="logo">안성교육지원청 행정업무지원기</span>
          </a>

          <nav className="navigation">
            <a href="#home">홈</a>
            {catalog.map((c) => (
              <a key={c.key} href={`#${c.sectionId}`}>
                {c.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-split" id="home">
          <div className="hero-split-inner">
            <div className="hero-left">
              <p className="hero-label">안성교육지원청</p>
              <h2>새내기를 위한 길잡이</h2>
              <p className="hero-sub">
                처음 오신 분들도 쉽게 업무를 시작할 수 있도록,
                <br />
                업무 지침과 안성 생활 정보를 한곳에 정리했습니다.
              </p>
            </div>

            <div className="hero-right">
              <DutyCalendarPanel />
            </div>
          </div>
        </section>

        {catalog.map((category) => (
          <CategorySection key={category.key} category={category} />
        ))}

        <section className="banner">
          <div className="section-inner">
            <NoticesPanel />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <strong>안성교육지원청 행정업무지원기</strong>
          <p>본 사이트는 행정업무 편의를 위한 참고용 시스템입니다.</p>
          <a className="admin-link" href="#/admin">
            관리자
          </a>
        </div>
      </footer>
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
          ) : found.item.special === "food" ? (
            <MatjibView />
          ) : (
            <DetailPage item={found.item} category={found.category} />
          )}
        </DetailShell>
      );
    }
  }

  return <HomePage />;
}

export default App;
