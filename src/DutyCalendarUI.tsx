import { useEffect, useState, type MouseEvent } from "react";
import { dutyCalendar, type DutyTask } from "./dutyCalendar";
import { fetchDutyByMonth } from "./lib/duty";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function MonthCalendar({
  year,
  month,
  taskDays,
  compact,
  onDayHover,
}: {
  year: number;
  month: number; // 1-12
  taskDays: Set<number>;
  compact?: boolean;
  onDayHover?: (day: number | null) => void;
}) {
  const startDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const isThisMonth =
    today.getFullYear() === year && today.getMonth() === month - 1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className={`cal${compact ? " cal-compact" : ""}`}>
      <div className="cal-grid cal-dow">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={i === 0 ? "cal-sun" : ""}>
            {w}
          </span>
        ))}
      </div>
      <div className="cal-grid" onMouseLeave={() => onDayHover?.(null)}>
        {cells.map((d, i) =>
          d === null ? (
            <span key={i} className="cal-empty" />
          ) : (
            <span
              key={i}
              className={[
                "cal-day",
                i % 7 === 0 ? "cal-sun" : "",
                taskDays.has(d) ? "has-task" : "",
                isThisMonth && today.getDate() === d ? "is-today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => onDayHover?.(d)}
            >
              {d}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

export function DutyCalendarPanel() {
  const now = new Date();
  const todayDate = now.getDate();
  const [data, setData] = useState<Record<number, DutyTask[]>>(dutyCalendar);
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  // 0 = 이번 달, -1 = 전달, +1 = 다음 달 …
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchDutyByMonth().then(setData);
  }, []);

  // 이번 달 기준 offset 만큼 이동한 연·월 (연도 경계 자동 처리)
  const shownDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = shownDate.getFullYear();
  const month = shownDate.getMonth() + 1;
  const isThisMonth = offset === 0;

  const tasks = data[month] ?? [];
  const taskDays = new Set(
    tasks.filter((t) => t.day).map((t) => t.day as number),
  );

  // 마우스를 올린 날이 있으면 그 날, 없으면 이번 달은 오늘 일정, 다른 달은 월 전체 미리보기
  const briefDay = hoverDay ?? (isThisMonth ? todayDate : null);
  const briefTasks =
    briefDay != null ? tasks.filter((t) => t.day === briefDay) : tasks.slice(0, 4);

  const goCalendar = () => {
    window.location.hash = "#/calendar";
  };
  // 화살표 클릭이 패널 전체 클릭(달력 열기)으로 번지지 않도록 차단
  const step = (e: MouseEvent, dir: number) => {
    e.stopPropagation();
    setHoverDay(null);
    setOffset((o) => o + dir);
  };

  return (
    <div className="duty-panel-wrap">
      <div
        className="duty-panel"
        role="button"
        tabIndex={0}
        onClick={goCalendar}
        onKeyDown={(e) => {
          if (e.key === "Enter") goCalendar();
        }}
      >
        <div className="duty-head">
        <h3>직무달력</h3>
        <div className="duty-nav-inline">
          <button
            type="button"
            className="duty-step"
            aria-label="전달"
            onClick={(e) => step(e, -1)}
          >
            ‹
          </button>
          <span className="duty-month">
            {year}년 {month}월
          </span>
          <button
            type="button"
            className="duty-step"
            aria-label="다음 달"
            onClick={(e) => step(e, 1)}
          >
            ›
          </button>
        </div>
      </div>

      <MonthCalendar
        year={year}
        month={month}
        taskDays={taskDays}
        compact
        onDayHover={setHoverDay}
      />

      <ul className="duty-brief">
        {briefTasks.length ? (
          briefTasks.map((t, i) => (
            <li key={i}>
              {(briefDay ?? t.day) != null && (
                <span className="duty-brief-day">{briefDay ?? t.day}일</span>
              )}
              {t.title}
            </li>
          ))
        ) : (
          <li className="duty-empty">
            {briefDay != null
              ? `${briefDay}일 · 등록된 일정이 없습니다.`
              : "등록된 일정이 없습니다."}
          </li>
        )}
      </ul>

        <span className="duty-more">이번 달 · 연간 일정 자세히 보기 ›</span>
      </div>

      {/* 출처는 달력 패널(카드) 바깥, 밑에 표시 */}
      <p className="duty-source">출처: 학습동아리 ‘상록’</p>
    </div>
  );
}

export function DutyCalendarView() {
  const now = new Date();
  const year = now.getFullYear();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<Record<number, DutyTask[]>>(dutyCalendar);
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  useEffect(() => {
    fetchDutyByMonth().then(setData);
  }, []);

  const tasks = data[month] ?? [];
  const taskDays = new Set(
    tasks.filter((t) => t.day).map((t) => t.day as number),
  );

  const prev = () => {
    setHoverDay(null);
    setMonth((m) => (m === 1 ? 12 : m - 1));
  };
  const next = () => {
    setHoverDay(null);
    setMonth((m) => (m === 12 ? 1 : m + 1));
  };

  // 마우스를 올린 날짜가 있으면 그 날짜 일정만, 없으면 이번 달 전체
  const shown =
    hoverDay != null ? tasks.filter((t) => t.day === hoverDay) : tasks;

  return (
    <section className="duty">
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

        <div className="duty-view-head">
          <p>직무달력</p>
          <h3>{year}년 연간 직무 일정</h3>
        </div>

        <div className="duty-nav">
          <button type="button" onClick={prev} aria-label="이전 달">
            ‹
          </button>
          <strong>
            {year}년 {month}월
          </strong>
          <button type="button" onClick={next} aria-label="다음 달">
            ›
          </button>
        </div>

        <div className="duty-view-grid">
          <div className="duty-view-cal-col">
            <div className="duty-view-cal">
              <MonthCalendar
                year={year}
                month={month}
                taskDays={taskDays}
                onDayHover={setHoverDay}
              />
            </div>

            {/* 월 선택 칩은 달력 카드 바깥, 달력 밑에 표시 */}
            <div className="duty-month-chips">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button
                  type="button"
                  key={m}
                  className={`duty-chip${m === month ? " is-active" : ""}`}
                  onClick={() => {
                    setHoverDay(null);
                    setMonth(m);
                  }}
                >
                  {m}월
                </button>
              ))}
            </div>
          </div>

          <div className="duty-view-tasks">
            <h4>
              {hoverDay != null
                ? `${month}월 ${hoverDay}일 일정`
                : `${month}월 해야 할 일`}
            </h4>
            {shown.length === 0 ? (
              <p className="duty-empty">등록된 일정이 없습니다.</p>
            ) : (
              <ul className="duty-task-list">
                {shown.map((t, i) => (
                  <li key={i}>
                    <span className="duty-task-when">
                      {t.day ? `${month}.${t.day}` : "이번 달"}
                    </span>
                    <span className="duty-task-body">
                      <strong>{t.title}</strong>
                      {t.detail && <span>{t.detail}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
