# 안성교육지원청 행정업무지원기

안성교육지원청 학교 행정업무 참고용 시스템입니다. 지출·계약·급여·행정공통 업무 안내, 직무달력, 실시간 질문방, 자유게시판 등을 제공합니다.

## 개발

```bash
npm install
npm run dev      # 로컬 개발 서버
npm run build    # 프로덕션 빌드
npm run deploy   # gh-pages 브랜치로 수동 배포 (보통은 필요 없음 — 아래 참고)
```

## 배포

`main` 브랜치에 push되면 `.github/workflows/deploy.yml`이 자동으로 빌드 후 `gh-pages` 브랜치에 배포합니다. 수동으로 `npm run deploy`를 실행할 필요는 없습니다.

PR을 올리면 `.github/workflows/ci.yml`이 빌드 검증을 하고, 저장소 설정에서 "Allow auto-merge"가 켜져 있으면 검증 통과 시 자동으로 `main`에 머지됩니다.

## 환경 변수

`.env.example`을 복사해 `.env`로 저장하고 Supabase 연결 정보를 채워주세요. (기본값이 코드에 들어있어 비워둬도 동작은 합니다 — `src/lib/supabase.ts` 참고.)

## 기술 스택

React + TypeScript + Vite, Supabase(게시판·채팅·공지사항·자료실).
