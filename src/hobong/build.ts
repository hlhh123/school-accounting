// 개인인사카드 → «호봉획정표» 자동 생성 — 파이썬 hobong/build.py 이식.
import { careerGrade, type Card, type CareerRow } from "./card";
import { parseDateText } from "./readXlsx";
import { addDays, compareYMD, type YMD } from "./period";
import { newSpan, type Record, type Span } from "./types";

const GRADE_CHANGE = ["신규채용", "승진", "근속승진", "전환", "강임", "강등"];
const NOT_OWN_GRADE = ["겸임", "대우", "파견", "직무대리", "전출"];
const MILITARY_EXCLUDED = ["간부후보생", "무관후보생", "예술체육", "산업기능", "전문연구", "승선근무"];
const REGULAR_POSTS = [
  "급", "등급", "주사", "서기", "사무원", "교사", "교원", "교감", "교장",
  "사원", "대리", "과장", "차장", "부장", "팀장", "실장", "연구원", "기사",
];
const IRREGULAR_POSTS = [
  "회계직", "공무직", "실무원", "실무사", "기간제", "일용", "임시", "촉탁", "잡급",
  "강사", "보조", "조리", "돌봄", "방과후", "인턴", "아르바이트", "계약직",
];
const HIRE_WORDS = ["일반공채", "공개경쟁", "공채", "신규채용", "경력경쟁", "특별채용", "제한경쟁"];

type FieldRule = {
  name: string;
  series: string[];
  places: string[];
  posts: string[];
};
const SAME_FIELD_RULES: FieldRule[] = [
  {
    name: "보건·간호·의료",
    series: ["보건", "간호", "의료", "의무", "약무", "위생"],
    places: ["병원", "의원", "의료원", "보건소", "보건지소", "보건진료소", "요양원", "한방", "치과", "약국", "조산원", "메디컬"],
    posts: ["간호사", "간호조무사", "임상병리사", "방사선사", "물리치료사", "작업치료사", "치위생사", "약사", "의사", "한의사", "조산사", "응급구조사", "보건", "간호"],
  },
  {
    name: "시설·공업·건축·토목",
    series: ["시설", "공업", "건축", "토목", "기계", "전기", "화공", "환경"],
    places: ["건설", "엔지니어링", "종합건설", "설계", "감리", "산업", "플랜트", "제조"],
    posts: ["기사", "기술사", "산업기사", "기술자", "설계", "시공", "감리", "정비"],
  },
  {
    name: "전산·정보",
    series: ["전산", "정보", "통신"],
    places: ["소프트", "시스템", "정보기술", "전산", "네트워크", "데이터"],
    posts: ["개발자", "프로그래머", "엔지니어", "전산", "시스템", "운영자"],
  },
  {
    name: "사서",
    series: ["사서"],
    places: ["도서관", "자료실", "정보관"],
    posts: ["사서", "사서보"],
  },
  {
    name: "식품위생·영양",
    series: ["영양", "식품", "위생"],
    places: ["급식", "식품", "영양", "위탁급식"],
    posts: ["영양사", "조리사", "위생사"],
  },
];

function sq(text: string): string {
  return (text || "").replace(/\s/g, "");
}

export type Guess = {
  label: string;
  ratio: number;
  same_career: boolean;
  reason: string;
  certain: boolean;
};

function seriesOf(text: string): string {
  const s = sq(text);
  for (const rule of SAME_FIELD_RULES) {
    for (const word of rule.series) if (s.includes(word)) return word;
  }
  return "";
}

function sameField(workplace: string, position: string, series: string): [boolean, string] {
  if (!series) return [false, ""];
  const place = sq(workplace);
  const post = sq(position);
  for (const rule of SAME_FIELD_RULES) {
    if (!rule.series.some((w) => series.includes(w))) continue;
    const hitPlace = rule.places.some((w) => place.includes(w));
    const hitPost = rule.posts.some((w) => post.includes(w));
    if (hitPlace && hitPost) return [true, `${rule.name} 직렬 · ${workplace}(${position})`];
    if (hitPlace || hitPost)
      return [true, `${rule.name} 직렬 · ${workplace}(${position || "직위미상"}) — 한쪽만 맞음`];
  }
  return [false, ""];
}

function isRegular(position: string): boolean | null {
  const text = sq(position);
  if (!text) return null;
  if (IRREGULAR_POSTS.some((w) => text.includes(w))) return false;
  if (REGULAR_POSTS.some((w) => text.includes(w))) return true;
  return null;
}

