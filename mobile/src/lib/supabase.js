import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env vars are missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
}

const fallbackUrl = "https://placeholder.supabase.co";
const fallbackAnonKey = "placeholder-anon-key";
const validUrl =
  typeof supabaseUrl === "string" && /^https?:\/\/.+/i.test(supabaseUrl)
    ? supabaseUrl
    : fallbackUrl;
export const isSupabaseConfigured = Boolean(
  supabaseAnonKey &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.trim() &&
    validUrl !== fallbackUrl
);

export const supabase = createClient(validUrl, supabaseAnonKey || fallbackAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
});
