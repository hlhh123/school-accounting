import BoardPanel from "./BoardPanel";

function goHome() {
  window.location.hash = "";
}

// 생활 정보 · 자유게시판 (전체 페이지). 게시판 본체는 BoardPanel 재사용.
export default function BoardView() {
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

        <BoardPanel board="free" />
      </div>
    </section>
  );
}
