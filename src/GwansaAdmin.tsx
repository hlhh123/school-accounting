import RowManager, { type Col, type Row } from "./AdminRowManager";
import {
  fetchShared,
  fetchGwansa,
  createShared,
  updateShared,
  deleteShared,
  createGwansa,
  updateGwansa,
  deleteGwansa,
} from "./lib/gwansa";

const SHARED_COLUMNS: Col[] = [
  { key: "name", label: "사택명", type: "text" },
  { key: "address", label: "주소", type: "text" },
  { key: "households", label: "세대수", type: "number" },
  { key: "residents", label: "입주인원", type: "number" },
  { key: "waiting", label: "대기자수", type: "number" },
  { key: "note", label: "비고", type: "text" },
];

const GWANSA_COLUMNS: Col[] = [
  { key: "year", label: "확보연도", type: "number" },
  { key: "kind", label: "관사유형", type: "text" },
  { key: "name", label: "관사명", type: "text" },
  { key: "address", label: "주소", type: "text" },
  { key: "households", label: "세대수", type: "number" },
  { key: "capacity_per", label: "수용기준(명/실)", type: "number" },
  { key: "capacity", label: "수용가능인원", type: "number" },
  { key: "residents", label: "입주인원", type: "number" },
  { key: "waiting", label: "대기자수", type: "number" },
  { key: "note", label: "비고", type: "text" },
];

const HINT = "테이블을 불러오지 못했습니다. gwansa-setup.sql 을 실행했는지 확인해 주세요.";

export default function GwansaAdmin() {
  return (
    <>
      <RowManager
        title="공동사택 관리"
        columns={SHARED_COLUMNS}
        load={() => fetchShared() as Promise<Row[]>}
        create={createShared}
        update={updateShared}
        remove={deleteShared}
        setupHint={HINT}
      />
      <RowManager
        title="관사 관리"
        columns={GWANSA_COLUMNS}
        load={() => fetchGwansa() as Promise<Row[]>}
        create={createGwansa}
        update={updateGwansa}
        remove={deleteGwansa}
        setupHint={HINT}
      />
      <p className="admin-hint">
        요약(구분별·세부구분) 표는 위 두 목록에서 자동으로 계산됩니다. 관사를
        삭제하면 요약과 합계에 바로 반영됩니다.
      </p>
    </>
  );
}
