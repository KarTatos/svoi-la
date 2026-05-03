import { useCallback, useEffect, useMemo, useState } from "react";
import { getUser, signInWithGoogle, signOut as dbSignOut, supabase } from "../lib/supabase";

const LOCAL_OWNER_KEY = "svoi_local_owner_mode";
const LOCAL_OWNER_NAME_KEY = "svoi_local_owner_name";

function isLocalHost() {
  if (typeof window === "undefined") return false;
  const h = String(window.location.hostname || "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}

const mapAuthUser = (u) => {
  if (!u) return null;
  const displayName = u.user_metadata?.display_name;
  const fullName = u.user_metadata?.full_name;
  return {
    id: u.id,
    name: displayName || fullName || u.email || "Пользователь",
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
      let localOwnerName = "Local Owner";
      try {
        const saved = localStorage.getItem(LOCAL_OWNER_NAME_KEY);
        if (saved && saved.trim()) localOwnerName = saved.trim();
      } catch {}
      return {
        id: "local-owner",
        name: localOwnerName,
        email: "local-owner@localhost",
        avatar: "👤",
        avatarUrl: null,
      };
    }
    return null;
  }, [user, localOwnerEnabled]);

  const signIn = useCallback(async () => {
    if (isLocalHost()) {
      try {
        localStorage.setItem(LOCAL_OWNER_KEY, "1");
      } catch {}
      setLocalOwnerEnabled(true);
      return;
    }
    await signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    if (isLocalHost()) {
      try {
        localStorage.setItem(LOCAL_OWNER_KEY, "0");
      } catch {}
      setLocalOwnerEnabled(false);
    }
    await dbSignOut();
  }, []);

  const updateDisplayName = useCallback(async (nextNameRaw) => {
    const nextName = String(nextNameRaw || "").trim().slice(0, 40);
    if (!nextName) throw new Error("Введите имя");

    if (isLocalHost() && !user) {
      try {
        localStorage.setItem(LOCAL_OWNER_NAME_KEY, nextName);
      } catch {}
      setLocalOwnerEnabled(true);
      return { ok: true };
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: nextName },
    });
    if (error) throw error;
    if (data?.user) setUser(mapAuthUser(data.user));
    return { ok: true };
  }, [user]);

  const isAdmin =
    (isLocalHost() && localOwnerEnabled) ||
    normalizedAdmins.includes(String(effectiveUser?.email || "").trim().toLowerCase());

  return { user: effectiveUser, authReady, signIn, signOut, isAdmin, updateDisplayName };
}
