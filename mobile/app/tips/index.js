import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TIPS_CATS } from "../../src/config/tips";
import { useTipsQuery } from "../../src/hooks/useTipsQuery";

export default function TipsIndexScreen() {
  const router = useRouter();
  const { data: tips = [] } = useTipsQuery();

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Советы</Text>
        <View style={styles.iconBox}>
          <Text style={styles.titleIcon}>💡</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.catList}>
          {TIPS_CATS.map((cat) => {
            const cnt = (tips || []).filter((t) => t.cat === cat.id).length;
            return (
              <Pressable
                key={cat.id}
                onPress={() => router.push(`/tips/${cat.id}`)}
                style={styles.catCard}
              >
                <View style={styles.catIconWrap}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                </View>
                <View style={styles.catBody}>
                  <Text style={styles.catTitle}>{cat.title}</Text>
                  <Text style={styles.catDesc}>{cat.desc}</Text>
                </View>
                <View style={styles.catRight}>
                  {cnt > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeTxt}>{cnt}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.chevron}>›</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFECE6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  title: { flex: 1, fontSize: 22, fontWeight: "800", color: "#111827" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
  },
  titleIcon: { fontSize: 20 },
  content: { padding: 16, paddingBottom: 100 },
  catList: { gap: 10 },
  catCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
  },
  catIcon: { fontSize: 24 },
  catBody: { flex: 1 },
  catTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  catDesc: { fontSize: 12, color: "#6B6B6B", marginTop: 2 },
  catRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    backgroundColor: "#FFF3E8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTxt: { fontSize: 13, fontWeight: "700", color: "#F47B20" },
  chevron: { fontSize: 20, color: "#C4C4C4", lineHeight: 24 },
});