export function classify(
  workplace: string,
  kind: string,
  position: string,
  publicFlag: string,
  series = "",
): Guess {
  const text = sq(`${workplace}${kind}${position}`);
  const regular = isRegular(position);

  // ③ 군 복무
  if (sq(kind).includes("군") || text.includes("군복무")) {
    if (MILITARY_EXCLUDED.some((w) => text.includes(w))) {
      return { label: workplace, ratio: 0.5, same_career: false, reason: "군 경력이지만 지침에서 제외하는 복무형태 → 유사경력(근무연수 미산입)", certain: false };
    }
    return { label: workplace, ratio: 1.0, same_career: true, reason: "군 복무 경력 → 동일경력 (근무연수 산입)", certain: true };
  }

  // ② 공무원
  const pub = sq(publicFlag);
  if (pub.startsWith("예") || pub.startsWith("공무원")) {
    return { label: workplace, ratio: 1.0, same_career: true, reason: "공무원 경력 → 동일경력 (근무연수 산입)", certain: true };
  }

  // 임용전 실무수습 · 신규자 연수
  if (["실무수습", "시보"].some((w) => sq(position).includes(w))) {
    return { label: workplace, ratio: 1.0, same_career: true, reason: `임용전 실무수습(${position}) → 동일경력 100% (지방공무원임용령)`, certain: true };
  }
  if (sq(workplace).includes("연수원")) {
    return { label: workplace, ratio: 1.0, same_career: false, reason: "신규임용 연수원 과정 → 100% 로 봤습니다. 임용 과정 연수가 맞는지 확인하세요", certain: false };
  }

  // 2-가. 동일분야 민간 전문·특수경력
  const [isSame, why] = sameField(workplace, position, series);
  if (isSame) {
    return {
      label: workplace,
      ratio: 1.0,
      same_career: false,
      reason: `동일분야 전문경력(${why}) → 유사경력이나 자격증 소지 후 경력은 100% 이내. 자격 취득 시점을 확인하고, 자격 없는 기간은 80% 이내로 낮추세요. (근무연수에는 산입하지 않습니다)`,
      certain: false,
    };
  }

  // 2-나. 그 밖의 유사경력
  if (regular === false) {
    return { label: workplace, ratio: 0.5, same_career: false, reason: `비정규 근무(${position}) → 유사경력 50% (동일분야면 지침상 100% 이내까지 올릴 수 있습니다)`, certain: false };
  }

  const hint = series ? "" : " 본인 직렬을 카드에서 읽지 못해 동일분야 판정을 못 했습니다.";
  if (position) {
    return {
      label: workplace,
      ratio: 0.5,
      same_career: false,
      reason: `«${workplace} / ${position}» 은 본인 직렬과 동일분야로 보이지 않아 유사경력 50%.${hint} 동일분야면 자격증 소지 후 100% 이내, 지자체·국가 잡급이면 80% 이내까지 올릴 수 있습니다`,
      certain: false,
    };
  }
  return {
    label: workplace,
    ratio: 0.5,
    same_career: false,
    reason: `직위(급)명이 비어 있어 비정규로 봄 [${kind || "구분없음"}] → 유사경력 50% (근무연수 미산입).${hint}`,
    certain: false,
  };
}

function cardSeries(card: Card): string {
  const texts = [
    ...card.careers.filter((c) => c.grade_text).map((c) => c.grade_text),
    ...card.appointments.filter((a) => a.grade).map((a) => a.grade),
  ];
  for (let i = texts.length - 1; i >= 0; i--) {
    const found = seriesOf(texts[i]);
    if (found) return found;
  }
  return "";
}

function militarySpansFrom(text: string): Span[] {
  const out: Span[] = [];
  const re = /(\d{4}\.\d{1,2}\.\d{1,2})\s*~\s*(\d{4}\.\d{1,2}\.\d{1,2})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const s = parseDateText(m[1]);
    const e = parseDateText(m[2]);
    if (s && e) out.push({ ...newSpan("군복무", s, e), ratio: 1.0, same_career: true });
  }
  return out;
}

function militarySpans(card: Card): Span[] {
  const spans: Span[] = [];
  for (const text of card.military) spans.push(...militarySpansFrom(text));
  return spans;
}

function maxDate(a: YMD, b: YMD): YMD {
  return compareYMD(a, b) >= 0 ? a : b;
}

function hiredOn(card: Card): YMD | null {
  const hires = card.careers
    .filter((c) => c.start && HIRE_WORDS.some((w) => c.kind.includes(w)))
    .map((c) => c.start as YMD);
  if (hires.length) return hires.reduce((a, b) => (compareYMD(a, b) <= 0 ? a : b));
  const appt = card.appointments
    .filter((a) => a.on && [...HIRE_WORDS, "신규"].some((w) => a.kind.includes(w)))
    .map((a) => a.on as YMD);
  if (appt.length) return appt.reduce((a, b) => (compareYMD(a, b) <= 0 ? a : b));
  const ends = card.prior_careers.filter((c) => c.end).map((c) => c.end as YMD);
  if (ends.length) return addDays(ends.reduce(maxDate), 1);
  return null;
}

function own(careers: CareerRow[]): CareerRow[] {
  return careers.filter(
    (c) => careerGrade(c) !== null && !NOT_OWN_GRADE.some((k) => c.kind.includes(k)),
  );
}

function gradeAt(careers: CareerRow[], when: YMD): number | null {
  const o = own(careers);
  const sameDay = o.filter((c) => c.start && compareYMD(c.start, when) === 0);
  if (sameDay.length === 0) {
    const earlier = o.filter((c) => c.start && compareYMD(c.start, when) <= 0);
    return earlier.length ? careerGrade(earlier[earlier.length - 1]) : null;
  }
  const transfer = sameDay.filter((c) => c.kind.includes("전환"));
  if (transfer.length) return careerGrade(transfer[0]);
  return Math.min(...sameDay.map((c) => careerGrade(c) as number));
}

