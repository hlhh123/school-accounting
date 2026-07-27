import { useEffect, useState, type FormEvent } from "react";
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  fetchComments,
  createComment,
  deleteComment,
  adminDeleteComment,
  type BoardPost,
  type BoardComment,
} from "./lib/board";
import { useAdminAuth } from "./lib/useAdminAuth";

// 댓글 영역 — 상세 보기 아래에 표시.
function Comments({ post }: { post: BoardPost }) {
  const { isLoggedIn } = useAdminAuth();
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      setComments(await fetchComments(post.id));
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return setError("답글 내용을 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      await createComment({ postId: post.id, content, password });
      setContent("");
      setPassword("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c: BoardComment) => {
    setError("");
    if (isLoggedIn) {
      if (!window.confirm("이 답글을 삭제할까요?")) return;
      try {
        await adminDeleteComment(c.id);
        await reload();
      } catch {
        setError("삭제할 수 없습니다.");
      }
      return;
    }
    const pw = window.prompt("답글 작성 시 정한 비밀번호를 입력하세요.");
    if (pw === null) return;
    try {
      const ok = await deleteComment({ id: c.id, password: pw });
      if (!ok) setError("비밀번호가 일치하지 않습니다.");
      else await reload();
    } catch {
      setError("삭제할 수 없습니다.");
    }
  };

  return (
    <div className="cm">
      <p className="cm-title">답글 {comments.length > 0 && `${comments.length}`}</p>
      {loading ? (
        <p className="cm-loading">불러오는 중…</p>
      ) : comments.length === 0 ? (
        <p className="cm-empty">아직 답글이 없습니다. 첫 답글을 남겨보세요.</p>
      ) : (
        <ul className="cm-list">
          {comments.map((c) => (
            <li key={c.id} className="cm-item">
              <div className="cm-item-body">{c.content}</div>
              <div className="cm-item-meta">
                <span className="cm-date">{c.created_at.slice(0, 10)}</span>
                <button
                  type="button"
                  className="cm-del"
                  onClick={() => remove(c)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="cm-form" onSubmit={submit}>
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="답글을 입력하세요 (누구나 작성 가능)"
        />
        <div className="cm-form-row">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            placeholder="삭제용 비밀번호(선택)"
          />
          <button type="submit" className="board-primary" disabled={busy}>
            {busy ? "등록 중…" : "답글 등록"}
          </button>
        </div>
        {error && <p className="board-error">{error}</p>}
      </form>
    </div>
  );
}

export default function BoardPanel({
  board = "free",
  categoryPlaceholder = "예: 복무, 지출, 계약 등 (직접 입력)",
  writeLabel = "✎ 글쓰기",
}: {
  board?: string;
  categoryPlaceholder?: string;
  writeLabel?: string;
}) {
  const { isLoggedIn } = useAdminAuth();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<BoardPost | null>(null);
  const [writing, setWriting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setPosts(await fetchPosts(board));
    } catch {
      setError("게시글을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  const remove = async (p: BoardPost) => {
    if (!window.confirm(`#${p.seq} 게시글을 삭제할까요?`)) return;
    setError("");
    try {
      await deletePost(p.id);
      if (selected?.id === p.id) setSelected(null);
      await reload();
    } catch {
      setError("삭제할 수 없습니다. (관리자 로그인이 필요합니다)");
    }
  };

  const startWrite = () => {
    setTitle("");
    setCategory("");
    setContent("");
    setPassword("");
    setError("");
    setWriting(true);
  };

  const startEdit = () => {
    if (!selected) return;
    setTitle(selected.title);
    setCategory(selected.category);
    setContent(selected.content);
    setPassword("");
    setError("");
    setEditing(true);
  };

  const submitNew = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("제목을 입력해 주세요.");
    if (!password.trim()) return setError("비밀번호를 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      await createPost({ board, title, category, content, password });
      setWriting(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!title.trim()) return setError("제목을 입력해 주세요.");
    if (!password.trim()) return setError("비밀번호를 입력해 주세요.");
    setBusy(true);
    setError("");
    try {
      const ok = await updatePost({
        id: selected.id,
        password,
        title,
        category,
        content,
      });
      if (!ok) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
      setSelected({
        ...selected,
        title: title.trim(),
        category: category.trim(),
        content,
      });
      setEditing(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const renderForm = (isEdit: boolean) => (
    <form className="board-form" onSubmit={isEdit ? submitEdit : submitNew}>
      <label>
        제목
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
        />
      </label>
      <label>
        분류 <span className="board-optional">(선택)</span>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={categoryPlaceholder}
        />
      </label>
      <label>
        내용
        <textarea
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
        />
      </label>
      <label>
        비밀번호
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          placeholder={isEdit ? "글 작성 시 정한 비밀번호" : "수정할 때 쓸 비밀번호"}
        />
      </label>
      {error && <p className="board-error">{error}</p>}
      <p className="board-hint">
        {isEdit
          ? "작성 시 입력한 비밀번호가 있어야 수정됩니다."
          : "작성자 정보 없이 익명(순번)으로 등록됩니다. 나중에 수정하려면 비밀번호가 필요합니다."}
      </p>
      <div className="board-form-actions">
        <button type="submit" className="board-primary" disabled={busy}>
          {busy ? "저장 중…" : isEdit ? "수정 저장" : "등록"}
        </button>
        <button
          type="button"
          className="board-ghost"
          onClick={() => (isEdit ? setEditing(false) : setWriting(false))}
        >
          취소
        </button>
      </div>
    </form>
  );

  if (selected) {
    if (editing) return renderForm(true);
    return (
      <div className="board-detail">
        <button
          type="button"
          className="board-back"
          onClick={() => setSelected(null)}
        >
          ← 목록으로
        </button>
        <p className="board-detail-meta">
          <span className="board-seq">#{selected.seq}</span>
          {selected.category && (
            <span className="board-badge">{selected.category}</span>
          )}
        </p>
        <h4 className="board-detail-title">{selected.title}</h4>
        <div className="board-detail-content">
          {selected.content ? (
            selected.content
          ) : (
            <span className="board-empty">내용이 없습니다.</span>
          )}
        </div>
        <div className="board-detail-actions">
          <button type="button" className="board-ghost" onClick={startEdit}>
            ✎ 수정
          </button>
        </div>
        <Comments post={selected} />
      </div>
    );
  }

  if (writing) return renderForm(false);

  return (
    <>
      <div className="board-toolbar">
        <span className="board-count">
          {loading ? "" : `총 ${posts.length}건`}
        </span>
        <button type="button" className="board-primary" onClick={startWrite}>
          {writeLabel}
        </button>
      </div>

      {error && <p className="board-error">{error}</p>}

      {loading ? (
        <p className="board-loading">불러오는 중…</p>
      ) : posts.length === 0 ? (
        error ? null : (
          <p className="board-empty">아직 글이 없습니다. 첫 글을 남겨보세요.</p>
        )
      ) : (
        <ul className="board-list">
          {posts.map((p) => (
            <li key={p.id} className="board-row">
              <button
                type="button"
                className="board-item"
                onClick={() => setSelected(p)}
              >
                <span className="board-seq">#{p.seq}</span>
                {p.category && <span className="board-badge">{p.category}</span>}
                <span className="board-title">{p.title}</span>
                {!isLoggedIn && (
                  <span className="board-arrow" aria-hidden>
                    ›
                  </span>
                )}
              </button>
              {isLoggedIn && (
                <button
                  type="button"
                  className="board-del"
                  onClick={() => remove(p)}
                  aria-label="게시글 삭제"
                  title="삭제"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
