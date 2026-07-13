import { useEffect, useState } from "react";
import type { Block, Guide } from "./guides";
import type { CatalogItem } from "./catalog";
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
  kind: "pdf" | "hwp";
}) {
  return (
    <li>
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
  items,
}: {
  items: {
    name: string;
    file: string;
    download: string;
    kind: "pdf" | "hwp";
  }[];
}) {
  return (
    <ul className="g-files">
      {items.map((f, i) => (
        <FileLink
          key={i}
          href={`${import.meta.env.BASE_URL}docs/expense/${f.file}`}
          download={f.download}
          name={f.name}
          kind={f.kind}
        />
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
      return <FilesBlock items={block.items} />;
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
  docGuideKey,
}: {
  item: CatalogItem;
  crumb: string;
  guide: Guide;
  // 값이 있으면 해당 slug 로 업로드된 자료(Supabase)를 분류별로 병합 표시
  docGuideKey?: string;
}) {
  const [docs, setDocs] = useState<Record<string, Doc[]>>({});

  useEffect(() => {
    if (!docGuideKey) return;
    let alive = true;
    fetchDocsByCategory(docGuideKey)
      .then((grouped) => {
        if (alive) setDocs(grouped);
      })
      .catch(() => {
        /* 자료실 미설정/오류 시 정적 목록만 표시 */
      });
    return () => {
      alive = false;
    };
  }, [docGuideKey]);

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

        {guide.sections.map((sec) => {
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
