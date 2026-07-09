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

const services = [
  {
    title: "급여 업무",
    description: "급여, 수당, 일할계산 업무를 지원합니다.",
  },
  {
    title: "학교회계",
    description: "예산, 지출, 결산 관련 업무를 확인합니다.",
  },
  {
    title: "사립유치원",
    description: "사립유치원 회계와 운영 지침을 확인합니다.",
  },
  {
    title: "관사현황",
    description: "공동사택·관사 현황과 입주 현황을 확인합니다.",
  },
  {
    title: "안성맛집",
    description: "업무에 필요한 법령과 지침을 검색합니다.",
  },
  {
    title: "지침",
    description: "자주 사용하는 행정서식을 확인합니다.",
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
            <h1 className="logo">안성교육지원청 행정업무지원기</h1>
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
          <h1 className="logo">안성교육지원청 행정업무지원기</h1>

          <nav className="navigation">
            <a href="#home">홈</a>
            <a href="#services">업무지원</a>
            <a href="#guidelines">법령·지침</a>
            <a href="#forms">서식</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-inner">
            <p className="hero-label">교육행정 업무지원</p>

            <h2>
              복잡한 행정업무를
              <br />
              쉽고 빠르게 처리하세요.
            </h2>

            <p className="hero-description">
              급여 계산부터 학교회계, 사립유치원, 유보통합 관련 지침까지
              한곳에서 확인할 수 있습니다.
            </p>

            <div className="search-box">
              <input
                type="text"
                placeholder="궁금한 업무나 지침을 검색하세요."
              />
              <button type="button">검색</button>
            </div>

            <div className="search-examples">
              <span>기간제교원 급여</span>
              <span>맞춤형복지</span>
              <span>사립유치원 결산</span>
              <span>예산 집행률</span>
            </div>
          </div>
        </section>

        <section className="services" id="services">
          <div className="section-inner">
            <div className="section-heading">
              <p>주요 업무</p>
              <h3>필요한 업무를 선택하세요.</h3>
            </div>

            <div className="service-grid">
              {services.map((service) => (
                <button
                  type="button"
                  className="service-card"
                  key={service.title}
                  onClick={
                    service.title === "관사현황"
                      ? () => setPage("gwansa")
                      : undefined
                  }
                >
                  <span className="service-title">{service.title}</span>
                  <span className="service-description">
                    {service.description}
                  </span>
                  <span className="service-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="information">
          <div className="section-inner information-grid">
            <article className="information-box" id="guidelines">
              <p className="information-label">최근 지침</p>
              <h3>새롭게 변경된 업무 기준을 확인하세요.</h3>

              <ul>
                <li>
                  <span>2026년 학교회계 예산편성 기본지침</span>
                  <span>2026.07.01.</span>
                </li>
                <li>
                  <span>기간제교원 급여 업무 안내</span>
                  <span>2026.06.25.</span>
                </li>
                <li>
                  <span>사립유치원 회계업무 안내</span>
                  <span>2026.06.18.</span>
                </li>
              </ul>
            </article>

            <article className="information-box" id="forms">
              <p className="information-label">자주 찾는 업무</p>
              <h3>반복 업무를 빠르게 처리하세요.</h3>

              <div className="quick-links">
                <button type="button">급여 일할계산</button>
                <button type="button">예산 집행률 계산</button>
                <button type="button">맞춤형복지 계산</button>
                <button type="button">서식 내려받기</button>
              </div>
            </article>
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
