import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { getUscisPdfUrl, USCIS_CATS } from "../../src/config/uscis";
import { useUscisNews } from "../../src/hooks/useUscisNews";

export default function UscisScreen() {
  const [search, setSearch] = useState("");
  const [newsExpanded, setNewsExpanded] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const { news, loading } = useUscisNews();

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    const out = [];
    USCIS_CATS.forEach((cat) => {
      cat.docs.forEach((doc) => {
        const hay = `${doc.form} ${doc.nameEn} ${doc.name} ${doc.desc} ${doc.detail}`.toLowerCase();
        if (hay.includes(q)) out.push({ ...doc, category: cat.title, categoryId: cat.id });
      });
    });
    return out;
  }, [search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Справочник USCIS</Text>

        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            Важно: информация в этом разделе ознакомительная. Проверяйте актуальные требования на официальном сайте USCIS.
          </Text>
        </View>

        <View style={styles.newsCard}>
          <Pressable style={styles.newsHeader} onPress={() => setNewsExpanded((v) => !v)}>
            <View style={styles.newsHeaderLeft}>
              <Text style={styles.newsTitle}>📰 Новости USCIS</Text>
              {!loading && news.length > 0 && (
                <View style={styles.newsBadge}>
                  <Text style={styles.newsBadgeText}>{news.length}</Text>
                </View>
              )}
            </View>
            <Text style={styles.newsChevron}>{newsExpanded ? "▴" : "▾"}</Text>
          </Pressable>

          {newsExpanded && (
            loading ? (
              <Text style={styles.newsHint}>Загрузка...</Text>
            ) : news.length === 0 ? (
              <Text style={styles.newsHint}>Нет актуальных изменений.</Text>
            ) : (
              news.map((item) => (
                <Pressable key={item.id} style={styles.newsItem} onPress={() => WebBrowser.openBrowserAsync(item.url)}>
                  {item.tag && item.tag !== "Общее" && (
                    <View style={styles.newsTag}>
                      <Text style={styles.newsTagText}>{item.tag}</Text>
                    </View>
                  )}
                  <Text style={styles.newsItemText}>{item.title_ru}</Text>
                  {item.summary_ru ? (
                    <Text style={styles.newsItemSummary} numberOfLines={2}>{item.summary_ru}</Text>
                  ) : null}
                </Pressable>
              ))
            )
          )}
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск формы..."
          style={styles.searchInput}
        />

        {search.trim().length >= 2 ? (
          <View style={styles.searchResults}>
            {results.length === 0 ? <Text style={styles.empty}>Не найдено</Text> : results.map((item, idx) => (
              <View key={`${item.form}-${idx}`} style={styles.resultCard}>
                <Text style={styles.formBadge}>{item.form}</Text>
                <Text style={styles.resultTitle}>{item.nameEn || item.name}</Text>
                {item.nameEn ? <Text style={styles.resultTitleRu}>{item.name}</Text> : null}
                <Text style={styles.resultDesc}>{item.desc}</Text>
                <View style={styles.resultActions}>
                  {item.url ? (
                    <Pressable
                      style={styles.btnPrimary}
                      onPress={() => WebBrowser.openBrowserAsync(item.url)}
                    >
                      <Text style={styles.btnPrimaryText}>Открыть USCIS</Text>
                    </Pressable>
                  ) : null}
                  {getUscisPdfUrl(item) ? (
                    <Pressable
                      style={styles.btnGhost}
                      onPress={() => WebBrowser.openBrowserAsync(getUscisPdfUrl(item))}
                    >
                      <Text style={styles.btnGhostText}>📄 PDF</Text>
                    </Pressable>
                  ) : null}
                  <Link href={`/uscis/${item.categoryId}`} asChild>
                    <Pressable style={styles.btnGhost}>
                      <Text style={styles.btnGhostText}>Категория →</Text>
                    </Pressable>
                  </Link>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {USCIS_CATS.map((cat) => (
              <Link key={cat.id} href={`/uscis/${cat.id}`} asChild>
                <Pressable style={styles.catCard}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catTitle}>{cat.title}</Text>
                    <Text style={styles.catSub}>{cat.subtitle}</Text>
                  </View>
                  <Text style={styles.chev}>›</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        )}

        <View style={styles.caseCard}>
          <Text style={styles.caseTitle}>🔍 Проверить статус кейса</Text>
          <Text style={styles.caseHint}>Введите номер кейса USCIS (например: IOE0123456789)</Text>
          <TextInput
            value={caseNumber}
            onChangeText={(v) => setCaseNumber(v.toUpperCase())}
            placeholder="IOE0123456789"
            placeholderTextColor="#C4BFBA"
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.caseInput}
          />
          <Pressable
            style={[styles.caseBtn, !caseNumber.trim() && styles.caseBtnDisabled]}
            onPress={() => WebBrowser.openBrowserAsync("https://egov.uscis.gov/casestatus/mycasestatus.do")}
            disabled={!caseNumber.trim()}
          >
            <Text style={styles.caseBtnText}>Открыть на сайте USCIS →</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
  content: { padding: 16, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: "800", color: "#0E0E0E", marginBottom: 10 },
  noteCard: { backgroundColor: "#FFF8F1", borderColor: "#FDE2C7", borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12 },
  noteText: { fontSize: 12, color: "#6B6B6B", lineHeight: 18 },
  newsCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#F0F0F0" },
  newsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  newsHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  newsTitle: { fontSize: 14, fontWeight: "700", color: "#0E0E0E" },
  newsChevron: { fontSize: 11, color: "#8A8680" },
  newsBadge: { backgroundColor: "#F47B20", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  newsBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  newsHint: { fontSize: 12, color: "#8A8680", marginTop: 10 },
  newsItem: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#F0F0F0", marginTop: 4 },
  newsTag: { alignSelf: "flex-start", backgroundColor: "#F0F7FF", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginBottom: 5 },
  newsTagText: { fontSize: 11, color: "#3B5FFF", fontWeight: "700" },
  newsItemText: { fontSize: 13, color: "#0E0E0E", fontWeight: "600", lineHeight: 18 },
  newsItemSummary: { fontSize: 12, color: "#8A8680", marginTop: 3, lineHeight: 17 },
  searchInput: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#E5E5E5", paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  list: { gap: 8 },
  catCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  catIcon: { fontSize: 24 },
  catTitle: { fontSize: 15, fontWeight: "700", color: "#0E0E0E" },
  catSub: { marginTop: 2, fontSize: 12, color: "#8A8680" },
  chev: { color: "#8A8680", fontSize: 18, fontWeight: "600" },
  searchResults: { gap: 8 },
  resultCard: { backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#F0F0F0", padding: 12 },
  formBadge: { alignSelf: "flex-start", backgroundColor: "#FFF3E8", color: "#F47B20", fontWeight: "700", fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  resultTitle: { fontSize: 14, fontWeight: "700", color: "#0E0E0E" },
  resultTitleRu: { fontSize: 12, color: "#8A8680", marginTop: 2 },
  resultDesc: { fontSize: 12, color: "#8A8680", marginTop: 4 },
  resultActions: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btnPrimary: { backgroundColor: "#F47B20", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  btnGhost: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E5E5", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  btnGhostText: { color: "#6B6B6B", fontWeight: "700", fontSize: 12 },
  empty: { fontSize: 13, color: "#8A8680" },
  caseCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", padding: 14, marginTop: 16 },
  caseTitle: { fontSize: 14, fontWeight: "700", color: "#0E0E0E", marginBottom: 6 },
  caseHint: { fontSize: 12, color: "#8A8680", marginBottom: 10, lineHeight: 17 },
  caseInput: { backgroundColor: "#F7F4EE", borderRadius: 12, borderWidth: 1, borderColor: "#E5E5E5", paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, fontWeight: "700", color: "#0E0E0E", letterSpacing: 1, marginBottom: 10 },
  caseBtn: { backgroundColor: "#F47B20", borderRadius: 12, paddingVertical: 11, alignItems: "center" },
  caseBtnDisabled: { opacity: 0.4 },
  caseBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});
