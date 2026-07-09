import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, ADMIN_EMAIL } from "./supabase";

export type AdminAuth = {
  ready: boolean;
  isLoggedIn: boolean;
  login: (id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export function useAdminAuth(): AdminAuth {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(Boolean(data.session));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async (id: string, password: string) => {
    if (!supabase) {
      throw new Error(
        "관리자 기능이 아직 연결되지 않았습니다. Supabase 설정이 필요합니다.",
      );
    }
    // 아이디(ansaegil)를 Supabase 이메일로 변환해 로그인합니다.
    const email = id.includes("@") ? id : ADMIN_EMAIL;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  return { ready, isLoggedIn, login, logout };
}
