import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 연결 정보: Netlify 환경변수 우선, 없으면 아래 기본값 사용.
// anon 키는 브라우저에 공개되는 공개키라 저장소에 두어도 안전합니다(데이터는 RLS로 보호).
const DEFAULT_URL = "https://cwixtafnpcwynnelavfy.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aXh0YWZucGN3eW5uZWxhdmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NzY2NDAsImV4cCI6MjA5OTE1MjY0MH0.J0Mxn6YTqhdwFEgrA8nUZq0hZMFBa9nPBIOL5scX28o";

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_URL;
const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  DEFAULT_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;

// 관리자 로그인 계정(Supabase Auth 이메일). 아이디 칸에 이메일 전체를 입력합니다.
export const ADMIN_EMAIL = "ansaegil2026@gmail.com";

// 비밀번호 재설정 메일 링크로 들어오면 주소 뒤에 Supabase가 토큰(#...type=recovery)을
// 붙여줍니다. 이 값은 모듈이 처음 로드될 때(= Supabase 클라이언트가 내부적으로 그 토큰을
// 읽어서 지워버리기 전) 딱 한 번 읽어 저장해 둡니다. 라우팅/화면 분기에서 이 값을 쓰면
// 토큰이 비동기로 정리되는 타이밍과 경쟁하지 않고 안정적으로 재설정 화면을 띄울 수 있습니다.
export const initialHashHadRecovery =
  typeof window !== "undefined" && window.location.hash.includes("type=recovery");
