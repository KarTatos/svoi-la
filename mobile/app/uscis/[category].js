import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { getUscisPdfUrl, USCIS_CATS } from "../../src/config/uscis";

export default function UscisCategoryScreen() {
  const { category } = useLocalSearchParams();
  const [expandedId, setExpandedId] = useState(null);
  const cat = USCIS_CATS.find((c) => c.id === String(category));

  if (!cat) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}><Text style={styles.empty}>Категория не найдена.</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Link href="/uscis" asChild>
          <Pressable><Text style={styles.back}>← Справочник</Text></Pressable>
        </Link>

        <View style={styles.titleRow}>
          <Text style={styles.icon}>{cat.icon}</Text>
          <Text style={styles.title}>{cat.title}</Text>
        </View>

        <View style={styles.list}>
          {cat.docs.map((doc, i) => {
            const key = `${cat.id}-${doc.form}-${i}`;
            const isOpen = expandedId === key;
            const pdfUrl = getUscisPdfUrl(doc);

            return (
              <Pressable
                key={key}
                style={[styles.card, isOpen && styles.cardOpen]}
                onPress={() => setExpandedId(isOpen ? null : key)}
              >
                {/* ── Header ── */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeRow}>
                      <Text style={styles.formBadge}>{doc.form}</Text>
                    </View>
                    <Text style={styles.name}>{doc.nameEn || doc.name}</Text>
                    {doc.nameEn ? <Text style={styles.nameRu}>{doc.name}</Text> : null}
                    <Text style={styles.desc}>{doc.desc}</Text>
                  </View>
                  <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>›</Text>
                </View>

                {/* ── Fee + Time always visible ── */}
                {(doc.fee || doc.time) ? (
                  <View style={styles.metaRow}>
                    {doc.fee ? (
                      <View style={styles.metaBadge}>
                        <Text style={styles.metaIcon}>💰</Text>
                        <Text style={styles.metaText}>{doc.fee}</Text>
                      </View>
                    ) : null}
                    {doc.time ? (
                      <View style={[styles.metaBadge, styles.metaBadgeBlue]}>
                        <Text style={styles.metaIcon}>⏱</Text>
                        <Text style={[styles.metaText, styles.metaTextBlue]}>{doc.time}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* ── Expanded: tips + actions ── */}
                {isOpen ? (
                  <View style={styles.expanded}>
                    {doc.tips && doc.tips.length > 0 ? (
                      <View style={styles.tipsBlock}>
                        <Text style={styles.tipsLabel}>💡 Важно знать</Text>
                        {doc.tips.map((tip, ti) => (
                          <View key={ti} style={styles.tipRow}>
                            <Text style={styles.tipDot}>•</Text>
                            <Text style={styles.tipText}>{tip}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    <View style={styles.actions}>
                      {doc.url && !doc.isTest ? (
                        <Pressable
                          style={styles.btnPrimary}
                          onPress={(e) => { e.stopPropagation(); WebBrowser.openBrowserAsync(doc.url); }}
                        >
                          <Text style={styles.btnPrimaryText}>Открыть USCIS →</Text>
                        </Pressable>
                      ) : null}
                      {pdfUrl ? (
                        <Pressable
                          style={styles.btnGhost}
                          onPress={(e) => { e.stopPropagation(); WebBrowser.openBrowserAsync(pdfUrl); }}
                        >
                          <Text style={styles.btnGhostText}>📄 Скачать форму</Text>
                        </Pressable>
                      ) : null}
                      {doc.isTest ? (
                        <Link href="/uscis/civics" asChild>
                          <Pressable
                            style={styles.btnPrimary}
                            onPress={(e) => e.stopPropagation()}
                          >
                            <Text style={styles.btnPrimaryText}>🎓 Пройти тест</Text>
                          </Pressable>
                        </Link>
                      ) : null}
                    </View>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
  content: { padding: 16, paddingBottom: 120 },
  back: { fontSize: 13, color: "#6B6B6B", marginBottom: 10, fontWeight: "600" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  icon: { fontSize: 28 },
  title: { fontSize: 24, fontWeight: "800", color: "#0E0E0E" },
  list: { gap: 10 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 14,
  },
  cardOpen: {
    borderColor: "#F47B20",
    shadowColor: "#F47B20",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  badgeRow: { flexDirection: "row", marginBottom: 6 },
  formBadge: {
    backgroundColor: "#FFF3E8",
    color: "#F47B20",
    fontWeight: "700",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  name: { fontSize: 14, fontWeight: "700", color: "#0E0E0E", lineHeight: 20 },
  nameRu: { marginTop: 2, fontSize: 12, color: "#8A8680" },
  desc: { marginTop: 4, fontSize: 12, color: "#8A8680", lineHeight: 17 },
  chevron: {
    color: "#C4BFBA",
    fontSize: 22,
    fontWeight: "600",
    marginTop: 2,
    transform: [{ rotate: "0deg" }],
  },
  chevronOpen: { color: "#F47B20", transform: [{ rotate: "90deg" }] },

  // Fee / Time row — always visible
  metaRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF8F1",
    borderWidth: 1,
    borderColor: "#FDE2C7",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaBadgeBlue: {
    backgroundColor: "#F0F6FF",
    borderColor: "#C7DFFE",
  },
  metaIcon: { fontSize: 12 },
  metaText: { fontSize: 13, fontWeight: "700", color: "#B85C10" },
  metaTextBlue: { color: "#2B5FC7" },

  // Expanded section
  expanded: { marginTop: 14 },

  tipsBlock: {
    backgroundColor: "#F7F4EE",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 6,
  },
  tipsLabel: { fontSize: 11, fontWeight: "700", color: "#8A8680", letterSpacing: 0.3, marginBottom: 4 },
  tipRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  tipDot: { fontSize: 14, color: "#F47B20", lineHeight: 20, marginTop: -1 },
  tipText: { flex: 1, fontSize: 13, color: "#3D3D3D", lineHeight: 19 },

  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btnPrimary: {
    backgroundColor: "#F47B20",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  btnGhost: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  btnGhostText: { color: "#6B6B6B", fontWeight: "700", fontSize: 13 },

  empty: { fontSize: 14, color: "#8A8680" },
});
