import { useState } from "react";
import { won, parseWon, floor10 } from "./money";

// 서식03 — 확정기여형(DC) 퇴직금 산출.
//   연간임금총액 소계(A) = 아래 13개 임금 항목의 합
//   적립퇴직금(B) = 내림(A ÷ 12, 10원)
//   ※ 임금총액에서 맞춤형복지비·가족수당·자녀학비보조수당은 제외.

const FIELDS: { key: string; label: string }[] = [
  { key: "bonbong", label: "급여(본봉)" },
  { key: "jikmu", label: "직무수당·보전금" },
  { key: "myeonheo", label: "면허가산수당" },
  { key: "wiheom", label: "위험근무수당" },
  { key: "janggi", label: "장기근무가산금" },
  { key: "geupsik", label: "정액급식비" },
  { key: "sangyeo", label: "정기상여금" },
  { key: "myeongjeol", label: "명절휴가비" },
  { key: "yeoncha", label: "연차수당" },
  { key: "yagan", label: "야간근로수당" },
  { key: "yeonjang", label: "연장근로수당" },
  { key: "yeonjangGa", label: "연장근로가산금" },
  { key: "hyuil", label: "휴일근무수당" },
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.key, ""])) as Record<string, string>;

export default function DcRetirement() {
  const [name, setName] = useState("");
  const [values, setValues] = useState<Record<string, string>>({ ...EMPTY });

  const set = (key: string, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    setValues((v) => ({ ...v, [key]: digits ? Number(digits).toLocaleString("ko-KR") : "" }));
  };

  const subtotalA = FIELDS.reduce((sum, f) => sum + parseWon(values[f.key]), 0);
  const retireB = floor10(subtotalA / 12);

  return (
    <div className="sc">
      <p className="sc-note">
        연간 지급된 임금 항목을 입력하면 <b>연간임금총액(A)</b>과 <b>DC 적립퇴직금(B = A÷12)</b>을
        계산합니다. 임금총액에서 <b>맞춤형복지비·가족수당·자녀학비보조수당은 제외</b>하고, 연차수당은
        2026.2월에 지급하는 연차수당을 입력하세요.
      </p>

      <label className="sc-field sc-field-wide">
        <span>성명 (선택)</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 홍길동"
        />
      </label>

      <p className="sc-section">연간 임금 항목 (원)</p>
      <div className="sc-grid">
        {FIELDS.map((f) => (
          <label className="sc-field" key={f.key}>
            <span>{f.label}</span>
            <input
              type="text"
              inputMode="numeric"
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder="0"
            />
          </label>
        ))}
      </div>

      <div className="sc-result">
        <div className="sc-stat">
          <span className="sc-stat-label">연간임금총액 (A)</span>
          <span className="sc-stat-value">{won(subtotalA)}원</span>
        </div>
        <div className="sc-stat sc-stat-primary">
          <span className="sc-stat-label">DC 적립퇴직금 (B = A ÷ 12)</span>
          <span className="sc-stat-value">{won(retireB)}원</span>
          <span className="sc-stat-sub">10원 미만 절사</span>
        </div>
      </div>

      <button
        type="button"
        className="sc-reset"
        onClick={() => {
          setValues({ ...EMPTY });
          setName("");
        }}
      >
        초기화
      </button>

      <p className="sc-disclaimer">
        ※ 「교육공무직원 임금 지급기준」·근로자퇴직급여보장법에 따른 참고 계산입니다. 확정기여형(DC)은
        연간 임금총액의 1/12 이상을 적립하는 제도이며, 실제 적립·정산 시 최신 지침을 확인하세요.
      </p>
    </div>
  );
}
