import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Netlify 환경변수(또는 로컬 .env)에서 읽어옵니다.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// 키가 없으면 사이트는 폴백(읽기 전용 기본값)으로 정상 동작합니다.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

// 관리자 로그인 아이디(ansaegil)를 Supabase Auth 이메일로 매핑합니다.
export const ADMIN_ID = "ansaegil";
export const ADMIN_EMAIL = "ansaegil@ansaegil.kr";
