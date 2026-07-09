import { useEffect, useState } from "react";
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
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const [data, setData] = useState<Record<number, DutyTask[]>>(dutyCalendar);
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  useEffect(() => {
    fetchDutyByMonth().then(setData);
  }, []);

  const tasks = data[month] ?? [];
  const taskDays = new Set(
    tasks.filter((t) => t.day).map((t) => t.day as number),
  );
  const hoverTasks =
    hoverDay != null ? tasks.filter((t) => t.day === hoverDay) : [];

  return (
    <div
      className="duty-panel"
      role="button"
      tabIndex={0}
      onClick={() => {
        window.location.hash = "#/calendar";
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") window.location.hash = "#/calendar";
      }}
    >
      <div className="duty-head">
        <h3>직무달력</h3>
        <span className="duty-month">
          {year}년 {month}월
        </span>
      </div>

      <MonthCalendar
        year={year}
        month={month}
        taskDays={taskDays}
        compact
        onDayHover={setHoverDay}
      />

      <ul className="duty-brief">
        {hoverDay != null ? (
          hoverTasks.length ? (
            hoverTasks.map((t, i) => (
              <li key={i}>
                <span className="duty-brief-day">{hoverDay}일</span>
                {t.title}
              </li>
            ))
          ) : (
            <li className="duty-empty">
              {hoverDay}일 · 등록된 일정이 없습니다.
            </li>
          )
        ) : tasks.length === 0 ? (
          <li className="duty-empty">등록된 일정이 없습니다.</li>
        ) : (
          tasks.slice(0, 4).map((t, i) => (
            <li key={i}>
              {t.day && <span className="duty-brief-day">{t.day}일</span>}
              {t.title}
            </li>
          ))
        )}
      </ul>

      <span className="duty-more">이번 달 · 연간 일정 자세히 보기 ›</span>
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
          <div className="duty-view-cal">
            <MonthCalendar
              year={year}
              month={month}
              taskDays={taskDays}
              onDayHover={setHoverDay}
            />
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
        </div>
      </div>
    </section>
  );
}
