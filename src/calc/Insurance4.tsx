import { useMemo, useState } from "react";
import { won, parseWon, floor10 } from "./money";

// 서식02 — 4대보험 기관·개인 부담금 (2026년 요율).
//   보수월액 3종(건강보험/국민연금/고용·산재)을 입력 → 개인·기관 부담금 산출.
//   ※ 건강·고용 보수월액은 4월부터, 국민연금 보수월액은 7월부터 변경 반영.

// 2026년 요율 (서식02 기준)
const RATE = {
  normal: {
    health: 0.03595, // 건강보험(개인·기관 동일)
    care: 0.1314, // 장기요양 = 건강보험료 × 13.14%
    pension: 0.0475, // 국민연금(개인·기관 동일)
    empLoss: 0.009, // 고용 실업급여(개인·기관 동일)
    empStable: 0.0085, // 고용 안정·직업(기관)
    injury: 0.0096, // 산재(기관)
  },
  temp: {
    // 기간제(보건 기간제 등)
    health: 0.03545,
    care: 0.1295,
    pension: 0.045,
    empLoss: 0.009,
    empStable: 0.0085,
    injury: 0.0096,
  },
};

type Row = { label: string; person: number; org: number };

export default function Insurance4() {
  const [isTemp, setIsTemp] = useState(false);
  const [health, setHealth] = useState(""); // 건강보험 보수월액
  const [pension, setPension] = useState(""); // 국민연금 보수월액
  const [emp, setEmp] = useState(""); // 고용·산재 보수월액

  const money = (setter: (s: string) => void) => (raw: string) => {
    const d = raw.replace(/[^0-9]/g, "");
    setter(d ? Number(d).toLocaleString("ko-KR") : "");
  };

  const result = useMemo(() => {
    const r = isTemp ? RATE.temp : RATE.normal;
    const h = parseWon(health);
    const p = parseWon(pension);
    const e = parseWon(emp);

    const healthPerson = floor10(h * r.health);
    const carePerson = floor10(healthPerson * r.care);
    const healthOrg = floor10(h * r.health);
    const careOrg = floor10(healthOrg * r.care);
    const pensionPerson = floor10(p * r.pension);
    const pensionOrg = floor10(p * r.pension);
    const empLossPerson = floor10(e * r.empLoss);
    const empLossOrg = floor10(e * r.empLoss);
    const empStableOrg = floor10(e * r.empStable);
    const injuryOrg = floor10(e * r.injury);

    const rows: Row[] = [
      { label: "건강보험", person: healthPerson, org: healthOrg },
      { label: "장기요양보험", person: carePerson, org: careOrg },
      { label: "국민연금", person: pensionPerson, org: pensionOrg },
      { label: "고용보험(실업급여)", person: empLossPerson, org: empLossOrg },
      { label: "고용보험(고용안정·직업)", person: 0, org: empStableOrg },
      { label: "산재보험", person: 0, org: injuryOrg },
    ];
    const personTotal = rows.reduce((s, x) => s + x.person, 0);
    const orgTotal = rows.reduce((s, x) => s + x.org, 0);
    return { rows, personTotal, orgTotal };
  }, [isTemp, health, pension, emp]);

  return (
    <div className="sc">
      <p className="sc-note">
        보수월액 3종을 입력하면 개인·기관 부담 4대보험료를 계산합니다. 건강·고용 보수월액은 4월부터,
        국민연금 보수월액은 7월부터 변경분이 반영됩니다.
      </p>

      <div className="sc-toggle">
        <button
          type="button"
          className={`sc-toggle-btn${!isTemp ? " is-active" : ""}`}
          onClick={() => setIsTemp(false)}
        >
          일반 교육공무직
        </button>
        <button
          type="button"
          className={`sc-toggle-btn${isTemp ? " is-active" : ""}`}
          onClick={() => setIsTemp(true)}
        >
          기간제(보건 등)
        </button>
      </div>

      <div className="sc-grid">
        <label className="sc-field">
          <span>건강보험 보수월액</span>
          <input type="text" inputMode="numeric" value={health} onChange={(e) => money(setHealth)(e.target.value)} placeholder="0" />
        </label>
        <label className="sc-field">
          <span>국민연금 보수월액</span>
          <input type="text" inputMode="numeric" value={pension} onChange={(e) => money(setPension)(e.target.value)} placeholder="0" />
        </label>
        <label className="sc-field">
          <span>고용·산재 보수월액</span>
          <input type="text" inputMode="numeric" value={emp} onChange={(e) => money(setEmp)(e.target.value)} placeholder="0" />
        </label>
      </div>

      <div className="sc-table-scroll">
        <table className="sc-table">
          <thead>
            <tr>
              <th>구분</th>
              <th>개인 부담</th>
              <th>기관 부담</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td className="sc-num">{r.person ? won(r.person) : "-"}</td>
                <td className="sc-num">{r.org ? won(r.org) : "-"}</td>
              </tr>
            ))}
            <tr className="sc-table-total">
              <td>합계</td>
              <td className="sc-num">{won(result.personTotal)}</td>
              <td className="sc-num">{won(result.orgTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="sc-result">
        <div className="sc-stat">
          <span className="sc-stat-label">개인 부담 총액</span>
          <span className="sc-stat-value">{won(result.personTotal)}원</span>
        </div>
        <div className="sc-stat sc-stat-primary">
          <span className="sc-stat-label">기관 부담 총액</span>
          <span className="sc-stat-value">{won(result.orgTotal)}원</span>
        </div>
      </div>

      <p className="sc-disclaimer">
        ※ 2026년 요율 기준(건강 3.595%, 장기요양 13.14%, 국민연금 4.75%, 고용 실업급여 0.9%·고용안정
        0.85%, 산재 0.96%; 기간제는 건강 3.545%·장기요양 12.95%·국민연금 4.5%)의 참고 계산입니다.
        요율은 매년 바뀌므로 실제 납부 전 최신 고시를 확인하세요.
      </p>
    </div>
  );
}
