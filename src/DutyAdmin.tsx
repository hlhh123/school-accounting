import RowManager, { type Col, type Row } from "./AdminRowManager";
import { fetchDutyRows, createDuty, updateDuty, deleteDuty } from "./lib/duty";

const DUTY_COLUMNS: Col[] = [
  { key: "month", label: "월(1-12)", type: "number" },
  { key: "day", label: "일(0=날짜없음)", type: "number" },
  { key: "title", label: "할 일", type: "text" },
  { key: "detail", label: "세부내용", type: "text" },
];

export default function DutyAdmin() {
  return (
    <>
      <RowManager
        title="직무달력 관리"
        columns={DUTY_COLUMNS}
        load={() => fetchDutyRows() as Promise<Row[]>}
        create={createDuty}
        update={updateDuty}
        remove={deleteDuty}
        setupHint="테이블을 불러오지 못했습니다. duty-setup.sql 을 실행했는지 확인해 주세요."
      />
      <p className="admin-hint">
        "월"은 1~12, "일"은 날짜(1~31)를 넣습니다. 날짜가 정해지지 않은 '해당 월
        전체' 일정은 "일"을 <strong>0</strong>으로 두세요. 저장하면 홈 화면과
        직무달력 상세에 바로 반영됩니다.
      </p>
    </>
  );
}
