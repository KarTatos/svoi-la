import { useCallback, useEffect, useMemo, useState } from "react";
import { getUser, signInWithGoogle, signOut as dbSignOut, supabase } from "../lib/supabase";

const mapAuthUser = (u) => {
  if (!u) return null;
  return {
    id: u.id,
    name: u.user_metadata?.full_name || u.email || "Пользователь",
    email: u.email || "",
    avatar: "👤",
    avatarUrl: u.user_metadata?.avatar_url,
  };
};

export function useAuth(adminEmails = []) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const normalizedAdmins = useMemo(
    () => (adminEmails || []).map((x) => String(x || "").trim().toLowerCase()).filter(Boolean),
    [adminEmails],
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setAuthReady(false);
      const u = await getUser();
      if (!mounted) return;
      setUser(mapAuthUser(u));
      setAuthReady(true);
    };

    init();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(mapAuthUser(session?.user || null));
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => signInWithGoogle(), []);
  const signOut = useCallback(async () => dbSignOut(), []);

  const isAdmin = normalizedAdmins.includes(String(user?.email || "").trim().toLowerCase());

  return { user, authReady, signIn, signOut, isAdmin };
}
