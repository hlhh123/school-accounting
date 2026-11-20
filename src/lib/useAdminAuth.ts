import { useEffect, useState } from "react";
import {
  supabase,
  isSupabaseConfigured,
  ADMIN_EMAIL,
  initialHashHadRecovery,
} from "./supabase";

export type AdminAuth = {
  ready: boolean;
  isLoggedIn: boolean;
  recovering: boolean;
  login: (id: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearRecovering: () => void;
};

export function useAdminAuth(): AdminAuth {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recovering, setRecovering] = useState(initialHashHadRecovery);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(Boolean(data.session));
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(Boolean(session));
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
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

  const requestPasswordReset = async () => {
    if (!supabase) {
      throw new Error(
        "관리자 기능이 아직 연결되지 않았습니다. Supabase 설정이 필요합니다.",
      );
    }
    const redirectTo = `${window.location.origin}${window.location.pathname}#/admin`;
    const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
      redirectTo,
    });
    if (error) throw new Error("재설정 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.");
  };

  const updatePassword = async (password: string) => {
    if (!supabase) {
      throw new Error("Supabase가 설정되지 않았습니다.");
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error("비밀번호를 변경하지 못했습니다.");
  };

  const clearRecovering = () => setRecovering(false);

  return {
    ready,
    isLoggedIn,
    recovering,
    login,
    logout,
    requestPasswordReset,
    updatePassword,
    clearRecovering,
  };
}
