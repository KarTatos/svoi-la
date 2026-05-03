import { useCallback, useEffect, useMemo, useState } from "react";
import { getUser, signInWithGoogle, signOut as dbSignOut, supabase } from "../lib/supabase";

const LOCAL_OWNER_KEY = "svoi_local_owner_mode";

function isLocalHost() {
  if (typeof window === "undefined") return false;
  const h = String(window.location.hostname || "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}

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
  const [localOwnerEnabled, setLocalOwnerEnabled] = useState(false);

  const normalizedAdmins = useMemo(
    () => (adminEmails || []).map((x) => String(x || "").trim().toLowerCase()).filter(Boolean),
    [adminEmails],
  );

  useEffect(() => {
    if (!isLocalHost()) return;
    try {
      const saved = localStorage.getItem(LOCAL_OWNER_KEY);
      // Default ON locally so owner can use all controls without OAuth login.
      const enabled = saved == null ? true : saved === "1";
      setLocalOwnerEnabled(enabled);
      if (saved == null) localStorage.setItem(LOCAL_OWNER_KEY, enabled ? "1" : "0");
    } catch {
      setLocalOwnerEnabled(true);
    }
  }, []);

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

  const effectiveUser = useMemo(() => {
    if (user) return user;
    if (isLocalHost() && localOwnerEnabled) {
      return {
        id: "local-owner",
        name: "Local Owner",
        email: "local-owner@localhost",
        avatar: "👤",
        avatarUrl: null,
      };
    }
    return null;
  }, [user, localOwnerEnabled]);

  const signIn = useCallback(async () => {
    if (isLocalHost()) {
      try { localStorage.setItem(LOCAL_OWNER_KEY, "1"); } catch {}
      setLocalOwnerEnabled(true);
      return;
    }
    await signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    if (isLocalHost()) {
      try { localStorage.setItem(LOCAL_OWNER_KEY, "0"); } catch {}
      setLocalOwnerEnabled(false);
    }
    await dbSignOut();
  }, []);

  const isAdmin =
    (isLocalHost() && localOwnerEnabled) ||
    normalizedAdmins.includes(String(effectiveUser?.email || "").trim().toLowerCase());

  return { user: effectiveUser, authReady, signIn, signOut, isAdmin };
}
