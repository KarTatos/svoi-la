import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../src/hooks/useAuth";

const PASSWORD_LOGIN_ENABLED = process.env.EXPO_PUBLIC_ENABLE_PASSWORD_LOGIN === "1";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    authBusy,
    error,
    appleAvailable,
    debugRedirectUrl,
    lastCallbackUrl,
    lastOAuthRedirectTo,
    signInWithGoogle,
    signInWithApple,
    signInWithPassword,
  } = useAuth();

  const handleGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res?.ok) router.replace("/profile");
    } catch {
      // error shown from hook
    }
  };

  const handleApple = async () => {
    try {
      const res = await signInWithApple();
      if (res?.ok) router.replace("/profile");
    } catch {
      // error shown from hook
    }
  };

  const handlePassword = async () => {
    try {
      const res = await signInWithPassword(email, password);
      if (res?.ok) router.replace("/profile");
    } catch {
      // error shown from hook
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Назад</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Войти</Text>
        <Text style={styles.subtitle}>Выберите способ входа в аккаунт</Text>

        <View style={styles.card}>
          {appleAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleBtn}
              onPress={handleApple}
            />
          ) : null}

          <Pressable
            onPress={handleGoogle}
            disabled={authBusy}
            style={[styles.googleBtn, authBusy && styles.disabledBtn]}
          >
            <Text style={styles.googleBtnText}>
              {authBusy ? "Подождите..." : "Continue with Google"}
            </Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        {PASSWORD_LOGIN_ENABLED ? (
          <View style={styles.passwordCard}>
            <Text style={styles.tempTitle}>Временный вход</Text>
            <Text style={styles.tempText}>Только для разработки. Позже уберём или спрячем.</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Пароль"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType="password"
              style={styles.input}
            />
            <Pressable
              onPress={handlePassword}
              disabled={authBusy}
              style={[styles.passwordBtn, authBusy && styles.disabledBtn]}
            >
              <Text style={styles.passwordBtnText}>{authBusy ? "Входим..." : "Войти по email"}</Text>
            </Pressable>
          </View>
        ) : null}

        {__DEV__ ? (
          <View style={styles.debugBox}>
            <Text style={styles.debugText}>Redirect: {debugRedirectUrl}</Text>
            {lastOAuthRedirectTo ? (
              <Text style={styles.debugText}>OAuth redirect_to: {lastOAuthRedirectTo}</Text>
            ) : null}
            {lastCallbackUrl ? (
              <Text style={styles.debugText}>Callback: {lastCallbackUrl}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
  container: { flex: 1, padding: 16, paddingBottom: 110 },
  topRow: { flexDirection: "row", justifyContent: "flex-start" },
  backBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtnText: { color: "#111827", fontSize: 13, fontWeight: "700" },
  title: { marginTop: 12, fontSize: 34, fontWeight: "800", color: "#0E0E0E" },
  subtitle: { marginTop: 6, fontSize: 15, color: "#6B6B6B" },
  card: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 14,
    gap: 10,
  },
  appleBtn: { width: "100%", height: 48 },
  googleBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  googleBtnText: { color: "#0E0E0E", fontSize: 15, fontWeight: "700" },
  error: { fontSize: 13, color: "#B91C1C" },
  passwordCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 14,
    gap: 10,
  },
  tempTitle: { color: "#0E0E0E", fontSize: 16, fontWeight: "800" },
  tempText: { color: "#8A8680", fontSize: 13, lineHeight: 18 },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    backgroundColor: "#FFFFFF",
    color: "#0E0E0E",
    fontSize: 15,
    paddingHorizontal: 12,
  },
  passwordBtn: {
    backgroundColor: "#0E0E0E",
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  debugBox: { marginTop: 14, gap: 6 },
  debugText: { fontSize: 11, color: "#9CA3AF" },
  disabledBtn: { opacity: 0.6 },
});
