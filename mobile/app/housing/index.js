import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useHousingFavorites } from "../../src/hooks/useHousingFavorites";
import { useHousingQuery } from "../../src/hooks/useHousingQuery";
import { isSupabaseConfigured } from "../../src/lib/supabase";
import HousingCard from "../../src/components/housing/HousingCard";

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "studio", label: "Studio" },
  { id: "1bd", label: "1 bd" },
  { id: "2bd", label: "2 bd" },
  { id: "3bd", label: "3+ bd" },
  { id: "room", label: "Комната" },
];

function matchFilter(item, filter) {
  if (filter === "all") return true;
  if (filter === "studio") return String(item.type || "").toLowerCase() === "studio";
  if (filter === "room") return String(item.type || "").toLowerCase() === "room";
  if (filter === "1bd") return Number(item.beds || 0) >= 1;
  if (filter === "2bd") return Number(item.beds || 0) >= 2;
  if (filter === "3bd") return Number(item.beds || 0) >= 3;
  return true;
}

export default function HousingListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useHousingFavorites();
  const { data: items = [], isLoading, isError, error, refetch } = useHousingQuery(
    isSupabaseConfigured
  );
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => (items || []).filter((item) => matchFilter(item, filter)),
    [items, filter]
  );

  const handleAdd = () => {
    if (!user) { router.push("/login"); return; }
    router.push("/housing/add");
  };

  const renderItem = ({ item }) => (
    <HousingCard
      item={item}
      isFavorite={Boolean(favorites["housing-" + item.id])}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onOpen={() => router.push("/housing/" + item.id)}
    />
  );

  const FilterBar = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContent}
      style={styles.filtersBar}
    >
      {FILTERS.map((f) => (
        <Pressable
          key={f.id}
          style={[styles.chip, filter === f.id && styles.chipActive]}
          onPress={() => setFilter(f.id)}
        >
          <Text style={[styles.chipText, filter === f.id && styles.chipTextActive]}>
            {f.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>🏠 Жильё</Text>
        <Pressable style={styles.addBtn} onPress={handleAdd}>
          <Plus size={20} color="#F47B20" strokeWidth={2.5} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Загрузка...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errText}>Ошибка: {error && error.message}</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryTxt}>Повторить</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={FilterBar}
          stickyHeaderIndices={[0]}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.muted}>Ничего не найдено.</Text>
              <Text style={styles.mutedSub}>
                {filter === "all" ? "Будьте первым — нажмите +" : "Попробуйте другой фильтр."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFECE6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF3E8",
    borderWidth: 1.5,
    borderColor: "#F47B2055",
    alignItems: "center",
    justifyContent: "center",
  },
  filtersBar: { flexGrow: 0, backgroundColor: "#EFECE6" },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  chipTextActive: { color: "#fff" },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  emptyWrap: { paddingTop: 60, alignItems: "center", gap: 8, paddingHorizontal: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  muted: { fontSize: 15, color: "#6B7280", textAlign: "center" },
  mutedSub: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
  errText: { fontSize: 14, color: "#B91C1C", textAlign: "center" },
  retryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