function gradeMarks(card: Card, hired: YMD): [YMD, number | null][] {
  const dateKeys = new Map<number, YMD>();
  const add = (d: YMD) => dateKeys.set(d.y * 10000 + d.m * 100 + d.d, d);
  add(hired);
  for (const row of card.careers) {
    if (row.start && compareYMD(row.start, hired) >= 0 && GRADE_CHANGE.some((k) => row.kind.includes(k))) {
      add(row.start);
    }
  }
  for (let i = 0; i + 1 < card.step_records.length; i++) {
    const previous = card.step_records[i];
    const current = card.step_records[i + 1];
    if (current.step < previous.step && compareYMD(current.on, hired) >= 0) add(current.on);
  }
  const sorted = [...dateKeys.values()].sort((a, b) => compareYMD(a, b));
  const marks: [YMD, number | null][] = sorted.map((when) => [when, gradeAt(card.careers, when)]);
  const merged: [YMD, number | null][] = [];
  for (const [when, grade] of marks) {
    if (merged.length && merged[merged.length - 1][1] === grade) continue;
    merged.push([when, grade]);
  }
  return merged;
}

export type BuildResult = {
  record: Record;
  guesses: Guess[];
  notes: string[];
  series: string;
};

export function build(card: Card, fixedOn: YMD, school = ""): BuildResult {
  const notes: string[] = [];
  const guesses: Guess[] = [];
  const record: Record = {
    school,
    name: card.name,
    grade: "",
    current_step: null,
    fixed_on: fixedOn,
    after: [],
    before: [],
    limits: [],
    problems: [],
  };

  const hired = hiredOn(card);
  const series = cardSeries(card);
  if (series) notes.push(`본인 직렬을 «${series}» 로 읽었습니다. 동일분야 전문경력 판정에 씁니다.`);
  else notes.push("본인 직렬을 카드에서 읽지 못했습니다. 민간 경력이 동일분야인지 «경력 수정»에서 직접 확인하세요.");

  for (const prior of card.prior_careers) {
    if (!prior.start || !prior.end) {
      notes.push(`임용전경력 «${prior.workplace}» 의 기간이 비어 있어 건너뛰었습니다.`);
      continue;
    }
    const guess = classify(prior.workplace, prior.kind, prior.position, prior.public, series);
    guesses.push(guess);
    if (!guess.certain)
      notes.push(`«${prior.workplace}» ${Math.round(guess.ratio * 100)}% — ${guess.reason} (심의 확인 필요)`);
    record.before.push({
      label: prior.workplace,
      start: prior.start,
      end: prior.end,
      ratio: guess.ratio,
      same_career: guess.same_career,
      reason: guess.reason,
      certain: guess.certain,
    });
  }

  for (const span of militarySpans(card)) {
    guesses.push({ label: span.label, ratio: 1.0, same_career: true, reason: "군 복무 경력 → 동일경력 (근무연수 산입)", certain: true });
    record.before.push({ ...span, reason: "군 복무 경력 → 동일경력 (근무연수 산입)", certain: true });
  }
  for (const text of card.military) {
    if (militarySpansFrom(text).length === 0)
      notes.push(`병역사항 «${text}» 은 복무기간을 읽지 못해 직접 넣어야 합니다.`);
  }

  if (!hired) {
    notes.push("임용일을 찾지 못했습니다. «16. 경력» 의 신규채용(일반공채) 발령을 확인하세요.");
    return { record, guesses, notes, series };
  }

  const marks = gradeMarks(card, hired);
  for (let i = 0; i < marks.length; i++) {
    const [start, grade] = marks[i];
    const end = i + 1 < marks.length ? addDays(marks[i + 1][0], -1) : addDays(fixedOn, -1);
    if (compareYMD(end, start) < 0) continue;
    record.after.push(newSpan(grade ? `${grade}급` : "직급미상", start, end));
  }
  record.grade = marks.length && marks[marks.length - 1][1] ? `${marks[marks.length - 1][1]}급` : "";

  if (card.step_records.length) {
    const last = card.step_records[card.step_records.length - 1];
    record.current_step = last.step;
    notes.push(`현 호봉은 «14. 승급 기록» 의 마지막 값(${last.step}호봉, ${last.on.y}.${last.on.m}.${last.on.d})을 썼습니다.`);
    const first = card.step_records[0];
    if (compareYMD(first.on, hired) < 0) {
      notes.push(
        `승급 기록이 임용일(${hired.y}.${hired.m}.${hired.d})보다 앞섭니다(${first.on.y}.${first.on.m}.${first.on.d}, ${first.step}호봉). 카드에 안 적힌 이전 경력이 있을 수 있으니 임용전경력을 확인해 넣으세요.`,
      );
    }
  }

  notes.push(...card.problems);
  for (const text of card.discipline) {
    notes.push(`징계 «${text}» 의 승급제한기간을 직접 넣어야 합니다.`);
  }

  return { record, guesses, notes, series };
}
