import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search, SlidersHorizontal } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useMarketQuery } from "../../src/hooks/useMarketQuery";
import { isSupabaseConfigured } from "../../src/lib/supabase";
import MarketCard from "../../src/components/market/MarketCard";
import AsyncStorage from "@react-native-async-storage/async-storage";


const FAV_KEY = "market_favorites_v1";

function useFavorites() {
  const [favorites, setFavorites] = useState({});
  useEffect(() => {
    AsyncStorage.getItem(FAV_KEY).then((raw) => {
      try { setFavorites(raw ? JSON.parse(raw) : {}); } catch { setFavorites({}); }
    });
  }, []);
  const toggle = useCallback((id) => {
    const key = "market-" + id;
    setFavorites((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(FAV_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);
  return { favorites, toggle };
}

export default function MarketListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: items = [], isLoading, isError, error, refetch } = useMarketQuery(isSupabaseConfigured);
  const { favorites, toggle } = useFavorites();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      String(it.title || "").toLowerCase().includes(q) ||
      String(it.description || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleAdd = () => {
    if (!user) { router.push("/login"); return; }
    router.push("/market/add");
  };

  const renderItem = useCallback(({ item, index }) => {
    const isLeft = index % 2 === 0;
    return (
      <View style={[styles.cardWrap, isLeft ? styles.cardLeft : styles.cardRight]}>
        <MarketCard
          item={item}
          isFavorite={Boolean(favorites["market-" + item.id])}
          onToggleFavorite={() => toggle(item.id)}
          onOpen={() => router.push("/market/" + item.id)}
        />
      </View>
    );
  }, [favorites, toggle, router]);

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>🏷️ Продам</Text>
        <Pressable style={styles.addBtn} onPress={handleAdd}>
          <Plus size={20} color="#F47B20" strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Search size={16} color="#9CA3AF" strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск объявлений..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Content */}
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
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>{search ? "Ничего не найдено." : "Объявлений пока нет."}</Text>
          <Text style={styles.mutedSub}>{search ? "Попробуйте другой запрос." : "Будьте первым — нажмите +"}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
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
    paddingBottom: 10,
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
    backgroundColor: "#FFF3E8", borderWidth: 1.5, borderColor: "#F47B2055",
    alignItems: "center", justifyContent: "center",
  },
  searchRow: { paddingHorizontal: 16, paddingBottom: 10 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  grid: { paddingHorizontal: 16, paddingBottom: 120 },
  row: { gap: 10, marginBottom: 10 },
  cardWrap: {},
  cardLeft: {},
  cardRight: {},
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  muted: { fontSize: 15, color: "#6B7280", textAlign: "center" },
  mutedSub: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
  errText: { fontSize: 14, color: "#B91C1C", textAlign: "center" },
  retryBtn: { backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
