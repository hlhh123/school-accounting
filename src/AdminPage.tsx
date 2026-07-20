import { useEffect, useState, type FormEvent } from "react";
import { isSupabaseConfigured } from "./lib/supabase";
import { useAdminAuth } from "./lib/useAdminAuth";
import GwansaAdmin from "./GwansaAdmin";
import MatjibAdmin from "./MatjibAdmin";
import DutyAdmin from "./DutyAdmin";
import { catalog, findItem } from "./catalog";
import { guides } from "./guides";
import {
  fetchNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  type Notice,
} from "./lib/notices";
import {
  fetchAllDocs,
  uploadDocument,
  updateDocument,
  deleteDocument,
  suggestedCategories,
  type Doc,
} from "./lib/documents";

// 한 항목(배너)이 가진 자료 보관함 목록.
// 탭이 있는 가이드(예: 지출)는 탭(서식/매뉴얼)별로 나뉩니다.
type DocTarget = { key: string; label: string };
function docTargetsFor(slug: string): DocTarget[] {
  const g = guides[slug];
  if (!g) return [];
  if (g.tabs && g.tabs.length > 0) {
    // 계산기 등 업로드가 없는(docKey 없는) 탭은 제외
    return g.tabs
      .filter((t) => t.docKey)
      .map((t) => ({ key: t.docKey as string, label: t.label }));
  }
  return [{ key: slug, label: "자료" }];
}

// 코드(guides.ts)에 들어 있는 기본 제공 자료. 관리자에서 읽기 전용으로 함께 보여줍니다.
type StaticDoc = { category: string; name: string; kind: string; file: string };
function staticDocsFor(slug: string, targetKey: string): StaticDoc[] {
  const g = guides[slug];
  if (!g) return [];
  const sections =
    g.tabs && g.tabs.length > 0
      ? (g.tabs.find((t) => t.docKey === targetKey)?.sections ?? [])
      : g.sections;
  const out: StaticDoc[] = [];
  for (const sec of sections) {
    for (const block of sec.blocks) {
      if (block.type !== "files") continue;
      for (const item of block.items) {
        out.push({
          category: sec.title,
          name: item.name,
          kind: item.kind,
          file: item.file,
        });
      }
    }
  }
  return out;
}

function AdminHeader({ onExit }: { onExit: () => void }) {
  return (
    <header className="header">
      <div className="header-inner">
        <button type="button" className="logo-area" onClick={onExit}>
          <span className="logo">안성교육지원청 관리자</span>
        </button>
        <nav className="navigation">
          <a href="#home" onClick={onExit}>
            사이트로 돌아가기
          </a>
        </nav>
      </div>
    </header>
  );
}

function LoginForm({
  onSubmit,
}: {
  onSubmit: (id: string, pw: string) => Promise<void>;
}) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSubmit(id, pw);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <h2>관리자 로그인</h2>
      {!isSupabaseConfigured && (
        <p className="admin-warn">
          아직 Supabase가 연결되지 않아 로그인할 수 없습니다. 설정 완료 후
          이용해 주세요.
        </p>
      )}
      <form onSubmit={submit}>
        <label>
          아이디
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="admin-primary" disabled={busy}>
          {busy ? "로그인 중…" : "로그인"}
        </button>
      </form>
    </div>
  );
}

const emptyDraft = { title: "", body: "", pinned: false };

