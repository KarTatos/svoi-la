import * as AppleAuthentication from "expo-apple-authentication";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
import { prepareImageForUpload } from "../lib/images";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const ADMIN_EMAILS = new Set(
  String(process.env.EXPO_PUBLIC_ADMIN_EMAILS || "admin@admin.admin")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
);
const AVATAR_BUCKET = "LAHELPBOT";

export function getMobileRedirectUrl() {
  return Linking.createURL("auth/callback");
}

function parseCodeFromUrl(url) {
  if (!url) return "";
  const codeMatch = String(url).match(/[?&]code=([^&#]+)/);
  return codeMatch?.[1] ? decodeURIComponent(codeMatch[1]) : "";
}

function parseTokensFromUrl(url) {
  if (!url) return null;

  const parsed = Linking.parse(url);
  const params = parsed?.queryParams || {};

  let accessToken = typeof params.access_token === "string" ? params.access_token : "";
  let refreshToken = typeof params.refresh_token === "string" ? params.refresh_token : "";

  if ((!accessToken || !refreshToken) && String(url).includes("#")) {
    const hash = String(url).split("#")[1] || "";
    const hashParams = new URLSearchParams(hash);
    accessToken = accessToken || hashParams.get("access_token") || "";
    refreshToken = refreshToken || hashParams.get("refresh_token") || "";
  }

  if (!accessToken || !refreshToken) return null;

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

function mapUser(user) {
  if (!user) return null;

  const metadata = user.user_metadata || {};
  const providers = Array.isArray(user.identities)
    ? user.identities.map((item) => item?.provider).filter(Boolean)
    : [];

  return {
    id: user.id,
    email: user.email || "",
    name: metadata.full_name || metadata.name || metadata.display_name || "",
    avatarUrl: metadata.avatar_url || "",
    providers,
  };
}

export function useAuth() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState("");
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [lastCallbackUrl, setLastCallbackUrl] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;

      if (sessionError) {
        setError(sessionError.message || "Не удалось получить сессию");
      }

      setSession(data?.session || null);
      setUser(mapUser(data?.session?.user || null));
      setLoading(false);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession || null);
      setUser(mapUser(nextSession?.user || null));
      setLoading(false);
    });

    (async () => {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        if (mounted) setAppleAvailable(Boolean(available));
      } catch {
        if (mounted) setAppleAvailable(false);
      }
    })();

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const redirectTo = useMemo(() => getMobileRedirectUrl(), []);
  const isAdmin = Boolean(user?.email && ADMIN_EMAILS.has(String(user.email).toLowerCase()));

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setError("");
    setLastCallbackUrl("");

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
          },
        },
      });

      if (oauthError) throw oauthError;
      if (!data?.url) throw new Error("Google OAuth URL не получен");

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type !== "success") {
        if (result.type === "cancel" || result.type === "dismiss") {
          return { ok: false, canceled: true };
        }
        throw new Error(`Google OAuth не завершен (${result.type})`);
      }

      const callbackUrl = result.url || "";
      setLastCallbackUrl(callbackUrl);

      if (/vercel\.app/i.test(callbackUrl)) {
        throw new Error(
          `OAuth returned to web/Vercel instead of mobile redirect. Add this redirect URL to Supabase: ${redirectTo}`
        );
      }

      const code = parseCodeFromUrl(callbackUrl);
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        return { ok: true };
      }

      const tokens = parseTokensFromUrl(callbackUrl);
      if (tokens) {
        const { error: sessionError } = await supabase.auth.setSession(tokens);
        if (sessionError) throw sessionError;
        return { ok: true };
      }

      throw new Error(`OAuth callback не содержит code/token. callback=${callbackUrl || "empty"}`);
    } catch (cause) {
      setError(cause?.message || "Ошибка входа через Google");
      throw cause;
    } finally {
      setAuthBusy(false);
    }
  }, [redirectTo]);

  const signInWithApple = useCallback(async () => {
    setAuthBusy(true);
    setError("");

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Apple identity token не получен");
      }

      const { error: appleError } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (appleError) throw appleError;
      return { ok: true };
    } catch (cause) {
      const msg = cause?.message || "Ошибка входа через Apple";
      const canceled =
        msg.toLowerCase().includes("canceled") ||
        msg.toLowerCase().includes("cancelled") ||
        msg.toLowerCase().includes("authorizationcancelled");

      if (canceled) {
        return { ok: false, canceled: true };
      }

      setError(msg);
      throw cause;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signInWithPassword = useCallback(async (email, password) => {
    setAuthBusy(true);
    setError("");
    try {
      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanPassword = String(password || "");
      if (!cleanEmail || !cleanPassword) {
        throw new Error("Введите email и пароль");
      }
      const { error: passError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });
      if (passError) throw passError;
      return { ok: true };
    } catch (cause) {
      setError(cause?.message || "Ошибка входа по email");
      throw cause;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const updateDisplayName = useCallback(async (nextName) => {
    const clean = String(nextName || "").trim();
    if (!clean) throw new Error("Введите имя");

    setAuthBusy(true);
    setError("");
    try {
      const { error: updError } = await supabase.auth.updateUser({
        data: {
          full_name: clean,
          name: clean,
          display_name: clean,
        },
      });
      if (updError) throw updError;
      return { ok: true };
    } catch (cause) {
      setError(cause?.message || "Не удалось обновить имя");
      throw cause;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const updateAvatar = useCallback(async () => {
    if (!session?.user?.id) throw new Error("Нужно войти в аккаунт");

    setAuthBusy(true);
    setError("");
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) throw new Error("Нужен доступ к фото");

      const pick = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.9,
      });
      if (pick.canceled) return { ok: false, canceled: true };

      const asset = pick.assets?.[0];
      const prepared = await prepareImageForUpload(asset, { maxSide: 1600, compress: 0.82 });
      const uri = String(prepared?.uri || "");
      if (!uri) throw new Error("Не удалось получить файл");

      const ext = String(prepared?.fileName || "avatar.jpg").split(".").pop() || "jpg";
      const filePath = `avatars/${session.user.id}_${Date.now()}.${ext}`;
      const response = await fetch(uri);
      const body = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, body, {
          contentType: prepared?.mimeType || `image/${ext}`,
          upsert: false,
          cacheControl: "3600",
        });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
      const avatarUrl = data?.publicUrl || "";
      if (!avatarUrl) throw new Error("Не удалось получить URL аватара");

      const { error: updError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
        },
      });
      if (updError) throw updError;

      return { ok: true, avatarUrl };
    } catch (cause) {
      setError(cause?.message || "Не удалось обновить аватар");
      throw cause;
    } finally {
      setAuthBusy(false);
    }
  }, [session?.user?.id]);

  const signOut = useCallback(async () => {
    setAuthBusy(true);
    setError("");

    try {
      const { error: outError } = await supabase.auth.signOut();
      if (outError) throw outError;
      return { ok: true };
    } catch (cause) {
      setError(cause?.message || "Ошибка выхода");
      throw cause;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  return {
    session,
    user,
    isAdmin,
    loading,
    authBusy,
    error,
    appleAvailable,
    redirectTo,
    debugRedirectUrl: redirectTo,
    lastOAuthRedirectTo: redirectTo,
    lastCallbackUrl,
    signInWithGoogle,
    signInWithApple,
    signInWithPassword,
    updateDisplayName,
    updateAvatar,
    signOut,
  };
}
