import RowManager, { type Col, type Row } from "./AdminRowManager";
import {
  fetchRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "./lib/matjib";

const RESTAURANT_COLUMNS: Col[] = [
  { key: "region", label: "지역", type: "text" },
  { key: "category", label: "음식구분", type: "text" },
  { key: "name", label: "상호", type: "text" },
  { key: "phone", label: "연락처", type: "text" },
  { key: "address", label: "주소", type: "text" },
  { key: "hours", label: "영업시간/휴무", type: "text" },
];

export default function MatjibAdmin() {
  return (
    <>
      <RowManager
        title="맛집 관리"
        columns={RESTAURANT_COLUMNS}
        load={() => fetchRestaurants() as Promise<Row[]>}
        create={createRestaurant}
        update={updateRestaurant}
        remove={deleteRestaurant}
        setupHint="테이블을 불러오지 못했습니다. matjib-setup.sql 을 실행했는지 확인해 주세요."
      />
      <p className="admin-hint">
        맛집 페이지는 위 목록을 지역별로 묶어서 보여줍니다. "지역"이 같은 항목이
        한 그룹으로 표시됩니다.
      </p>
    </>
  );
}
