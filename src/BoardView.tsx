import { useEffect, useState, type FormEvent } from "react";
import { fetchPosts, createPost, type BoardPost } from "./lib/board";

function goHome() {
  window.location.hash = "";
}

export default function BoardView() {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<BoardPost | null>(null);
  const [writing, setWriting] = useState(false);

  // 작성 폼 상태
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      setPosts(await fetchPosts());
    } catch {
      setError("게시글을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const startWrite = () => {
    setTitle("");
    setCategory("");
    setContent("");
    setError("");
    setWriting(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (!category.trim()) {
      setError("분야를 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createPost({ title, category, content });
      setWriting(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="board">
      <div className="section-inner">
        <button type="button" className="back-link" onClick={goHome}>
          ← 홈으로 돌아가기
        </button>

        <div className="board-heading">
          <p>생활 정보</p>
          <h3>자유게시판</h3>
        </div>

        {/* 상세 보기 */}
        {selected ? (
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
              <span className="board-badge">{selected.category}</span>
            </p>
            <h4 className="board-detail-title">{selected.title}</h4>
            <div className="board-detail-content">
              {selected.content ? (
                selected.content
              ) : (
                <span className="board-empty">내용이 없습니다.</span>
              )}
            </div>
          </div>
        ) : writing ? (
          /* 글 작성 */
          <form className="board-form" onSubmit={submit}>
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
              분야
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="예: 복무, 지출, 계약 등 (직접 입력)"
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
            {error && <p className="board-error">{error}</p>}
            <p className="board-hint">
              작성자 정보 없이 익명(게시글 순번)으로 등록됩니다.
            </p>
            <div className="board-form-actions">
              <button
                type="submit"
                className="board-primary"
                disabled={busy}
              >
                {busy ? "등록 중…" : "등록"}
              </button>
              <button
                type="button"
                className="board-ghost"
                onClick={() => setWriting(false)}
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          /* 목록 */
          <>
            <div className="board-toolbar">
              <span className="board-count">
                {loading ? "" : `총 ${posts.length}건`}
              </span>
              <button
                type="button"
                className="board-primary"
                onClick={startWrite}
              >
                ✎ 글쓰기
              </button>
            </div>

            {error && <p className="board-error">{error}</p>}

            {loading ? (
              <p className="board-loading">불러오는 중…</p>
            ) : posts.length === 0 ? (
              error ? null : (
                <p className="board-empty">
                  아직 게시글이 없습니다. 첫 글을 남겨보세요.
                </p>
              )
            ) : (
              <ul className="board-list">
                {posts.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="board-item"
                      onClick={() => setSelected(p)}
                    >
                      <span className="board-seq">#{p.seq}</span>
                      <span className="board-badge">{p.category}</span>
                      <span className="board-title">{p.title}</span>
                      <span className="board-arrow" aria-hidden>
                        ›
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
