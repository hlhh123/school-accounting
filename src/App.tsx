import { useState } from "react";
import "./App.css";
import {
  summaryBase,
  summaryByType,
  summaryByDetail,
  sharedBase,
  sharedTable,
  gwansaBase,
  gwansaTable,
  type TableData,
} from "./gwansaData";

// 업무 (회계, 예산, 공무원급여, 공무직급여 외 추후 2개 추가 예정)
const workAreas = [
  {
    title: "회계",
    description: "학교회계 예산·지출·결산 업무를 확인합니다.",
  },
  {
    title: "예산",
    description: "예산 편성과 집행 업무를 확인합니다.",
  },
  {
    title: "공무원급여",
    description: "공무원 급여·수당 업무를 확인합니다.",
  },
  {
    title: "공무직급여",
    description: "공무직 급여·수당 업무를 확인합니다.",
  },
];

// 신규자를 위한 업무 지침 (공문서 작성법, 품의방법, 급여업무 세팅방법 외 추후 추가 예정)
const workGuides = [
  {
    title: "공문서 작성법",
    description: "공문서 작성 기준과 예시를 확인합니다.",
  },
  {
    title: "품의방법",
    description: "품의서 작성과 결재 절차를 안내합니다.",
  },
  {
    title: "급여업무 세팅방법",
    description: "급여업무 초기 설정 방법을 안내합니다.",
  },
];

// 신규자를 위한 안성 생활 정보 (관사, 맛집, 자유게시판)
const anseongLife = [
  {
    title: "관사",
    description: "공동사택·관사 입주 현황을 확인합니다.",
    page: "gwansa" as const,
  },
  {
    title: "맛집",
    description: "안성 지역 추천 맛집을 확인합니다.",
  },
  {
    title: "자유게시판",
    description: "자유롭게 정보를 나누는 공간입니다.",
  },
];

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

type GwansaTab = "summary" | "shared" | "gwansa";

function GwansaView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<GwansaTab>("summary");

  const selectTab = (next: GwansaTab) => {
    // 활성화된 버튼을 다시 누르면 요약으로 돌아갑니다.
    setTab((prev) => (prev === next ? "summary" : next));
  };

  return (
    <section className="gwansa">
      <div className="section-inner">
        <button type="button" className="back-link" onClick={onBack}>
          ← 업무지원으로 돌아가기
        </button>

        <div className="gwansa-heading">
          <p>관사현황</p>
          <h3>공동사택·관사 입주 현황</h3>
        </div>

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
            <DataTable data={summaryByType} />

            <p className="panel-caption">세부구분 현황</p>
            <DataTable data={summaryByDetail} />

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
            <DataTable data={sharedTable} />
          </div>
        )}

        {tab === "gwansa" && (
          <div className="gwansa-panel">
            <div className="panel-head">
              <h4>관사 현황</h4>
              <span className="panel-base">{gwansaBase}</span>
            </div>
            <DataTable data={gwansaTable} />
          </div>
        )}
      </div>
    </section>
  );
}

function App() {
  const [page, setPage] = useState<"home" | "gwansa">("home");

  if (page === "gwansa") {
    return (
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <button
              type="button"
              className="logo-area"
              onClick={() => setPage("home")}
            >
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
              <a href="#home" onClick={() => setPage("home")}>
                홈
              </a>
            </nav>
          </div>
        </header>

        <main>
          <GwansaView onBack={() => setPage("home")} />
        </main>

        <footer className="footer">
          <div className="footer-inner">
            <strong>안성교육지원청 행정업무지원기</strong>
            <p>본 사이트는 행정업무 편의를 위한 참고용 시스템입니다.</p>
          </div>
        </footer>
      </div>
    );
  }

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
            <a href="#work-areas">업무</a>
            <a href="#work-guides">업무 지침</a>
            <a href="#anseong-life">생활 정보</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-inner">
            <p className="hero-eyebrow">안성교육지원청 업무지원</p>

            <h2>
              신규자를 위한
              <br />
              업무 가이드입니다
            </h2>

            <p className="hero-desc">
              처음 오신 분들도 쉽게 업무를 시작할 수 있도록,
              <br />
              업무 지침과 안성 생활 정보를 한곳에 정리했습니다.
            </p>

            <a className="hero-cta" href="#work-areas">
              업무 가이드 바로가기
              <span aria-hidden="true">›</span>
            </a>
          </div>
        </section>

        <section className="banner" id="work-areas">
          <div className="section-inner">
            <div className="section-heading">
              <p>업무</p>
              <h3>회계·예산·급여 업무</h3>
            </div>

            <div className="service-grid">
              {workAreas.map((area) => (
                <button type="button" className="service-card" key={area.title}>
                  <span className="service-title">{area.title}</span>
                  <span className="service-description">
                    {area.description}
                  </span>
                  <span className="service-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="banner" id="work-guides">
          <div className="section-inner">
            <div className="section-heading">
              <p>업무</p>
              <h3>신규자를 위한 업무 지침</h3>
            </div>

            <div className="service-grid">
              {workGuides.map((guide) => (
                <button type="button" className="service-card" key={guide.title}>
                  <span className="service-title">{guide.title}</span>
                  <span className="service-description">
                    {guide.description}
                  </span>
                  <span className="service-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="banner" id="anseong-life">
          <div className="section-inner">
            <div className="section-heading">
              <p>생활</p>
              <h3>신규자를 위한 안성 생활 정보</h3>
            </div>

            <div className="service-grid">
              {anseongLife.map((item) => (
                <button
                  type="button"
                  className="service-card"
                  key={item.title}
                  onClick={
                    item.page === "gwansa"
                      ? () => setPage("gwansa")
                      : undefined
                  }
                >
                  <span className="service-title">{item.title}</span>
                  <span className="service-description">
                    {item.description}
                  </span>
                  <span className="service-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="footer-inner">
          <strong>안성교육지원청 행정업무지원기</strong>
          <p>본 사이트는 행정업무 편의를 위한 참고용 시스템입니다.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
