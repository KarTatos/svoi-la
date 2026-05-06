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
                style={styles.card}
                onPress={() => setExpandedId(isOpen ? null : key)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.formBadge}>{doc.form}</Text>
                    <Text style={styles.name}>{doc.nameEn || doc.name}</Text>
                    {doc.nameEn ? <Text style={styles.nameRu}>{doc.name}</Text> : null}
                    <Text style={styles.desc}>{doc.desc}</Text>
                  </View>
                  <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>›</Text>
                </View>

                {isOpen ? (
                  <View style={styles.expanded}>
                    {doc.detail ? <Text style={styles.detail}>{doc.detail}</Text> : null}
                    <View style={styles.actions}>
                      {doc.url ? (
                        <Pressable
                          style={styles.btnPrimary}
                          onPress={(e) => { e.stopPropagation(); WebBrowser.openBrowserAsync(doc.url); }}
                        >
                          <Text style={styles.btnPrimaryText}>Открыть USCIS</Text>
                        </Pressable>
                      ) : null}
                      {pdfUrl ? (
                        <Pressable
                          style={styles.btnGhost}
                          onPress={(e) => { e.stopPropagation(); WebBrowser.openBrowserAsync(pdfUrl); }}
                        >
                          <Text style={styles.btnGhostText}>📄 PDF</Text>
                        </Pressable>
                      ) : null}
                      {doc.isTest ? (
                        <Link href="/uscis/civics" asChild>
                          <Pressable
                            style={styles.btnPrimary}
                            onPress={(e) => e.stopPropagation()}
                          >
                            <Text style={styles.btnPrimaryText}>Start Civics Test</Text>
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
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", padding: 14 },
  formBadge: { alignSelf: "flex-start", backgroundColor: "#FFF3E8", color: "#F47B20", fontWeight: "700", fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: "700", color: "#0E0E0E" },
  nameRu: { marginTop: 2, fontSize: 12, color: "#8A8680" },
  desc: { marginTop: 4, fontSize: 12, color: "#8A8680" },
  detail: { marginTop: 10, fontSize: 12, color: "#6B6B6B", lineHeight: 18, backgroundColor: "#F7F4EE", borderRadius: 10, padding: 10 },
  actions: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btnPrimary: { backgroundColor: "#F47B20", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  btnGhost: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E5E5", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  btnGhostText: { color: "#6B6B6B", fontWeight: "700", fontSize: 12 },
  empty: { fontSize: 14, color: "#8A8680" },
});

