import { useEffect, useState } from "react";
import type { Block, Guide, GuideSection, GuideTab } from "./guides";
import type { CatalogItem } from "./catalog";
import ContractFinder from "./ContractFinder";
import { CalculatorTabs } from "./calculators";
import BoardPanel from "./BoardPanel";
import {
  fetchDocsByCategory,
  publicUrl,
  downloadName,
  type Doc,
} from "./lib/documents";

function TermsBlock({ items }: { items: { term: string; desc: string }[] }) {
  return (
    <dl className="g-terms">
      {items.map((t) => (
        <div key={t.term} className="g-term">
          <dt>{t.term}</dt>
          <dd>{t.desc}</dd>
        </div>
      ))}
    </dl>
  );
}

function TableBlock({
  headers,
  rows,
  note,
}: {
  headers: string[];
  rows: string[][];
  note?: string;
}) {
  return (
    <>
      <div className="g-table-scroll">
        <table className="g-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="g-note">※ {note}</p>}
    </>
  );
}

function StepsBlock({ items, note }: { items: string[]; note?: string }) {
  return (
    <>
      <ol className="g-steps">
        {items.map((s, i) => (
          <li key={i}>
            <span className="g-step-num">{i + 1}</span>
            <span className="g-step-text">{s}</span>
          </li>
        ))}
      </ol>
      {note && <p className="g-note">※ {note}</p>}
    </>
  );
}