function NoticeManager() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setNotices(await fetchNotices());
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const startNew = () => {
    setEditingId("new");
    setDraft(emptyDraft);
  };

  const startEdit = (n: Notice) => {
    setEditingId(n.id);
    setDraft({ title: n.title, body: n.body, pinned: n.pinned });
  };

  const cancel = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    setError("");
    try {
      if (editingId === "new") {
        await createNotice(draft);
      } else if (editingId) {
        await updateNotice(editingId, draft);
      }
      cancel();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("이 공지사항을 삭제할까요?")) return;
    try {
      await deleteNotice(id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>공지사항 관리</h3>
        <button type="button" className="admin-primary" onClick={startNew}>
          + 새 공지 작성
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {editingId && (
        <div className="admin-editor">
          <label>
            제목
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </label>
          <label>
            내용
            <textarea
              rows={5}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={draft.pinned}
              onChange={(e) => setDraft({ ...draft, pinned: e.target.checked })}
            />
            상단 고정
          </label>
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
      ) : notices.length === 0 ? (
        <p className="admin-empty">등록된 공지사항이 없습니다.</p>
      ) : (
        <ul className="admin-list">
          {notices.map((n) => (
            <li key={n.id}>
              <div>
                <strong>
                  {n.pinned && <span className="admin-pin">고정</span>}
                  {n.title}
                </strong>
                <p>{n.body}</p>
              </div>
              <div className="admin-list-actions">
                <button type="button" onClick={() => startEdit(n)}>
                  수정
                </button>
                <button type="button" onClick={() => remove(n.id)}>
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemDocsManager({ slug, title }: { slug: string; title: string }) {
  const targets = docTargetsFor(slug);
  const [target, setTarget] = useState<string>(targets[0]?.key ?? slug);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // editingId: "new" = 새 파일 업로드, 그 외 = 해당 행 수정
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);

  const reload = async (key: string) => {
    setLoading(true);
    setError("");
    try {
      setDocs(await fetchAllDocs(key));
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload(target);
    setEditingId(null);
  }, [target]);

  // 코드에 들어 있는 기본 제공 자료(읽기 전용)
  const staticDocs = staticDocsFor(slug, target);

  const categoryOptions = Array.from(
    new Set([
      ...suggestedCategories(target),
      ...staticDocs.map((s) => s.category),
      ...docs.map((d) => d.category),
    ]),
  ).filter(Boolean);

  const startNew = () => {
    setEditingId("new");
    setCategory("");
    setName("");
    setFile(null);
    setFileKey((k) => k + 1);
  };

  const startEdit = (d: Doc) => {
    setEditingId(d.id);
    setCategory(d.category);
    setName(d.name);
    setFile(null);
  };

  const cancel = () => {
    setEditingId(null);
    setCategory("");
    setName("");
    setFile(null);
  };

  const onPickFile = (f: File | null) => {
    setFile(f);
    if (f && !name.trim()) setName(f.name.replace(/\.[^.]+$/, ""));
  };

  const save = async () => {
    if (!name.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (!category.trim()) {
      setError("분류를 입력해 주세요.");
      return;
    }
    if (editingId === "new" && !file) {
      setError("업로드할 파일을 선택해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (editingId === "new") {
        await uploadDocument({
          guide: target,
          category: category.trim(),
          name,
          file: file as File,
        });
      } else if (editingId) {
        await updateDocument(editingId, { name, category });
      }
      cancel();
      setFileKey((k) => k + 1);
      await reload(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (doc: Doc) => {
    if (!window.confirm(`'${doc.name}' 파일을 삭제할까요?`)) return;
    setError("");
    try {
      await deleteDocument(doc);
      await reload(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
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

      {targets.length > 1 && (
        <div className="admin-tabs">
          {targets.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`admin-tab${t.key === target ? " is-active" : ""}`}
              onClick={() => setTarget(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="admin-error">{error}</p>}

      <datalist id="doc-category-options">
        {categoryOptions.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {editingId && (
        <div className="admin-editor">
          <label>
            분류
            <input
              type="text"
              list="doc-category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="예: 매뉴얼·지침 (직접 입력 가능)"
            />
          </label>
          <label>
            제목
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="화면에 표시할 제목"
            />
          </label>
          {editingId === "new" ? (
            <label>
              파일
              <input
                key={fileKey}
                type="file"
                accept=".pdf,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <p className="admin-hint">
              파일은 그대로 두고 제목·분류만 바뀝니다.
            </p>
          )}
          <div className="admin-editor-actions">
            <button
              type="button"
              className="admin-primary"
              onClick={save}
              disabled={busy}
            >
              {busy ? "저장 중…" : "저장"}
            </button>
            <button type="button" className="admin-ghost" onClick={cancel}>
              취소
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>불러오는 중…</p>
      ) : docs.length === 0 && staticDocs.length === 0 ? (
        <p className="admin-empty">
          등록된 자료가 없습니다. "행 추가"로 올려 주세요.
        </p>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>분류</th>
                  <th>제목</th>
                  <th>형식</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td>{d.category}</td>
                    <td>{d.name}</td>
                    <td>{d.kind.toUpperCase()}</td>
                    <td>
                      <div className="admin-list-actions">
                        <button type="button" onClick={() => startEdit(d)}>
                          수정
                        </button>
                        <button type="button" onClick={() => remove(d)}>
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {staticDocs.map((s) => (
                  <tr key={`static-${s.file}`} className="is-builtin">
                    <td>{s.category}</td>
                    <td>{s.name}</td>
                    <td>{s.kind.toUpperCase()}</td>
                    <td>
                      <span className="admin-builtin-tag">기본 제공</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {staticDocs.length > 0 && (
            <p className="admin-hint">
              <strong>기본 제공</strong> {staticDocs.length}건은 사이트에 미리
              넣어 둔 자료라 여기서 수정·삭제할 수 없습니다. 변경이 필요하면
              담당자에게 요청해 주세요. 새로 올린 자료만 수정·삭제됩니다.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function AdminPlaceholder({ slug }: { slug: string }) {
  const found = findItem(slug);
  const title = found?.item.title ?? slug;
  const label = found?.crumb ?? "";
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>
          {label && <span className="admin-crumb">{label} · </span>}
          {title}
        </h3>
      </div>
      <p className="admin-empty">
        이 항목은 아직 편집할 콘텐츠가 없습니다. (준비 중)
      </p>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [selected, setSelected] = useState<string>("notices");

  return (
    <>
      <div className="admin-topbar">
        <h2>콘텐츠 관리</h2>
        <button type="button" className="admin-ghost" onClick={onLogout}>
          로그아웃
        </button>
      </div>

      <div className="admin-layout">
        <aside className="admin-nav">
          <button
            type="button"
            className={`admin-nav-item${selected === "notices" ? " is-active" : ""}`}
            onClick={() => setSelected("notices")}
          >
            공지사항
          </button>
          <button
            type="button"
            className={`admin-nav-item${selected === "calendar" ? " is-active" : ""}`}
            onClick={() => setSelected("calendar")}
          >
            직무달력
          </button>

          {catalog.map((cat) => (
            <div className="admin-nav-group" key={cat.key}>
              <p className="admin-nav-label">{cat.label}</p>
              {cat.items.map((item) => (
                <div key={item.slug}>
                  <button
                    type="button"
                    className={`admin-nav-item${
                      selected === item.slug ? " is-active" : ""
                    }`}
                    onClick={() => setSelected(item.slug)}
                  >
                    {item.title}
                  </button>
                  {item.children?.map((child) => (
                    <button
                      key={child.slug}
                      type="button"
                      className={`admin-nav-item is-sub${
                        selected === child.slug ? " is-active" : ""
                      }`}
                      onClick={() => setSelected(child.slug)}
                    >
                      {child.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </aside>

        <div className="admin-content">
          {selected === "notices" ? (
            <NoticeManager />
          ) : selected === "calendar" ? (
            <DutyAdmin />
          ) : selected === "gwansa" ? (
            <GwansaAdmin />
          ) : selected === "food" ? (
            <MatjibAdmin />
          ) : docTargetsFor(selected).length > 0 ? (
            <ItemDocsManager
              key={selected}
              slug={selected}
              title={findItem(selected)?.item.title ?? selected}
            />
          ) : (
            <AdminPlaceholder slug={selected} />
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminPage({ onExit }: { onExit: () => void }) {
  const { ready, isLoggedIn, login, logout } = useAdminAuth();

  return (
    <div className="app">
      <AdminHeader onExit={onExit} />
      <main className="admin-main">
        <div className="section-inner">
          {!ready ? (
            <p>확인 중…</p>
          ) : !isLoggedIn ? (
            <LoginForm onSubmit={login} />
          ) : (
            <AdminDashboard onLogout={logout} />
          )}
        </div>
      </main>
    </div>
  );
}
