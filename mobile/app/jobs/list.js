import { useCallback, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Plus, MapPin, Clock, Bookmark } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useJobsQuery } from "../../src/hooks/useJobsQuery";
import { useJobBookmarks } from "../../src/hooks/useJobBookmarks";
import { DISTRICTS } from "../../src/config/places";

const ACCENT = "#F47B20";

const SCHEDULE_LABELS = {
  fulltime: "Полный день",
  parttime: "Частичная",
  remote:   "Удалённо",
  contract: "Контракт",
  oneoff:   "Разовая",
};

function districtName(id) {
  return DISTRICTS.find(d => d.id === id)?.name || id || "";
}

// ─── Карточка вакансии ────────────────────────────────────────────────────────
function VacancyCard({ job, isBookmarked, onBookmark, onPress }) {
  return (
    <Pressable style={styles.vacancyCard} onPress={onPress}>
      {/* Закладка */}
      <Pressable
        style={styles.bookmarkBtn}
        onPress={(e) => { e.stopPropagation(); onBookmark(job.id); }}
        hitSlop={10}
      >
        <Bookmark
          size={18}
          color={isBookmarked ? ACCENT : "#9CA3AF"}
          fill={isBookmarked ? ACCENT : "none"}
          strokeWidth={2}
        />
      </Pressable>

      <Text style={styles.vacancyTitle} numberOfLines={2}>{job.title}</Text>

      {job.description ? (
        <Text style={styles.vacancyDesc} numberOfLines={2}>{job.description}</Text>
      ) : null}

      {/* Мета строка */}
      <View style={styles.metaRow}>
        {job.district ? (
          <View style={styles.metaItem}>
            <MapPin size={11} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>{districtName(job.district)}</Text>
          </View>
        ) : null}
        {job.schedule ? (
          <View style={styles.metaItem}>
            <Clock size={11} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.metaText}>{SCHEDULE_LABELS[job.schedule] || job.schedule}</Text>
          </View>
        ) : null}
        {job.price ? (
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>$ {job.price}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

// ─── Карточка услуги ─────────────────────────────────────────────────────────
function ServiceCard({ job, onPress }) {
  const coverPhoto = Array.isArray(job.photos) ? job.photos[0] : null;
  return (
    <Pressable style={styles.serviceCard} onPress={onPress}>
      {coverPhoto ? (
        <Image source={{ uri: coverPhoto }} style={styles.cardImg} resizeMode="cover" />
      ) : (
        <View style={styles.cardImgPlaceholder}>
          <Text style={styles.placeholderIcon}>🔧</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.serviceTitle} numberOfLines={2}>{job.title}</Text>
        {job.description ? (
          <Text style={styles.serviceDesc} numberOfLines={3}>{job.description}</Text>
        ) : null}
        <View style={styles.metaRow}>
          {job.district ? (
            <View style={styles.metaItem}>
              <MapPin size={11} color="#9CA3AF" strokeWidth={2} />
              <Text style={styles.metaText} numberOfLines={1}>{districtName(job.district)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Экран ────────────────────────────────────────────────────────────────────
export default function JobsListScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  const isVacancy = type === "vacancy";
  const { data: jobs = [], isLoading, refetch } = useJobsQuery(type);
  const { isBookmarked, toggle } = useJobBookmarks();

  const filtered = useMemo(() => {
    let list = jobs;
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
      );
    }
    if (onlyBookmarked) {
      list = list.filter(j => isBookmarked(j.id));
    }
    return list;
  }, [jobs, search, onlyBookmarked, isBookmarked]);

  const renderJob = useCallback(({ item }) => {
    if (item.type === "vacancy") {
      return (
        <VacancyCard
          job={item}
          isBookmarked={isBookmarked(item.id)}
          onBookmark={toggle}
          onPress={() => router.push(`/jobs/${item.id}`)}
        />
      );
    }
    return <ServiceCard job={item} onPress={() => router.push(`/jobs/${item.id}`)} />;
  }, [router, isBookmarked, toggle]);

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{isVacancy ? "Вакансии" : "Услуги"}</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            if (!user) { router.push("/login"); return; }
            router.push("/jobs/add");
          }}
        >
          <Plus size={20} color="#fff" strokeWidth={2.5} />
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={j => String(j.id)}
        renderItem={renderJob}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading}
        ListHeaderComponent={
          <View style={styles.searchRow}>
            <View style={styles.searchWrap}>
              <Search size={16} color="#9CA3AF" strokeWidth={2} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={isVacancy ? "Поиск вакансий..." : "Поиск услуг..."}
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
            {/* Фильтр по закладкам — только для вакансий */}
            {isVacancy && (
              <Pressable
                style={[styles.filterBtn, onlyBookmarked && styles.filterBtnActive]}
                onPress={() => setOnlyBookmarked(v => !v)}
              >
                <Bookmark
                  size={18}
                  color={onlyBookmarked ? "#fff" : "#6B7280"}
                  fill={onlyBookmarked ? "#fff" : "none"}
                  strokeWidth={2}
                />
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={ACCENT} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>{isVacancy ? "💼" : "🔧"}</Text>
              <Text style={styles.emptyTitle}>
                {onlyBookmarked ? "Нет сохранённых" : search ? "Ничего не найдено" : "Пока нет объявлений"}
              </Text>
              <Text style={styles.emptySub}>
                {onlyBookmarked ? "Нажми на закладку в карточке" : search ? "Попробуй другой запрос" : "Будь первым — добавь своё"}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0EDE8" },

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
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
    shadowColor: ACCENT, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  // Search + filter row
  searchRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, marginBottom: 16, gap: 10,
  },
  searchWrap: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: "#EBEBEB",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#111827", padding: 0 },
  filterBtn: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: "#111827", borderColor: "#111827",
  },

  // Vacancy card
  vacancyCard: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: "#fff", borderRadius: 16,
    padding: 16, paddingRight: 48,
    borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bookmarkBtn: {
    position: "absolute", top: 14, right: 14,
    padding: 4,
  },
  vacancyTitle: { fontSize: 16, fontWeight: "700", color: "#111827", lineHeight: 21, marginBottom: 4 },
  vacancyDesc: { fontSize: 13, color: "#6B7280", lineHeight: 18, marginBottom: 10 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#9CA3AF", fontWeight: "500" },
  priceBadge: {
    backgroundColor: "#DCFCE7", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  priceText: { fontSize: 12, fontWeight: "700", color: "#16A34A" },

  // Service card
  serviceCard: {
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: 20, overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardImg: { width: "100%", height: 190 },
  cardImgPlaceholder: {
    width: "100%", height: 190,
    backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center",
  },
  placeholderIcon: { fontSize: 52 },
  cardInfo: {
    backgroundColor: "#1C1C1E",
    paddingHorizontal: 16, paddingVertical: 14, gap: 6,
  },
  serviceTitle: { fontSize: 16, fontWeight: "700", color: "#fff", lineHeight: 21 },
  serviceDesc: { fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 19 },

  listContent: { paddingBottom: 120 },

  emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#374151" },
  emptySub: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 20 },
});
