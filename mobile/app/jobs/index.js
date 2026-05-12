import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";

const ACCENT = "#F47B20";

export default function JobsLandingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Работа и услуги</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.subtitle}>Выбери раздел</Text>

        {/* Вакансии */}
        <Pressable
          style={[styles.card, styles.vacancyCard]}
          onPress={() => router.push("/jobs/list?type=vacancy")}
        >
          <Text style={styles.cardIcon}>💼</Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Вакансии</Text>
            <Text style={styles.cardDesc}>Работодатели ищут сотрудников</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* Услуги */}
        <Pressable
          style={[styles.card, styles.serviceCard]}
          onPress={() => router.push("/jobs/list?type=service")}
        >
          <Text style={styles.cardIcon}>🔧</Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Услуги</Text>
            <Text style={styles.cardDesc}>Мастера и специалисты предлагают себя</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* Разместить объявление */}
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            if (!user) { router.push("/login"); return; }
            router.push("/jobs/add");
          }}
        >
          <Text style={styles.addBtnText}>+ Разместить объявление</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAF8" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  body: {
    flex: 1, paddingHorizontal: 16, paddingTop: 12, gap: 14,
  },
  subtitle: {
    fontSize: 14, color: "#9CA3AF", fontWeight: "600",
    marginBottom: 4,
  },

  card: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 20, padding: 20, gap: 16,
    borderWidth: 1.5,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  vacancyCard: { backgroundColor: "#EEF6FF", borderColor: "#BFDBFE" },
  serviceCard: { backgroundColor: "#F0FFF4", borderColor: "#BBF7D0" },

  cardIcon: { fontSize: 40 },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 20, fontWeight: "900", color: "#111827" },
  cardDesc: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  arrow: { fontSize: 28, color: "#9CA3AF" },

  addBtn: {
    marginTop: 8,
    backgroundColor: "#111827", borderRadius: 16,
    paddingVertical: 16, alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
