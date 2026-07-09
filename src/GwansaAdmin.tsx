import { useEffect, useState } from "react";
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

type Col = { key: string; label: string; type: "text" | "number" };
type Row = { id: string } & Record<string, unknown>;

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

function emptyDraft(cols: Col[]): Record<string, string> {
  return Object.fromEntries(cols.map((c) => [c.key, ""]));
}

function toValues(cols: Col[], draft: Record<string, string>) {
  const out: Record<string, unknown> = {};
  for (const c of cols) {
    out[c.key] =
      c.type === "number" ? Number(draft[c.key] || 0) : draft[c.key].trim();
  }
  return out;
}

function RowManager({
  title,
  columns,
  load,
  create,
  update,
  remove,
}: {
  title: string;
  columns: Col[];
  load: () => Promise<Row[]>;
  create: (v: Record<string, unknown>) => Promise<void>;
  update: (id: string, v: Record<string, unknown>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>(
    emptyDraft(columns),
  );

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await load());
    } catch {
      setError(
        "테이블을 불러오지 못했습니다. gwansa-setup.sql 을 실행했는지 확인해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNew = () => {
    setEditingId("new");
    setDraft(emptyDraft(columns));
  };
  const startEdit = (r: Row) => {
    setEditingId(r.id);
    setDraft(
      Object.fromEntries(
        columns.map((c) => [c.key, String(r[c.key] ?? "")]),
      ) as Record<string, string>,
    );
  };
  const cancel = () => {
    setEditingId(null);
    setDraft(emptyDraft(columns));
  };

  const save = async () => {
    setError("");
    try {
      const values = toValues(columns, draft);
      if (editingId === "new") await create(values);
      else if (editingId) await update(editingId, values);
      cancel();
      await reload();
    } catch {
      setError("저장에 실패했습니다.");
    }
  };

  const del = async (id: string) => {
    if (!window.confirm("이 행을 삭제할까요?")) return;
    try {
      await remove(id);
      await reload();
    } catch {
      setError("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>{title}</h3>
        <button type="button" className="admin-primary" onClick={startNew}>
          + 행 추가
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {editingId && (
        <div className="admin-editor">
          <div className="field-grid">
            {columns.map((c) => (
              <label key={c.key}>
                {c.label}
                <input
                  type={c.type === "number" ? "number" : "text"}
                  value={draft[c.key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [c.key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
          <div className="admin-editor-actions">
            <button type="button" className="admin-primary" onClick={save}>
              저장
            </button>
            <button type="button" className="admin-ghost" onClick={cancel}>
              취소
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>불러오는 중…</p>
      ) : rows.length === 0 ? (
        <p className="admin-empty">등록된 행이 없습니다. "행 추가"로 입력하세요.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{String(r[c.key] ?? "")}</td>
                  ))}
                  <td>
                    <div className="admin-list-actions">
                      <button type="button" onClick={() => startEdit(r)}>
                        수정
                      </button>
                      <button type="button" onClick={() => del(r.id)}>
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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
      />
      <RowManager
        title="관사 관리"
        columns={GWANSA_COLUMNS}
        load={() => fetchGwansa() as Promise<Row[]>}
        create={createGwansa}
        update={updateGwansa}
        remove={deleteGwansa}
      />
      <p className="admin-hint">
        요약(구분별·세부구분) 표는 위 두 목록에서 자동으로 계산됩니다. 관사를
        삭제하면 요약과 합계에 바로 반영됩니다.
      </p>
    </>
  );
}
