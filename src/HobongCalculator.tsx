import { useMemo, useRef, useState } from "react";
import { readCard, type Card } from "./hobong/card";
import { build, type BuildResult } from "./hobong/build";
import { calculate } from "./hobong/calc";
import { between, convert, periodText, ymdText, type YMD } from "./hobong/period";
import { newSpan, type Record as HobongRecord, type Span } from "./hobong/types";

type Edit = { ratio: number; same_career: boolean };

function betweenPeriod(s: Span) {
  return between(s.start, s.end);
}
function convertPeriod(s: Span, ratio: number) {
  return convert(between(s.start, s.end), ratio);
}

function thisMonthFirst(): YMD {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: 1 };
}

function ymdToInput(v: YMD | null): string {
  if (!v) return "";
  return `${v.y}-${String(v.m).padStart(2, "0")}-${String(v.d).padStart(2, "0")}`;
}

function inputToYmd(s: string): YMD | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s.trim());
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

export default function HobongCalculator() {
  const [card, setCard] = useState<Card | null>(null);
  const [built, setBuilt] = useState<BuildResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [fixedOn, setFixedOn] = useState<YMD>(thisMonthFirst());
  const [school, setSchool] = useState("");
  const [manualStep, setManualStep] = useState<string>("");
  const [edits, setEdits] = useState<Record<number, Edit>>({});
  const [limits, setLimits] = useState<Span[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const rebuild = (c: Card, on: YMD, sch: string) => {
    const b = build(c, on, sch);
    setBuilt(b);
    setEdits({});
    setLimits([]);
    setManualStep(b.record.current_step != null ? String(b.record.current_step) : "");
  };

  const loadFile = async (file: File) => {
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const c = readCard(buf);
      setCard(c);
      setFileName(file.name);
      rebuild(c, fixedOn, school);
    } catch {
      setError("엑셀을 읽지 못했습니다. 나이스 «개인인사기록카드» 엑셀 파일이 맞는지 확인해 주세요.");
      setCard(null);
      setBuilt(null);
    }
  };

  const onFixedOnChange = (s: string) => {
    const v = inputToYmd(s);
    if (!v) return;
    setFixedOn(v);
    if (card) rebuild(card, v, school);
  };

  const onSchoolChange = (s: string) => {
    setSchool(s);
    if (card && built) setBuilt({ ...built, record: { ...built.record, school: s } });
  };

  // 편집을 반영한 실제 계산용 record
  const record: HobongRecord | null = useMemo(() => {
    if (!built) return null;
    const before = built.record.before.map((s, i) => {
      const e = edits[i];
      return e ? { ...s, ratio: e.ratio, same_career: e.same_career } : s;
    });
    const step = manualStep.trim() === "" ? built.record.current_step : Number(manualStep);
    return {
      ...built.record,
      school,
      before,
      limits,
      current_step: Number.isFinite(step as number) ? (step as number) : built.record.current_step,
    };
  }, [built, edits, limits, manualStep, school]);

  const result = useMemo(() => (record ? calculate(record) : null), [record]);

  const setEdit = (i: number, patch: Partial<Edit>) => {
    setEdits((prev) => {
      const base = prev[i] ?? {
        ratio: built!.record.before[i].ratio,
        same_career: built!.record.before[i].same_career,
      };
      return { ...prev, [i]: { ...base, ...patch } };
    });
  };

  const addLimit = () => {
    setLimits((prev) => [
      ...prev,
      { ...newSpan("징계 승급제한", fixedOn, fixedOn) },
    ]);
  };
  const setLimit = (i: number, patch: Partial<Span>) =>
    setLimits((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const removeLimit = (i: number) =>
    setLimits((prev) => prev.filter((_, j) => j !== i));

  return (
    <div className="hb">
      {/* 업로드 */}
      <div
        className={`hb-drop${dragOver ? " is-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) loadFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(f);
          }}
        />
        <p className="hb-drop-title">
          {fileName ? `📄 ${fileName}` : "인사기록카드 엑셀을 여기에 끌어 놓거나 클릭해 선택"}
        </p>
        <p className="hb-drop-hint">.xlsx 파일 · 첫 시트를 읽습니다</p>
      </div>

      {error && <p className="hb-error">{error}</p>}

      {/* 입력 */}
      <div className="hb-form">
        <label className="hb-field">
          <span>호봉획정일</span>
          <input type="date" value={ymdToInput(fixedOn)} onChange={(e) => onFixedOnChange(e.target.value)} />
        </label>
        <label className="hb-field">
          <span>소속</span>
          <input type="text" value={school} placeholder="예: 안성○○학교" onChange={(e) => onSchoolChange(e.target.value)} />
        </label>
        <label className="hb-field">
          <span>실제 지급 호봉 (급여대장, 선택)</span>
          <input
            type="number"
            value={manualStep}
            placeholder="비우면 카드 값 사용"
            onChange={(e) => setManualStep(e.target.value)}
          />
        </label>
      </div>

      {result && record && (
        <>
          {/* 요약 */}
          <div className="hb-summary">
            <div className="hb-stat">
              <span className="hb-stat-label">획정 호봉</span>
              <span className="hb-stat-value">{result.step}호봉</span>
            </div>
            <div className="hb-stat">
              <span className="hb-stat-label">근무연수</span>
              <span className="hb-stat-value">
                {result.service_years}년
                <em>
                  {" "}
                  {result.service_remainder_months}월 {result.service_remainder_days}일
                </em>
              </span>
            </div>
            <div className="hb-stat">
              <span className="hb-stat-label">차기 승급일</span>
              <span className="hb-stat-value">{result.next_raise ? ymdText(result.next_raise) : "-"}</span>
            </div>
            {result.gap != null && (
              <div className={`hb-stat${result.gap === 0 ? " ok" : " warn"}`}>
                <span className="hb-stat-label">현 호봉 대조</span>
                <span className="hb-stat-value">
                  {result.gap === 0
                    ? "일치"
                    : `${Math.abs(result.gap)}호봉 ${result.gap > 0 ? "과다" : "과소"}`}
                </span>
              </div>
            )}
          </div>

          {/* 경고 */}
          {result.warnings.length > 0 && (
            <ul className="hb-warnings">
              {result.warnings.map((w, i) => (
                <li key={i}>⚠ {w}</li>
              ))}
            </ul>
          )}

          {/* 근거표 A/B/C */}
          <p className="hb-section-label">
            임용후 경력 (A) · 산정 {periodText(result.after_total)}
          </p>
          <div className="hb-table-scroll">
            <table className="hb-table">
              <thead>
                <tr>
                  <th>직급</th>
                  <th>기간</th>
                  <th>재직</th>
                </tr>
              </thead>
              <tbody>
                {record.after.map((s, i) => (
                  <tr key={i}>
                    <td>{s.label}</td>
                    <td>{ymdText(s.start)} ~ {ymdText(s.end)}</td>
                    <td>{periodText(betweenPeriod(s))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 임용전 경력 편집 */}
          <p className="hb-section-label">
            임용전·유사경력 (B) · 환산 후 {periodText(result.before_total)}
            <span className="hb-hint">환산율·동일경력을 바꾸면 바로 다시 계산됩니다</span>
          </p>
          {record.before.length === 0 ? (
            <p className="hb-empty">임용전 경력이 없습니다.</p>
          ) : (
            <div className="hb-before">
              {built!.record.before.map((s, i) => {
                const cur = record.before[i];
                return (
                  <div className="hb-brow" key={i}>
                    <div className="hb-brow-head">
                      <span className="hb-brow-label">{s.label}</span>
                      <span className="hb-brow-span">
                        {ymdText(s.start)} ~ {ymdText(s.end)} · {periodText(betweenPeriod(s))}
                      </span>
                    </div>
                    <div className="hb-brow-controls">
                      <label className="hb-ratio">
                        환산율
                        <select
                          value={String(cur.ratio)}
                          onChange={(e) => setEdit(i, { ratio: Number(e.target.value) })}
                        >
                          {[1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3].map((v) => (
                            <option key={v} value={v}>
                              {Math.round(v * 100)}%
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="hb-same">
                        <input
                          type="checkbox"
                          checked={cur.same_career}
                          onChange={(e) => setEdit(i, { same_career: e.target.checked })}
                        />
                        동일경력(근무연수 산입)
                      </label>
                      <span className="hb-conv">= {periodText(convertPeriod(s, cur.ratio))}</span>
                    </div>
                    {s.reason && <p className="hb-reason">{s.certain ? "" : "확인 필요 · "}{s.reason}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {/* 제한기간 C */}
          <p className="hb-section-label">
            제한(제외)기간 (C) · {periodText(result.limit_total)}
            <button type="button" className="hb-add" onClick={addLimit}>
              + 징계 제한기간 추가
            </button>
          </p>
          {limits.length === 0 ? (
            <p className="hb-empty">없음 (징계 승급제한이 있으면 위 버튼으로 추가)</p>
          ) : (
            <div className="hb-limits">
              {limits.map((s, i) => (
                <div className="hb-limit" key={i}>
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) => setLimit(i, { label: e.target.value })}
                  />
                  <input
                    type="date"
                    value={ymdToInput(s.start)}
                    onChange={(e) => {
                      const v = inputToYmd(e.target.value);
                      if (v) setLimit(i, { start: v });
                    }}
                  />
                  <span>~</span>
                  <input
                    type="date"
                    value={ymdToInput(s.end)}
                    onChange={(e) => {
                      const v = inputToYmd(e.target.value);
                      if (v) setLimit(i, { end: v });
                    }}
                  />
                  <button type="button" onClick={() => removeLimit(i)} aria-label="삭제">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 안내(notes) */}
          {built!.notes.length > 0 && (
            <details className="hb-notes">
              <summary>자동 판정 안내 · 확인할 점 ({built!.notes.length})</summary>
              <ul>
                {built!.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </details>
          )}

          {/* 계산 근거 로그 */}
          <button type="button" className="hb-log-toggle" onClick={() => setShowLog((v) => !v)}>
            {showLog ? "계산 근거 접기" : "계산 근거 자세히 보기"}
          </button>
          {showLog && <pre className="hb-log">{result.reasons.join("\n")}</pre>}
        </>
      )}

      <p className="hb-disclaimer">
        ※ 참고용 계산입니다. 실제 지급 호봉은 카드에 없어 급여대장에서 확인해야 하며, 유사경력 상향(민간
        자격증·잡급 등)과 징계 승급제한은 심의·규정 확인 후 위에서 직접 조정하세요. 자동 판정은
        「지방공무원 보수규정」·「지방공무원보수업무 등 처리지침」에 근거합니다.
      </p>
    </div>
  );
}
