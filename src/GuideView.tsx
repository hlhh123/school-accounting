import { useState } from "react";
import type { Block, Guide } from "./guides";
import type { CatalogItem } from "./catalog";

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
    case "note":
      return (
        <div className="g-callout">
          {block.title && <strong>{block.title}</strong>}
          <p>{block.text}</p>
        </div>
      );
  }
}

export default function GuideView({
  item,
  crumb,
  guide,
}: {
  item: CatalogItem;
  crumb: string;
  guide: Guide;
}) {
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

        {guide.sections.map((sec) => (
          <div key={sec.title} className="guide-section">
            <h4 className="guide-section-title">{sec.title}</h4>
            {sec.blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </div>
        ))}

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
