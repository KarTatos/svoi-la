import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileActions({ user, authBusy, onLogin, onLogout, onOpenMyPlaces }) {
  if (!user) {
    return (
      <View style={styles.card}>
        <Text style={styles.loginTitle}>Вход в аккаунт</Text>
        <Text style={styles.muted}>Войдите, чтобы видеть свои места и активность.</Text>
        <Pressable onPress={onLogin} style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Войти</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Pressable onPress={onOpenMyPlaces} style={styles.rowBtn}>
        <Text style={styles.rowTitle}>Мои места</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable onPress={onLogout} disabled={authBusy} style={[styles.logoutBtn, authBusy && styles.disabled]}>
        <Text style={styles.logoutBtnText}>{authBusy ? "Выходим..." : "Выйти"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 14,
    gap: 12,
  },
  loginTitle: { color: "#0E0E0E", fontSize: 20, fontWeight: "800" },
  muted: { color: "#6B6B6B", fontSize: 14 },
  loginBtn: {
    marginTop: 4,
    backgroundColor: "#F47B20",
    borderRadius: 12,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  rowBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowTitle: { color: "#0E0E0E", fontSize: 15, fontWeight: "700" },
  chevron: { color: "#8A8680", fontSize: 22, lineHeight: 24 },
  divider: { height: 1, backgroundColor: "#F1EEE7" },
  logoutBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.6 },
});
