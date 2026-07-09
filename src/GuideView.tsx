import { useState } from "react";
import type { Guide } from "./guides";

export default function GuideView({
  title,
  crumb,
  guide,
}: {
  title: string;
  crumb: string;
  guide: Guide;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: string) =>
    setOpen((prev) => (prev === key ? null : key));

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
          <h3>{title}</h3>
          {guide.intro && <p className="guide-intro">{guide.intro}</p>}
          {guide.source && (
            <p className="guide-source">출처: {guide.source}</p>
          )}
        </div>

        {guide.terms && guide.terms.length > 0 && (
          <div className="guide-terms">
            <h4>용어 정리</h4>
            <dl>
              {guide.terms.map((t) => (
                <div key={t.term} className="guide-term">
                  <dt>{t.term}</dt>
                  <dd>{t.desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {guide.sections.map((sec) => (
          <div key={sec.title} className="guide-section">
            <h4 className="guide-section-title">{sec.title}</h4>
            <ul className="guide-qa">
              {sec.qas.map((qa, i) => {
                const key = `${sec.title}-${i}`;
                const isOpen = open === key;
                return (
                  <li key={key} className="guide-qa-item">
                    <button
                      type="button"
                      className="guide-q"
                      onClick={() => toggle(key)}
                      aria-expanded={isOpen}
                    >
                      <span className="guide-q-mark">Q</span>
                      <span className="guide-q-text">{qa.q}</span>
                      <span
                        className={`guide-caret${isOpen ? " is-open" : ""}`}
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </button>
                    {isOpen && (
                      <div className="guide-a">
                        <span className="guide-a-mark">A</span>
                        <p>{qa.a}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
