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
