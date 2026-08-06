import { useMemo, useState } from "react";
import { won, parseWon, floor10 } from "./money";

// 기간제교원 급여계산기 — 호봉 자동 획정 → 별표11 봉급 → 수당·공제 → 실수령액.
//
// 근거
//  · 봉급표: 「공무원보수규정」[별표 11] 유치원·초·중·고 교원 등의 봉급표 <개정 2026.1.2.>
//  · 호봉획정: 「공무원보수규정」제8조, 교육공무원 호봉획정 예규
//       초임호봉 = 기산호봉 + (학령 − 16) + 가산연수 + 환산경력연수
//  · 경력 인정률(환산율): 「교육공무원 호봉획정 시 경력환산율표의 적용 등에 관한 예규」
//  · 14호봉 상한: 연금수급자·명예/정년퇴직 후 기간제 채용 시(계약제교원 운영 지침)
//  · 공제: 기간제교원은 국민연금 대상(공무원연금 아님) + 건강·장기요양·고용보험, 소득세.

// ── 별표 11 교원 봉급표 (2026.1.2. 신설, 단위: 원) ─────────────────────────
const PAY: Record<number, number> = {
  1: 2041500, 2: 2103300, 3: 2166000, 4: 2228500, 5: 2291500,
  6: 2354400, 7: 2416600, 8: 2478600, 9: 2495600, 10: 2516700,
  11: 2538300, 12: 2585900, 13: 2657500, 14: 2773700, 15: 2889700,
  16: 3006200, 17: 3121000, 18: 3241500, 19: 3361200, 20: 3481000,
  21: 3600700, 22: 3733600, 23: 3865300, 24: 3997500, 25: 4129400,
  26: 4261900, 27: 4400100, 28: 4538000, 29: 4682100, 30: 4826800,
  31: 4971100, 32: 5115200, 33: 5261600, 34: 5407500, 35: 5553600,
  36: 5699100, 37: 5825700, 38: 5952500, 39: 6079500, 40: 6205700,
};
const MAX_STEP = 40;

// 기산호봉 (자격별)
const QUALS: { code: string; label: string; base: number }[] = [
  { code: "t1", label: "정교사(1급)", base: 9 },
  { code: "t2", label: "정교사(2급)", base: 8 },
  { code: "s1", label: "보건·영양·사서·전문상담 교사(1급)", base: 9 },
  { code: "s2", label: "보건·영양·사서·전문상담 교사(2급)", base: 8 },
  { code: "assist", label: "준교사·실기교사", base: 5 },
];

// 학령 (초6+중3+고3+대학 법정수학연한). 석·박사는 학부 학령을 쓰고 대학원은 경력 100%로 산입.
const EDU: { code: string; label: string; years: number }[] = [
  { code: "high", label: "고등학교 졸업", years: 12 },
  { code: "col2", label: "전문대학(2년제) 졸업", years: 14 },
  { code: "col3", label: "전문대학(3년제) 졸업", years: 15 },
  { code: "uni4", label: "대학교(4년제) 졸업", years: 16 },
  { code: "uni5", label: "대학교(5년제) 졸업", years: 17 },
  { code: "uni6", label: "대학교(6년제) 졸업", years: 18 },
];

// 경력 유형별 기본 인정률(환산율, %). 담당자가 콤보로 수정 가능.
const CAREER_TYPES: { code: string; label: string; rate: number }[] = [
  { code: "teacher", label: "국·공·사립학교 교원(기간제 포함)", rate: 100 },
  { code: "teacher-mis", label: "교원 — 자격·학교급 불일치", rate: 80 },
  { code: "grad-ma", label: "대학원 석사과정(학위취득)", rate: 100 },
  { code: "grad-phd", label: "대학원 박사과정(학위취득)", rate: 100 },
  { code: "official", label: "교원 외 공무원(국가·지방직)", rate: 100 },
  { code: "official-emp", label: "고용직 공무원", rate: 80 },
  { code: "military", label: "군 복무", rate: 100 },
  { code: "edu-worker", label: "교육공무직원", rate: 80 },
  { code: "daycare-pub", label: "국공립 어린이집(유치원 자격)", rate: 50 },
  { code: "daycare-pri", label: "민간 어린이집(유치원 자격)", rate: 30 },
  { code: "lecturer", label: "유·초·중등 강사(전일제 기준)", rate: 100 },
  { code: "univ-lect", label: "대학 시간강사", rate: 50 },
  { code: "academy-reg", label: "학원강사(교육감 신고)", rate: 50 },
  { code: "academy-unreg", label: "학원강사(미신고)", rate: 30 },
  { code: "industry-up", label: "임용전 산업체 — 자격 동일분야(정규직 법인)", rate: 100 },
  { code: "company-corp", label: "회사 근무(법인)", rate: 40 },
  { code: "company-per", label: "회사 근무(개인)", rate: 30 },
  { code: "learning-teacher", label: "학습지 지도교사", rate: 30 },
  { code: "public-org", label: "공공기관 등", rate: 50 },
  { code: "gov-org", label: "국가·지자체 기관(사실상 공무)", rate: 50 },
  { code: "etc", label: "기타", rate: 0 },
];

