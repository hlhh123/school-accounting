import { useMemo, useState } from "react";
import {
  CONTRACT_FIELDS,
  CONTRACT_LAWS,
  findContractMethod,
  type CheckItem,
  type FinderResult,
  type MethodResult,
} from "./contractRules";

function MethodCard({ m }: { m: MethodResult }) {
  return (
    <div className={`cf-method cf-method-${m.status}`}>
      <div className="cf-method-head">
        <span className="cf-method-label">{m.label}</span>
        <span className={`cf-method-badge cf-badge-${m.status}`}>
          {m.status === "recommended"
            ? "적용"
            : m.status === "possible"
              ? "가능"
              : "해당 없음"}
        </span>
      </div>
      <p className="cf-method-reason">{m.reason}</p>
      {m.submit && (
        <p className="cf-method-submit">
          <strong>견적서 제출</strong> · {m.submit}
        </p>
      )}
    </div>
  );
}

function CheckRow({ c }: { c: CheckItem }) {
  return (
    <li className={`cf-check${c.hit ? " is-hit" : ""}`}>
      <span className="cf-check-mark" aria-hidden>
        {c.hit ? "!" : "✓"}
      </span>
      <span className="cf-check-body">
        <strong>{c.label}</strong>
        <span>{c.detail}</span>
      </span>
    </li>
  );
}

export default function ContractFinder() {
  const [fieldCode, setFieldCode] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [result, setResult] = useState<FinderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(null);

  const field = CONTRACT_FIELDS.find((f) => f.code === fieldCode);
  const types = field?.types ?? [];

  const priceNumber = useMemo(
    () => Number(priceInput.replace(/[^0-9]/g, "")),
    [priceInput],
  );

  const onFieldChange = (v: string) => {
    setFieldCode(v);
    setTypeCode("");
    setResult(null);
    setError(null);
  };

  const onPriceChange = (v: string) => {
    const digits = v.replace(/[^0-9]/g, "");
    setPriceInput(digits ? Number(digits).toLocaleString("ko-KR") : "");
  };

  const search = () => {
    setError(null);
    if (!fieldCode) return setError("계약분야를 선택해 주세요.");
    if (!typeCode) return setError("계약유형을 선택해 주세요.");
    if (!priceNumber || priceNumber <= 0)
      return setError("추정가격(부가세 제외)을 입력해 주세요.");
    const r = findContractMethod(fieldCode, typeCode, priceNumber);
    if (!r) return setError("해당 계약유형을 찾을 수 없습니다.");
    setResult(r);
    setOpenStep(null);
  };

  const reset = () => {
    setFieldCode("");
    setTypeCode("");
    setPriceInput("");
    setResult(null);
    setError(null);
    setOpenStep(null);
  };

  return (
    <div className="cf">
      <div className="cf-intro">
        <h4 className="cf-title">계약방법을 찾아보세요</h4>
        <p className="cf-sub">
          계약분야·유형과 추정가격(부가세 제외)을 입력하면 적용 가능한 계약방법과
          절차를 안내합니다.
        </p>
      </div>

      <div className="cf-form">
        <select
          className="cf-select"
          value={fieldCode}
          onChange={(e) => onFieldChange(e.target.value)}
          aria-label="계약분야"
        >
          <option value="">계약분야</option>
          {CONTRACT_FIELDS.map((f) => (
            <option key={f.code} value={f.code}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          className="cf-select"
          value={typeCode}
          onChange={(e) => {
            setTypeCode(e.target.value);
            setResult(null);
          }}
          disabled={!field}
          aria-label="계약유형"
        >
          <option value="">계약유형</option>
          {types.map((t) => (
            <option key={t.code} value={t.code}>
              {t.label}
            </option>
          ))}
        </select>

        <div className="cf-price">
          <input
            className="cf-input"
            type="text"
            inputMode="numeric"
            value={priceInput}
            placeholder="추정가격(부가가치세 제외)"
            onChange={(e) => onPriceChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            aria-label="추정가격"
          />
          <span className="cf-won">원</span>
        </div>

        <div className="cf-actions">
          <button type="button" className="cf-btn cf-btn-search" onClick={search}>
            조건검색
          </button>
          <button type="button" className="cf-btn cf-btn-reset" onClick={reset}>
            초기화
          </button>
        </div>
      </div>

      {error && <p className="cf-error">{error}</p>}

      {result && (
        <div className="cf-result">
          <div className="cf-result-head">
            <span className="cf-crumb">
              {result.field.label} › {result.type.label}
            </span>
            <span className="cf-band">{result.bandLabel}</span>
          </div>

          {result.type.note && (
            <p className="cf-typenote">※ {result.type.note}</p>
          )}

          <p className="cf-section-label">적용 가능한 계약방법</p>
          <div className="cf-methods">
            {result.methods.map((m) => (
              <MethodCard key={m.key} m={m} />
            ))}
          </div>

          <p className="cf-section-label">사전 확인사항</p>
          <ul className="cf-checks">
            {result.checks.map((c) => (
              <CheckRow key={c.label} c={c} />
            ))}
          </ul>

          <p className="cf-system">
            <strong>이용 시스템</strong> · {result.system}
          </p>

          <p className="cf-section-label">계약 절차 (각 단계를 눌러 상세 확인)</p>
          <ol className="cf-steps">
            {result.steps.map((s, i) => {
              const isOpen = openStep === i;
              return (
                <li key={i} className="cf-step">
                  <button
                    type="button"
                    className={`cf-step-head${isOpen ? " is-open" : ""}`}
                    onClick={() => setOpenStep(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="cf-step-title">{s.title}</span>
                    <span className={`cf-caret${isOpen ? " is-open" : ""}`}>›</span>
                  </button>
                  {isOpen && (
                    <div className="cf-step-body">
                      <ul>
                        {s.points.map((p, j) => (
                          <li key={j}>{p}</li>
                        ))}
                      </ul>
                      {s.refs && s.refs.length > 0 && (
                        <p className="cf-step-refs">
                          <strong>관련 근거</strong> · {s.refs.join(" / ")}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <p className="cf-disclaimer">
            ※ 경기도교육청 학교 업무매뉴얼 «제13편 계약»과 지방계약법령을 기준으로 한
            <strong> 참고 안내</strong>입니다. 계약심사 대상은 추정금액(추정가격+부가세)
            기준이라 관급자재 등에 따라 달라질 수 있고, 법령·지침 개정 시 기준이 바뀔 수
            있으니 실제 집행 전 최신 매뉴얼로 확인하세요.
          </p>
        </div>
      )}

      <details className="cf-laws">
        <summary>관련 법령·지침</summary>
        <ul>
          {CONTRACT_LAWS.map((l) => (
            <li key={l.name}>
              <strong>{l.name}</strong>
              <span>{l.note}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
