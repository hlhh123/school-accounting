import { useState } from "react";
import RowManager, { type Col, type Row } from "./AdminRowManager";
import {
  fetchRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  type MatjibKind,
} from "./lib/matjib";

const COLUMNS: Col[] = [
  { key: "region", label: "지역", type: "text" },
  { key: "category", label: "음식구분", type: "text" },
  { key: "name", label: "상호", type: "text" },
  { key: "phone", label: "연락처", type: "text" },
  { key: "address", label: "주소", type: "text" },
  { key: "hours", label: "영업시간/휴무", type: "text" },
];

const TABS: { kind: MatjibKind; label: string }[] = [
  { kind: "restaurant", label: "음식점" },
  { kind: "cafe", label: "카페" },
];

export default function MatjibAdmin() {
  const [kind, setKind] = useState<MatjibKind>("restaurant");
  const label = TABS.find((t) => t.kind === kind)?.label ?? "";

  return (
    <>
      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.kind}
            type="button"
            className={`admin-tab${t.kind === kind ? " is-active" : ""}`}
            onClick={() => setKind(t.kind)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭이 바뀌면 목록을 다시 불러오도록 key 로 새로 마운트 */}
      <RowManager
        key={kind}
        title={`맛집 관리 · ${label}`}
        columns={COLUMNS}
        load={async () =>
          (await fetchRestaurants()).filter(
            (r) => (r.kind ?? "restaurant") === kind,
          ) as unknown as Row[]
        }
        create={(v) => createRestaurant({ ...v, kind })}
        update={updateRestaurant}
        remove={deleteRestaurant}
        setupHint="테이블을 불러오지 못했습니다. matjib-setup.sql 을 실행했는지 확인해 주세요."
      />
      <p className="admin-hint">
        {label} 탭에서 추가한 항목은 맛집 페이지의 <strong>{label}</strong> 탭에만
        표시됩니다. 같은 "지역"끼리 한 그룹으로 묶여 보입니다.
      </p>
    </>
  );
}