const RATE_OPTIONS = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

// ── 공제 요율 (기간제교원 = 국민연금 대상, 2026) ──────────────────────────
const DED = {
  pension: 0.045, // 국민연금 4.5%
  pensionMin: 400000, // 기준소득월액 하한(근사)
  pensionMax: 6370000, // 기준소득월액 상한(근사)
  health: 0.03545, // 건강보험 3.545%
  care: 0.1295, // 장기요양 = 건강보험료 × 12.95%
  emp: 0.009, // 고용보험(실업급여) 0.9%
};

// 정근수당 지급률(근무연수별)
function jeongeunRate(years: number): number {
  if (years < 1) return 0;
  if (years >= 10) return 0.5;
  return Math.min(0.5, 0.05 * years); // 1년 5% … 9년 45%
}

type Career = { type: string; y: string; m: string; rate: number };

// 근로소득 간이세액(월) 추정 — 국세청 간이세액표와 다를 수 있어 담당자가 수정 가능.
function estimateIncomeTax(taxableMonthly: number, family: number, pensionMonthly: number): number {
  const gross = taxableMonthly * 12;
  if (gross <= 0) return 0;
  // 근로소득공제
  let earnDed: number;
  if (gross <= 5_000_000) earnDed = gross * 0.7;
  else if (gross <= 15_000_000) earnDed = 3_500_000 + (gross - 5_000_000) * 0.4;
  else if (gross <= 45_000_000) earnDed = 7_500_000 + (gross - 15_000_000) * 0.15;
  else if (gross <= 100_000_000) earnDed = 12_000_000 + (gross - 45_000_000) * 0.05;
  else earnDed = 14_750_000 + (gross - 100_000_000) * 0.02;
  const earnIncome = gross - earnDed;
  const personal = 1_500_000 * Math.max(1, family); // 본인+부양
  const pensionDed = pensionMonthly * 12; // 연금보험료공제
  const base = Math.max(0, earnIncome - personal - pensionDed);
  // 산출세액(누진)
  let tax: number;
  if (base <= 14_000_000) tax = base * 0.06;
  else if (base <= 50_000_000) tax = 840_000 + (base - 14_000_000) * 0.15;
  else if (base <= 88_000_000) tax = 6_240_000 + (base - 50_000_000) * 0.24;
  else if (base <= 150_000_000) tax = 15_360_000 + (base - 88_000_000) * 0.35;
  else tax = 37_060_000 + (base - 150_000_000) * 0.38;
  // 근로소득세액공제(간이)
  const credit = tax <= 1_300_000 ? tax * 0.55 : 715_000 + (tax - 1_300_000) * 0.3;
  const decided = Math.max(0, tax - Math.min(credit, 740_000));
  return floor10(decided / 12);
}

