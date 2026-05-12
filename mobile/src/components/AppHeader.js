import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("");
    if (initials) return initials.toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "U";
}

export default function AppHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : "Профиль";

  return (
    <View style={styles.headerWrap}>
      <View>
        <Text style={styles.logoLA}>LA</Text>
        <Text style={styles.logoSub}>путеводитель</Text>
      </View>

      {!user ? (
        <Pressable onPress={() => router.push("/login")} style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Войти</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push("/profile")} style={styles.profilePill}>
          <View style={styles.avatarDot}>
            <Text style={styles.avatarDotText}>{getInitials(user?.name, user?.email)}</Text>
          </View>
          <Text style={styles.profileText} numberOfLines={1}>
            {firstName}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoLA: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -1,
    color: "#FF8A3D",
  },
  logoSub: {
    marginTop: 2,
    fontSize: 11,
    color: "#8A8680",
    fontWeight: "500",
  },
  loginBtn: {
    minHeight: 38,
    minWidth: 86,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0E0E0E",
  },
  profilePill: {
    maxWidth: 170,
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    flexDirection: "row",
    gap: 8,
  },
  avatarDot: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#0E0E0E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarDotText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  profileText: {
    color: "#0E0E0E",
    fontSize: 13,
    fontWeight: "700",
    maxWidth: 110,
  },
});
