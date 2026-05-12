import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  MapPin,
  Plus,
  Search,
  CalendarDays,
  Users,
  Music,
  BookOpen,
  Trophy,
  Utensils,
  Palette,
  Briefcase,
  TreePine,
} from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useEventsQuery } from "../../src/hooks/useEventsQuery";

const ACCENT = "#F47B20";

const CATEGORIES = [
  { id: "all",        label: "Все события",  Icon: CalendarDays },
  { id: "community",  label: "Сообщество",   Icon: Users       },
  { id: "music",      label: "Музыка",       Icon: Music       },
  { id: "education",  label: "Обучение",     Icon: BookOpen    },
  { id: "sport",      label: "Спорт",        Icon: Trophy      },
  { id: "food",       label: "Еда",          Icon: Utensils    },
  { id: "culture",    label: "Культура",     Icon: Palette     },
  { id: "networking", label: "Нетворкинг",   Icon: Briefcase   },
  { id: "outdoor",    label: "На природе",   Icon: TreePine    },
];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

// Large featured card (first in list)
function FeaturedCard({ event, onPress }) {
  const dateDay = event.date ? new Date(event.date).getDate() : "";
  const dateMon = event.date
    ? new Date(event.date).toLocaleDateString("ru-RU", { month: "short" })
    : "";

  return (
    <Pressable style={styles.featCard} onPress={onPress}>
      {event.cover_url ? (
        <Image source={{ uri: event.cover_url }} style={styles.featImg} resizeMode="cover" />
      ) : (
        <View style={[styles.featImg, styles.featPlaceholder]}>
          <Text style={{ fontSize: 52 }}>🎉</Text>
        </View>
      )}

      {/* Dark overlay */}
      <View style={styles.featOverlay} />

      {/* Date badge */}
      <View style={styles.dateBadge}>
        <Text style={styles.dateBadgeMon}>{dateMon}</Text>
        <Text style={styles.dateBadgeDay}>{dateDay}</Text>
      </View>

      {/* Info below image */}
      <View style={styles.featBody}>
        <Text style={styles.featTitle} numberOfLines={2}>{event.title}</Text>
        <View style={styles.featMeta}>
          {event.location ? (
            <View style={styles.metaRow}>
              <MapPin size={12} color="#6B7280" strokeWidth={2} />
              <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
            </View>
          ) : null}
          <View style={styles.metaRow}>
            <Calendar size={12} color="#6B7280" strokeWidth={2} />
            <Text style={styles.metaText}>{formatDate(event.date)} · {formatTime(event.date)}</Text>
          </View>
        </View>
        {event.price ? (
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{event.price}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

// Compact row card (rest of the list)
function CompactCard({ event, onPress }) {
  return (
    <Pressable style={styles.compactCard} onPress={onPress}>
      {event.cover_url ? (
        <Image source={{ uri: event.cover_url }} style={styles.compactImg} resizeMode="cover" />
      ) : (
        <View style={[styles.compactImg, styles.compactPlaceholder]}>
          <Text style={{ fontSize: 24 }}>🎉</Text>
        </View>
      )}
      <View style={styles.compactBody}>
        <Text style={styles.compactTitle} numberOfLines={2}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Calendar size={11} color="#9CA3AF" strokeWidth={2} />
          <Text style={styles.compactMeta}>{formatDate(event.date)} · {formatTime(event.date)}</Text>
        </View>
        {event.location ? (
          <View style={styles.metaRow}>
            <MapPin size={11} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.compactMeta} numberOfLines={1}>{event.location}</Text>
          </View>
        ) : null}
      </View>
      {event.price ? (
        <View style={styles.compactPrice}>
          <Text style={styles.compactPriceTxt}>{event.price}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function EventsMainScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: events = [], isLoading, refetch } = useEventsQuery();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [gridOpen, setGridOpen] = useState(false);
  const gridAnim = useRef(new Animated.Value(0)).current;

  const toggleGrid = useCallback(() => {
    const toValue = gridOpen ? 0 : 1;
    setGridOpen(!gridOpen);
    Animated.timing(gridAnim, {
      toValue,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [gridOpen, gridAnim]);

  const gridHeight = gridAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.ceil(CATEGORIES.length / 3) * 90 + 16],
  });

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return events
      .filter(e => {
        const d = new Date(e.date);
        const matchDate = d >= now && d <= twoWeeks;
        const matchCat = activeCategory === "all" || e.category === activeCategory;
        return matchDate && matchCat;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, activeCategory]);

  const searchResults = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return events
      .filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 20);
  }, [events, search]);

  const displayEvents = search.trim() ? searchResults : upcomingEvents;

  const handleCategoryPress = useCallback((catId) => {
    setActiveCategory(catId);
  }, []);

  const renderEvent = useCallback(({ item: event, index }) => {
    if (index === 0 && !search.trim()) {
      return <FeaturedCard event={event} onPress={() => router.push(`/events/${event.id}`)} />;
    }
    return <CompactCard event={event} onPress={() => router.push(`/events/${event.id}`)} />;
  }, [router, search]);

  const ListHeader = useMemo(() => (
    <View>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Search size={16} color="#9CA3AF" strokeWidth={2} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск событий..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Категории</Text>
        <Pressable onPress={toggleGrid}>
          <Text style={styles.seeAll}>{gridOpen ? "Свернуть ↑" : "Все категории ↓"}</Text>
        </Pressable>
      </View>

      {/* Horizontal strip — всегда видна */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catContent}
        style={styles.catStrip}
      >
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={[styles.catChip, active && styles.catChipActive]}
              onPress={() => handleCategoryPress(cat.id)}
            >
              <cat.Icon size={15} color={active ? "#fff" : "#374151"} strokeWidth={1.8} />
              <Text style={[styles.catLabel, active && styles.catLabelActive]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Раскрывающаяся сетка */}
      <Animated.View style={[styles.catGrid, { height: gridHeight, overflow: "hidden" }]}>
        <View style={styles.catGridInner}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[styles.catGridItem, active && styles.catGridItemActive]}
                onPress={() => { handleCategoryPress(cat.id); toggleGrid(); }}
              >
                <cat.Icon size={22} color={active ? "#fff" : "#374151"} strokeWidth={1.5} />
                <Text style={[styles.catGridLabel, active && styles.catGridLabelActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Upcoming section label */}
      {!search.trim() && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Ближайшие 2 недели</Text>
          <Text style={styles.sectionCount}>{upcomingEvents.length} событий</Text>
        </View>
      )}

      {search.trim() ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Результаты поиска</Text>
          <Text style={styles.sectionCount}>{searchResults.length}</Text>
        </View>
      ) : null}
    </View>
  ), [search, activeCategory, upcomingEvents.length, searchResults.length, handleCategoryPress, router]);

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>События</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            if (!user) { router.push("/login"); return; }
            router.push("/events/add");
          }}
        >
          <Plus size={20} color="#fff" strokeWidth={2.5} />
        </Pressable>
      </View>

      <FlatList
        data={displayEvents}
        keyExtractor={e => String(e.id)}
        renderItem={renderEvent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isLoading}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>{search.trim() ? "🔍" : "📅"}</Text>
            <Text style={styles.emptyTitle}>
              {search.trim() ? "Ничего не найдено" : "Нет ближайших событий"}
            </Text>
            <Text style={styles.emptySub}>
              {search.trim()
                ? "Попробуй другой запрос"
                : "Загляни в полный календарь"}
            </Text>
            {!search.trim() && (
              <Pressable style={styles.calBtn} onPress={() => router.push("/events/calendar")}>
                <Text style={styles.calBtnText}>Открыть календарь</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0EDE8" },

  // Header
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

  // Search
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: "#fff", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: "#EBEBEB",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#111827", padding: 0 },

  // Section headers
  sectionHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  sectionLabel: { fontSize: 17, fontWeight: "800", color: "#111827" },
  sectionCount: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  seeAll: { fontSize: 13, color: ACCENT, fontWeight: "700" },

  // Categories
  catStrip: { flexGrow: 0, marginBottom: 20 },
  catContent: { paddingHorizontal: 16, gap: 8 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 13, paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  catChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  catLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  catLabelActive: { color: "#fff" },

  // Featured card
  featCard: {
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: "#fff", borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  featImg: { width: "100%", height: 200 },
  featOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, height: 200,
  },
  featPlaceholder: { backgroundColor: "#F3F0EA", alignItems: "center", justifyContent: "center" },
  dateBadge: {
    position: "absolute", top: 14, left: 14,
    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6, alignItems: "center",
  },
  dateBadgeMon: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.8)", textTransform: "uppercase" },
  dateBadgeDay: { fontSize: 20, fontWeight: "900", color: "#fff", lineHeight: 22 },
  featBody: { padding: 16 },
  featTitle: { fontSize: 18, fontWeight: "800", color: "#111827", lineHeight: 24, marginBottom: 8 },
  featMeta: { gap: 5, marginBottom: 10 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, color: "#6B7280", fontWeight: "500", flex: 1 },
  priceBadge: {
    alignSelf: "flex-start", backgroundColor: "#FFF3E8",
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: "#FDE3C8",
  },
  priceText: { fontSize: 13, fontWeight: "800", color: ACCENT },

  // Compact card
  compactCard: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: "#fff", borderRadius: 16,
    flexDirection: "row", alignItems: "center",
    padding: 12,
    borderWidth: 1, borderColor: "#F0EDE8",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  compactImg: { width: 72, height: 72, borderRadius: 12, marginRight: 12, flexShrink: 0 },
  compactPlaceholder: { backgroundColor: "#F3F0EA", alignItems: "center", justifyContent: "center" },
  compactBody: { flex: 1, gap: 4 },
  compactTitle: { fontSize: 14, fontWeight: "700", color: "#111827", lineHeight: 19 },
  compactMeta: { fontSize: 11, color: "#9CA3AF", fontWeight: "500", flex: 1 },
  compactPrice: {
    backgroundColor: "#F3F0EA", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8,
  },
  compactPriceTxt: { fontSize: 11, fontWeight: "700", color: "#6B7280" },

  // Category grid
  catGrid: { marginHorizontal: 16, marginBottom: 4 },
  catGridInner: {
    flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 8,
  },
  catGridItem: {
    width: "30.5%",
    alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  catGridItemActive: {
    backgroundColor: "#111827", borderColor: "#111827",
  },
  catGridLabel: {
    fontSize: 11, fontWeight: "600", color: "#374151", textAlign: "center",
  },
  catGridLabelActive: { color: "#fff" },

  listContent: { paddingBottom: 120 },

  emptyWrap: { alignItems: "center", paddingTop: 48, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#374151" },
  emptySub: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 20 },
  calBtn: {
    marginTop: 8, backgroundColor: "#111827",
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11,
  },
  calBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