export default function TeacherTempSalary() {
  const [qual, setQual] = useState("t2");
  const [edu, setEdu] = useState("uni4");
  const [sabeom, setSabeom] = useState(false); // 사범계
  const [special, setSpecial] = useState(false); // 특수학교 근무
  const [pensioner, setPensioner] = useState(false); // 연금수급자 등 → 14호봉 상한

  const [careers, setCareers] = useState<Career[]>([]);

  // 수당(담당자 수정 가능한 기본값)
  const [gyojik, setGyojik] = useState("250000"); // 교직수당
  const [gasan, setGasan] = useState("0"); // 교직수당 가산금(담임/보직)
  const [meal, setMeal] = useState("140000"); // 정액급식비(비과세)
  const [family, setFamily] = useState("0"); // 가족수당(과세)
  const [research, setResearch] = useState("0"); // 교원연구비
  const [famCount, setFamCount] = useState("1"); // 공제대상 가족 수(본인 포함)
  const [taxInput, setTaxInput] = useState(""); // 소득세 직접입력(비우면 추정)
  const [workYears, setWorkYears] = useState("0"); // 정근수당용 근무연수

  const money = (setter: (s: string) => void) => (raw: string) => {
    const d = raw.replace(/[^0-9]/g, "");
    setter(d ? Number(d).toLocaleString("ko-KR") : "");
  };

  const addCareer = () =>
    setCareers((c) => [...c, { type: "teacher", y: "", m: "", rate: 100 }]);
  const rmCareer = (i: number) =>
    setCareers((c) => c.filter((_, idx) => idx !== i));
  const setCareer = (i: number, patch: Partial<Career>) =>
    setCareers((c) => c.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const r = useMemo(() => {
    const base = QUALS.find((q) => q.code === qual)?.base ?? 8;
    const eduYears = EDU.find((e) => e.code === edu)?.years ?? 16;
    const eduAdj = eduYears - 16;
    const addYears = special ? (sabeom ? 2 : 1) : sabeom ? 1 : 0;

    // 환산경력(월)
    let convMonths = 0;
    for (const c of careers) {
      const months = parseWon(c.y) * 12 + parseWon(c.m);
      convMonths += (months * c.rate) / 100;
    }
    const careerSteps = Math.floor(convMonths / 12);

    let step = base + eduAdj + addYears + careerSteps;
    step = Math.max(1, Math.min(MAX_STEP, step));
    const capped = pensioner && step > 14;
    if (capped) step = 14;

    const bong = PAY[step] ?? 0;

    // 수당
    const aGyojik = parseWon(gyojik);
    const aGasan = parseWon(gasan);
    const aMeal = parseWon(meal); // 비과세
    const aFamily = parseWon(family);
    const aResearch = parseWon(research);

    // 과세 대상(정액급식비 비과세 제외)
    const taxable = bong + aGyojik + aGasan + aFamily + aResearch;

    // 공제 (기간제 = 국민연금)
    const pBase = Math.max(DED.pensionMin, Math.min(DED.pensionMax, taxable));
    const pension = floor10(pBase * DED.pension);
    const health = floor10(taxable * DED.health);
    const care = floor10(health * DED.care);
    const emp = floor10(taxable * DED.emp);

    const famN = Math.max(1, parseWon(famCount));
    const estTax = estimateIncomeTax(taxable, famN, pension);
    const incomeTax = taxInput.trim() ? parseWon(taxInput) : estTax;
    const localTax = floor10(incomeTax * 0.1);

    const payTotal = bong + aGyojik + aGasan + aMeal + aFamily + aResearch;
    const dedTotal = pension + health + care + emp + incomeTax + localTax;
    const net = payTotal - dedTotal;

    // 부정기 수당(참고)
    const wy = parseWon(workYears);
    const jeongeun = floor10(bong * jeongeunRate(pensioner ? Math.min(wy, 5) : wy));
    const holiday = floor10(bong * 0.6);

    return {
      base, eduAdj, addYears, careerSteps, convMonths, step, capped, bong,
      aGyojik, aGasan, aMeal, aFamily, aResearch,
      pension, health, care, emp, incomeTax, localTax, estTax,
      payTotal, dedTotal, net, jeongeun, holiday,
    };
  }, [qual, edu, sabeom, special, pensioner, careers, gyojik, gasan, meal, family, research, famCount, taxInput, workYears]);

  return (
    <div className="sc">
      <p className="sc-note">
        자격·학력·경력을 입력하면 <b>초임호봉을 자동 획정</b>하고 「별표 11」 봉급표로 봉급월액을 찾은 뒤,
        수당·공제를 반영한 <b>월 실수령액</b>을 계산합니다. 경력별 <b>인정률</b>은 유형에 따라 자동 지정되며
        아래 콤보박스에서 담당자가 직접 수정할 수 있습니다.
      </p>

      {/* 1. 호봉 획정 */}
      <p className="sc-sec">1. 호봉 획정</p>
      <div className="sc-grid">
        <label className="sc-field">
          <span>자격(기산호봉)</span>
          <select value={qual} onChange={(e) => setQual(e.target.value)}>
            {QUALS.map((q) => (
              <option key={q.code} value={q.code}>{q.label} · {q.base}호봉</option>
            ))}
          </select>
        </label>
        <label className="sc-field">
          <span>최종 학력(학령)</span>
          <select value={edu} onChange={(e) => setEdu(e.target.value)}>
            {EDU.map((e) => (
              <option key={e.code} value={e.code}>{e.label} · {e.years}년</option>
            ))}
          </select>
        </label>
      </div>
      <div className="sc-checks">
        <label><input type="checkbox" checked={sabeom} onChange={(e) => setSabeom(e.target.checked)} /> 사범계 (가산연수 +1)</label>
        <label><input type="checkbox" checked={special} onChange={(e) => setSpecial(e.target.checked)} /> 특수학교 근무 (사범계 +2 / 비사범계 +1)</label>
        <label><input type="checkbox" checked={pensioner} onChange={(e) => setPensioner(e.target.checked)} /> 연금수급자·명예/정년퇴직 후 채용 (14호봉 상한)</label>
      </div>

      {/* 2. 경력 + 인정률 */}
      <p className="sc-sec">2. 경력 · 인정률</p>
      {careers.length === 0 && (
        <p className="sc-empty">경력이 있으면 «경력 추가»로 입력하세요. 인정률은 유형에 따라 자동 지정됩니다.</p>
      )}
      {careers.map((c, i) => (
        <div className="sc-career" key={i}>
          <select
            className="sc-career-type"
            value={c.type}
            onChange={(e) => {
              const t = CAREER_TYPES.find((x) => x.code === e.target.value);
              setCareer(i, { type: e.target.value, rate: t?.rate ?? c.rate });
            }}
          >
            {CAREER_TYPES.map((t) => (
              <option key={t.code} value={t.code}>{t.label}</option>
            ))}
          </select>
          <span className="sc-career-dur">
            <input type="text" inputMode="numeric" value={c.y} placeholder="년"
              onChange={(e) => setCareer(i, { y: e.target.value.replace(/[^0-9]/g, "") })} />
            <em>년</em>
            <input type="text" inputMode="numeric" value={c.m} placeholder="월"
              onChange={(e) => setCareer(i, { m: e.target.value.replace(/[^0-9]/g, "") })} />
            <em>월</em>
          </span>
          <select
            className="sc-career-rate"
            value={c.rate}
            onChange={(e) => setCareer(i, { rate: Number(e.target.value) })}
            title="인정률(담당자 수정 가능)"
          >
            {RATE_OPTIONS.map((v) => (
              <option key={v} value={v}>{v}%</option>
            ))}
          </select>
          <button type="button" className="sc-career-x" onClick={() => rmCareer(i)} aria-label="경력 삭제">✕</button>
        </div>
      ))}
      <button type="button" className="sc-add" onClick={addCareer}>+ 경력 추가</button>

      {/* 호봉 결과 */}
      <div className="sc-step">
        <span>
          기산 {r.base} {r.eduAdj >= 0 ? "+" : "−"} {Math.abs(r.eduAdj)}(학령) + {r.addYears}(가산) + {r.careerSteps}(경력)
          {r.capped && " · 14호봉 상한 적용"}
        </span>
        <b>획정호봉 {r.step}호봉 · 봉급 {won(r.bong)}원</b>
      </div>

      {/* 3. 수당 */}
      <p className="sc-sec">3. 수당 (월정액 · 기본값 수정 가능)</p>
      <div className="sc-grid">
        <label className="sc-field"><span>교직수당</span>
          <input type="text" inputMode="numeric" value={gyojik} onChange={(e) => money(setGyojik)(e.target.value)} /></label>
        <label className="sc-field"><span>교직수당 가산금(담임 20만·보직 15만)</span>
          <input type="text" inputMode="numeric" value={gasan} onChange={(e) => money(setGasan)(e.target.value)} /></label>
        <label className="sc-field"><span>정액급식비(비과세)</span>
          <input type="text" inputMode="numeric" value={meal} onChange={(e) => money(setMeal)(e.target.value)} /></label>
        <label className="sc-field"><span>가족수당</span>
          <input type="text" inputMode="numeric" value={family} onChange={(e) => money(setFamily)(e.target.value)} /></label>
        <label className="sc-field"><span>교원연구비</span>
          <input type="text" inputMode="numeric" value={research} onChange={(e) => money(setResearch)(e.target.value)} /></label>
      </div>

      {/* 4. 공제 */}
      <p className="sc-sec">4. 공제 (기간제 = 국민연금 대상)</p>
      <div className="sc-grid">
        <label className="sc-field"><span>공제대상 가족 수(본인 포함)</span>
          <input type="text" inputMode="numeric" value={famCount} onChange={(e) => setFamCount(e.target.value.replace(/[^0-9]/g, ""))} /></label>
        <label className="sc-field"><span>소득세(비우면 간이세액 추정)</span>
          <input type="text" inputMode="numeric" value={taxInput} onChange={(e) => money(setTaxInput)(e.target.value)} placeholder={`추정 ${won(r.estTax)}`} /></label>
      </div>

      <div className="sc-table-scroll">
        <table className="sc-table">
          <thead><tr><th>구분</th><th>금액</th></tr></thead>
          <tbody>
            <tr><td>봉급({r.step}호봉)</td><td className="sc-num">{won(r.bong)}</td></tr>
            <tr><td>교직수당</td><td className="sc-num">{won(r.aGyojik)}</td></tr>
            {r.aGasan > 0 && <tr><td>교직수당 가산금</td><td className="sc-num">{won(r.aGasan)}</td></tr>}
            <tr><td>정액급식비</td><td className="sc-num">{won(r.aMeal)}</td></tr>
            {r.aFamily > 0 && <tr><td>가족수당</td><td className="sc-num">{won(r.aFamily)}</td></tr>}
            {r.aResearch > 0 && <tr><td>교원연구비</td><td className="sc-num">{won(r.aResearch)}</td></tr>}
            <tr className="sc-table-total"><td>지급 합계</td><td className="sc-num">{won(r.payTotal)}</td></tr>
            <tr><td>국민연금(4.5%)</td><td className="sc-num">−{won(r.pension)}</td></tr>
            <tr><td>건강보험(3.545%)</td><td className="sc-num">−{won(r.health)}</td></tr>
            <tr><td>장기요양(12.95%)</td><td className="sc-num">−{won(r.care)}</td></tr>
            <tr><td>고용보험(0.9%)</td><td className="sc-num">−{won(r.emp)}</td></tr>
            <tr><td>소득세{taxInput.trim() ? "" : "(추정)"}</td><td className="sc-num">−{won(r.incomeTax)}</td></tr>
            <tr><td>지방소득세(10%)</td><td className="sc-num">−{won(r.localTax)}</td></tr>
            <tr className="sc-table-total"><td>공제 합계</td><td className="sc-num">−{won(r.dedTotal)}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="sc-result">
        <div className="sc-stat sc-stat-primary">
          <span className="sc-stat-label">월 실수령액(평상월)</span>
          <span className="sc-stat-value">{won(r.net)}원</span>
        </div>
      </div>

      {/* 부정기 수당 참고 */}
      <p className="sc-sec">참고 · 부정기 수당</p>
      <div className="sc-grid">
        <label className="sc-field"><span>정근수당용 근무연수</span>
          <input type="text" inputMode="numeric" value={workYears} onChange={(e) => setWorkYears(e.target.value.replace(/[^0-9]/g, ""))} /></label>
      </div>
      <div className="sc-table-scroll">
        <table className="sc-table">
          <thead><tr><th>구분</th><th>회당 금액</th></tr></thead>
          <tbody>
            <tr><td>정근수당(1·7월, 봉급×근무연수율)</td><td className="sc-num">{won(r.jeongeun)}</td></tr>
            <tr><td>명절휴가비(설·추석, 봉급×60%)</td><td className="sc-num">{won(r.holiday)}</td></tr>
          </tbody>
        </table>
      </div>

      <p className="sc-disclaimer">
        ※ 「공무원보수규정」[별표 11]〈2026.1.2.〉 봉급표와 교육공무원 호봉획정 예규·「2026 공립 계약제 교원 운영
        지침」을 기준으로 한 <b>참고 계산</b>입니다. 초임호봉 = 기산호봉 + (학령−16) + 가산연수 + 환산경력연수.
        경력 인정률은 「경력환산율표 예규」의 대표값을 자동 지정하며 실제 적용률은 자격·근무형태에 따라 달라질 수
        있으니 담당자가 콤보박스에서 조정하세요. 소득세는 국세청 근로소득 간이세액표와 차이가 날 수 있어 직접
        입력할 수 있습니다. 수당·요율·상하한은 개정될 수 있으니 실제 지급 전 최신 기준을 확인하세요.
      </p>
    </div>
  );
}
