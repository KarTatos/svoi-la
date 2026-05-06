import { useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import { Link, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DISTRICTS } from "../../src/config/places";
import { fetchPlaces } from "../../src/lib/places";
import { isSupabaseConfigured } from "../../src/lib/supabase";

function toRad(v) {
  return (v * Math.PI) / 180;
}

function haversineMi(aLat, aLng, bLat, bLng) {
  const R = 3958.8;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1 + s2));
}

function formatMi(mi) {
  if (mi == null) return "";
  if (mi < 1) return `${Math.round(mi * 10) / 10} mi`;
  if (mi < 10) return `${Math.round(mi * 10) / 10} mi`;
  return `${Math.round(mi)} mi`;
}

export default function PlacesScreen() {
  const router = useRouter();
  const [userCoords, setUserCoords] = useState(null);

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["places"],
    queryFn: fetchPlaces,
    enabled: isSupabaseConfigured,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;
        setUserCoords({ lat: Number(pos.coords.latitude), lng: Number(pos.coords.longitude) });
      } catch {
        // fallback to web order
      }
    }

    loadLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  const districtRows = useMemo(() => {
    const source = data || [];

    const baseRows = DISTRICTS.map((district, index) => ({
      ...district,
      _index: index,
      count: source.filter((p) => p.district === district.id).length,
      dist: userCoords ? haversineMi(userCoords.lat, userCoords.lng, district.lat, district.lng) : null,
    }));

    if (!userCoords) return baseRows;

    return [...baseRows].sort((a, b) => {
      const aHas = Number.isFinite(a.dist);
      const bHas = Number.isFinite(b.dist);
      if (aHas && bHas) return a.dist - b.dist;
      if (aHas) return -1;
      if (bHas) return 1;
      return a._index - b._index;
    });
  }, [data, userCoords]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push("/")} style={[styles.topBtn, styles.topBtnBack]}><Text style={styles.topBtnBackText}>‹</Text></Pressable>
          <View style={[styles.topBtn, styles.topBtnCenter]}><Text style={styles.topBtnCenterIcon}>📍</Text></View>
          <Pressable onPress={() => router.push("/places/add")} style={[styles.topBtn, styles.topBtnAdd]}><Text style={styles.topBtnAddText}>+</Text></Pressable>
        </View>

        {!isSupabaseConfigured && <View style={styles.stateBox}><Text style={styles.stateText}>Нужно настроить Supabase переменные окружения.</Text></View>}
        {isSupabaseConfigured && isLoading && <View style={styles.stateBox}><ActivityIndicator /><Text style={styles.stateText}>Загрузка мест...</Text></View>}
        {isSupabaseConfigured && isError && (
          <View style={styles.stateBox}>
            <Text style={styles.errorText}>Ошибка: {error?.message || "не удалось загрузить данные"}</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}><Text style={styles.retryText}>{isRefetching ? "Повторяем..." : "Повторить"}</Text></Pressable>
          </View>
        )}

        {isSupabaseConfigured && !isLoading && !isError && (
          <View style={styles.list}>
            {districtRows.map((d) => (
              <Link key={d.id} href={{ pathname: "/places/[district]", params: { district: d.id } }} asChild>
                <Pressable style={styles.card}>
                  <View style={styles.cardEmoji}><Text style={styles.emojiText}>{d.emoji}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{d.name}</Text>
                    <Text style={styles.cardDesc}>{d.desc}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.cardCount}>{d.count}</Text>
                    <Text style={styles.cardMeta}>мест</Text>
                    {Number.isFinite(d.dist) ? <Text style={styles.cardDist}>{formatMi(d.dist)}</Text> : null}
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
  content: { padding: 16, paddingBottom: 120 },
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 12, position: "relative" },
  topBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topBtnBack: { backgroundColor: "#FFFFFF" },
  topBtnBackText: { fontSize: 24, lineHeight: 24, color: "#8A8680" },
  topBtnCenter: { backgroundColor: "#F2EADF", position: "absolute", left: "50%", marginLeft: -19 },
  topBtnCenterIcon: { fontSize: 18 },
  topBtnAdd: { backgroundColor: "#FFF3E8", borderWidth: 1.5, borderColor: "#F47B2088", marginLeft: "auto" },
  topBtnAddText: { fontSize: 28, lineHeight: 28, color: "#F47B20" },
  stateBox: { marginTop: 14, backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#E7E1D2", padding: 14, gap: 8 },
  stateText: { fontSize: 14, color: "#374151" },
  errorText: { fontSize: 14, color: "#b91c1c" },
  retryButton: { alignSelf: "flex-start", marginTop: 4, backgroundColor: "#111827", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  list: { gap: 8 },
  card: { backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", padding: 16, flexDirection: "row", alignItems: "center", gap: 14 },
  cardEmoji: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#EFECE6", alignItems: "center", justifyContent: "center" },
  emojiText: { fontSize: 24 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  cardDesc: { marginTop: 2, fontSize: 12, color: "#6B6B6B" },
  cardCount: { fontSize: 13, fontWeight: "700", color: "#F47B20" },
  cardMeta: { fontSize: 10, color: "#999" },
  cardDist: { marginTop: 2, fontSize: 10, color: "#999" },
});
