import { useEffect, useState, type FormEvent } from "react";
import { isSupabaseConfigured } from "./lib/supabase";
import { useAdminAuth } from "./lib/useAdminAuth";
import GwansaAdmin from "./GwansaAdmin";
import {
  fetchNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  type Notice,
} from "./lib/notices";

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
            <>
              <div className="admin-topbar">
                <h2>콘텐츠 관리</h2>
                <button type="button" className="admin-ghost" onClick={logout}>
                  로그아웃
                </button>
              </div>
              <NoticeManager />
              <GwansaAdmin />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
