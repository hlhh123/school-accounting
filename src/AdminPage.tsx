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
  deleteDocument,
  suggestedCategories,
  type Doc,
} from "./lib/documents";

// 자료실 업로드를 지원하는 페이지 목록(가이드가 있는 catalog 항목 + 하위 항목).
// 탭이 있는 가이드(예: 지출)는 탭별로 별도 업로드 대상이 됩니다.
type DocPage = { slug: string; label: string };
function addGuidePages(pages: DocPage[], slug: string, label: string) {
  const g = guides[slug];
  if (!g) return;
  if (g.tabs && g.tabs.length > 0) {
    g.tabs.forEach((t) =>
      pages.push({ slug: t.docKey, label: `${label} · ${t.label}` }),
    );
  } else {
    pages.push({ slug, label });
  }
}
function buildDocPages(): DocPage[] {
  const pages: DocPage[] = [];
  for (const cat of catalog) {
    for (const item of cat.items) {
      addGuidePages(pages, item.slug, item.title);
      item.children?.forEach((ch) =>
        addGuidePages(pages, ch.slug, `${item.title} · ${ch.title}`),
      );
    }
  }
  return pages;
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

const DOC_PAGES = buildDocPages();

function DocumentManager() {
  const [page, setPage] = useState<string>(DOC_PAGES[0]?.slug ?? "expense");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0); // input 초기화용

  const pageLabel =
    DOC_PAGES.find((p) => p.slug === page)?.label ?? page;

  const reload = async (slug: string) => {
    setLoading(true);
    setError("");
    try {
      setDocs(await fetchAllDocs(slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload(page);
    setCategory("");
  }, [page]);

  // 분류 입력칸 제안: 기본 제안 + 이미 업로드된 분류
  const categoryOptions = Array.from(
    new Set([...suggestedCategories(page), ...docs.map((d) => d.category)]),
  ).filter(Boolean);

  const onPickFile = (f: File | null) => {
    setFile(f);
    // 제목을 비워뒀다면 파일명(확장자 제외)으로 기본값 채우기
    if (f && !name.trim()) {
      setName(f.name.replace(/\.[^.]+$/, ""));
    }
  };

  const upload = async () => {
    if (!file) {
      setError("업로드할 파일을 선택해 주세요.");
      return;
    }
    if (!name.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (!category.trim()) {
      setError("분류를 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await uploadDocument({ guide: page, category: category.trim(), name, file });
      setName("");
      setFile(null);
      setFileKey((k) => k + 1);
      await reload(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (doc: Doc) => {
    if (!window.confirm(`'${doc.name}' 파일을 삭제할까요?`)) return;
    setError("");
    try {
      await deleteDocument(doc);
      await reload(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>자료실 (파일 업로드)</h3>
      </div>

      <p className="admin-empty" style={{ marginTop: 0 }}>
        업로드한 파일은 <strong>{pageLabel}</strong> 페이지의 선택한 분류 아래에
        표시됩니다.
      </p>

      {error && <p className="admin-error">{error}</p>}

      <datalist id="doc-category-options">
        {categoryOptions.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="admin-editor">
        <label>
          페이지
          <select value={page} onChange={(e) => setPage(e.target.value)}>
            {DOC_PAGES.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
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
        <label>
          파일
          <input
            key={fileKey}
            type="file"
            accept=".pdf,.hwp,.hwpx"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="admin-editor-actions">
          <button
            type="button"
            className="admin-primary"
            onClick={upload}
            disabled={busy}
          >
            {busy ? "업로드 중…" : "업로드"}
          </button>
        </div>
      </div>

      {loading ? (
        <p>불러오는 중…</p>
      ) : docs.length === 0 ? (
        <p className="admin-empty">이 페이지에 업로드된 파일이 없습니다.</p>
      ) : (
        <ul className="admin-list">
          {docs.map((d) => (
            <li key={d.id}>
              <div>
                <strong>
                  <span className="admin-pin">{d.category}</span>
                  {d.name}
                </strong>
                <p>{d.kind.toUpperCase()}</p>
              </div>
              <div className="admin-list-actions">
                <button type="button" onClick={() => remove(d)}>
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
          <button
            type="button"
            className={`admin-nav-item${selected === "expense-docs" ? " is-active" : ""}`}
            onClick={() => setSelected("expense-docs")}
          >
            자료실
          </button>

          {catalog.map((cat) => (
            <div className="admin-nav-group" key={cat.key}>
              <p className="admin-nav-label">{cat.label}</p>
              {cat.items.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className={`admin-nav-item${
                    selected === item.slug ? " is-active" : ""
                  }`}
                  onClick={() => setSelected(item.slug)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <div className="admin-content">
          {selected === "notices" ? (
            <NoticeManager />
          ) : selected === "calendar" ? (
            <DutyAdmin />
          ) : selected === "expense-docs" ? (
            <DocumentManager />
          ) : selected === "gwansa" ? (
            <GwansaAdmin />
          ) : selected === "food" ? (
            <MatjibAdmin />
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