function QaBlock({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <ul className="g-qa">
      {items.map((qa, i) => {
        const isOpen = open === i;
        return (
          <li key={i} className="g-qa-item">
            <button
              type="button"
              className="g-q"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="g-q-mark">Q</span>
              <span className="g-q-text">{qa.q}</span>
              <span className={`g-caret${isOpen ? " is-open" : ""}`} aria-hidden>
                ›
              </span>
            </button>
            {isOpen && (
              <div className="g-a">
                <span className="g-a-mark">A</span>
                <p>{qa.a}</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function FileLink({
  href,
  download,
  name,
  kind,
}: {
  href: string;
  download: string;
  name: string;
  kind: "pdf" | "hwp" | "doc" | "xls" | "ppt" | "img" | "odt";
}) {
  return (
    <li data-filename={name}>
      <a
        className="g-file"
        href={href}
        download={download}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={`g-file-kind g-file-${kind}`}>
          {kind.toUpperCase()}
        </span>
        <span className="g-file-name">{name}</span>
        <span className="g-file-open" aria-hidden>
          ↗
        </span>
      </a>
    </li>
  );
}

function FilesBlock({
  dir,
  items,
}: {
  dir?: string;
  items: {
    name: string;
    file: string;
    download: string;
    kind: "pdf" | "hwp" | "doc" | "xls" | "ppt" | "img" | "odt";
  }[];
}) {
  const base = `${import.meta.env.BASE_URL}docs/${dir ?? "expense"}/`;
  return (
    <ul className="g-files">
      {items.map((f, i) => (
        <FileLink
          key={i}
          href={base + f.file}
          download={f.download}
          name={f.name}
          kind={f.kind}
        />
      ))}
    </ul>
  );
}

function LinksBlock({ items }: { items: { label: string; url: string }[] }) {
  return (
    <ul className="g-links">
      {items.map((l, i) => (
        <li key={i}>
          <a
            className="g-link"
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="g-link-label">{l.label}</span>
            <span className="g-link-open" aria-hidden>
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return <p className="g-text">{block.text}</p>;
    case "terms":
      return <TermsBlock items={block.items} />;
    case "table":
      return (
        <TableBlock headers={block.headers} rows={block.rows} note={block.note} />
      );
    case "steps":
      return <StepsBlock items={block.items} note={block.note} />;
    case "list":
      return (
        <ul className="g-list">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "qa":
      return <QaBlock items={block.items} />;
    case "files":
      return <FilesBlock dir={block.dir} items={block.items} />;
    case "links":
      return <LinksBlock items={block.items} />;
    case "note":
      return (
        <div className="g-callout">
          {block.title && <strong>{block.title}</strong>}
          <p>{block.text}</p>
        </div>
      );
  }
}

// 정적 섹션 + 업로드 자료(docKey)를 함께 렌더합니다.
function GuideSections({
  sections,
  docKey,
}: {
  sections: GuideSection[];
  docKey?: string;
}) {
  const [docs, setDocs] = useState<Record<string, Doc[]>>({});

  useEffect(() => {
    if (!docKey) return;
    let alive = true;
    fetchDocsByCategory(docKey)
      .then((grouped) => {
        if (alive) setDocs(grouped);
      })
      .catch(() => {
        /* 자료실 미설정/오류 시 정적 목록만 표시 */
      });
    return () => {
      alive = false;
    };
  }, [docKey]);

  const leftover = Object.entries(docs).filter(
    ([cat]) => !sections.some((sec) => sec.title === cat),
  );
  const isEmpty = sections.length === 0 && leftover.length === 0;

  return (
    <>
      {sections.map((sec) => {
        const extra = docs[sec.title] ?? [];
        return (
          <div key={sec.title} className="guide-section">
            <h4 className="guide-section-title">{sec.title}</h4>
            {sec.blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
            {extra.length > 0 && (
              <ul className="g-files">
                {extra.map((d) => (
                  <FileLink
                    key={d.id}
                    href={publicUrl(d.file_path)}
                    download={downloadName(d)}
                    name={d.name}
                    kind={d.kind}
                  />
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* 정적 섹션에 없는 분류(업로드로만 만들어진 분류)를 추가 섹션으로 표시 */}
      {leftover.map(([cat, list]) => (
        <div key={cat} className="guide-section">
          <h4 className="guide-section-title">{cat}</h4>
          <ul className="g-files">
            {list.map((d) => (
              <FileLink
                key={d.id}
                href={publicUrl(d.file_path)}
                download={downloadName(d)}
                name={d.name}
                kind={d.kind}
              />
            ))}
          </ul>
        </div>
      ))}

      {isEmpty && (
        <p className="guide-empty">아직 등록된 자료가 없습니다.</p>
      )}
    </>
  );
}

// group 이 연속으로 같은 탭끼리 묶습니다. group 이 없는 탭은 하나짜리 묶음이 됩니다.
function clusterTabsByGroup(tabs: GuideTab[]): { group?: string; tabs: GuideTab[] }[] {
  const clusters: { group?: string; tabs: GuideTab[] }[] = [];
  for (const t of tabs) {
    const last = clusters[clusters.length - 1];
    if (last && last.group === t.group) {
      last.tabs.push(t);
    } else {
      clusters.push({ group: t.group, tabs: [t] });
    }
  }
  return clusters;
}

export default function GuideView({
  item,
  crumb,
  guide,
  docGuideKey,
}: {
  item: CatalogItem;
  crumb: string;
  guide: Guide;
  // 값이 있으면 해당 slug 로 업로드된 자료(Supabase)를 분류별로 병합 표시
  docGuideKey?: string;
}) {
  const tabs = guide.tabs;
  // 기본 활성 탭: 정적 콘텐츠가 있는 첫 탭(없으면 첫 탭)
  const [activeKey, setActiveKey] = useState(() => {
    if (!tabs || tabs.length === 0) return "";
    const withContent = tabs.find((t) => t.sections.length > 0);
    return (withContent ?? tabs[0]).key;
  });
  const activeTab = tabs?.find((t) => t.key === activeKey) ?? tabs?.[0];
  const hasTabGroups = tabs?.some((t) => t.group) ?? false;

  // "신규자 바로가기" 배너에서 탭을 전환하면서 특정 자료 항목으로 스크롤 + 강조 표시
  const [pendingHighlight, setPendingHighlight] = useState<string | null>(null);
  useEffect(() => {
    if (!pendingHighlight) return;
    const timer = window.setTimeout(() => {
      const el = document.querySelector(
        `[data-filename="${CSS.escape(pendingHighlight)}"]`,
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("is-highlighted");
        window.setTimeout(() => el.classList.remove("is-highlighted"), 2200);
      }
      setPendingHighlight(null);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [activeKey, pendingHighlight]);

  function goToStartItem(tabKey: string, fileMatch?: string) {
    setActiveKey(tabKey);
    if (fileMatch) setPendingHighlight(fileMatch);
  }

  return (
    <section className="guide">
      <div className="section-inner">
        <button
          type="button"
          className="back-link"
          onClick={() => {
            window.location.hash = "";
          }}
        >
          ← 홈으로 돌아가기
        </button>

        <div className="guide-heading">
          <p>{crumb}</p>
          <h3>{item.title}</h3>
          {guide.intro && <p className="guide-intro">{guide.intro}</p>}
          {guide.source && <p className="guide-source">출처: {guide.source}</p>}
        </div>

        {/* 계약 상세페이지: 서식/매뉴얼 위에 «계약방법 찾기» 검색기를 노출 */}
        {item.slug === "contract" && <ContractFinder />}

        {guide.start && (
          <div className="onboard">
            <div className="onboard-head">
              <span className="onboard-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l9 4.5v9L12 21l-9-4.5v-9z" />
                  <path d="M12 12v9M12 12L3 7.5M12 12l9-4.5" />
                </svg>
              </span>
              <div>
                <strong>{guide.start.heading}</strong>
                <span>{guide.start.subheading}</span>
              </div>
            </div>
            <div className="onboard-links">
              {guide.start.items.map((it) => (
                <button
                  key={it.label}
                  type="button"
                  onClick={() => goToStartItem(it.tabKey, it.fileMatch)}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {tabs && tabs.length > 0 ? (
          <>
            {hasTabGroups ? (
              <div className="tabgroups" role="tablist">
                {clusterTabsByGroup(tabs).map((cluster, i) => (
                  <div className="tabgroup" key={i}>
                    {cluster.group && (
                      <span className="tabgroup-label">{cluster.group}</span>
                    )}
                    <div className="tabgroup-tabs">
                      {cluster.tabs.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          role="tab"
                          aria-selected={t.key === activeTab?.key}
                          className={`gtab${
                            t.key === activeTab?.key ? " is-active" : ""
                          }`}
                          onClick={() => setActiveKey(t.key)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="guide-tabs" role="tablist">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={t.key === activeTab?.key}
                    className={`guide-tab${
                      t.key === activeTab?.key ? " is-active" : ""
                    }`}
                    onClick={() => setActiveKey(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
            {activeTab &&
              (activeTab.kind === "calculator" ? (
                <CalculatorTabs slug={docGuideKey} itemTitle={item.title} />
              ) : activeTab.kind === "qna" ? (
                <div className="qna">
                  <p className="qna-intro">
                    «{item.title}» 관련 궁금한 점을 자유롭게 질문하고 답글을 남겨보세요.
                    누구나 익명으로 참여할 수 있습니다.
                  </p>
                  <BoardPanel
                    board={`qna:${docGuideKey}`}
                    categoryPlaceholder="예: 호봉, 수당, 연말정산 등 (선택)"
                    writeLabel="✎ 질문하기"
                  />
                </div>
              ) : (
                <GuideSections
                  key={activeTab.key}
                  sections={activeTab.sections}
                  docKey={activeTab.docKey}
                />
              ))}
          </>
        ) : (
          <GuideSections sections={guide.sections} docKey={docGuideKey} />
        )}

        {item.children && item.children.length > 0 && (
          <div className="guide-sub">
            <h4 className="guide-section-title">세부 계약 유형</h4>
            <div className="service-grid">
              {item.children.map((child) => (
                <button
                  type="button"
                  className="service-card"
                  key={child.slug}
                  onClick={() => {
                    window.location.hash = `#/i/${child.slug}`;
                  }}
                >
                  <span className="service-title">{child.title}</span>
                  <span className="service-description">
                    {child.description}
                  </span>
                  <span className="service-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
