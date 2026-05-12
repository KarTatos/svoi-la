import { useMemo } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchPlaces } from "../../../src/lib/places";
import { DISTRICTS, PLACE_CATS, getDistrictById } from "../../../src/config/places";
import { isSupabaseConfigured } from "../../../src/lib/supabase";

export default function DistrictScreen() {
  const router = useRouter();
  const { district } = useLocalSearchParams();
  const districtId = String(district || "").toLowerCase();
  const selectedDistrict = getDistrictById(districtId);

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["places"],
    queryFn: fetchPlaces,
    enabled: isSupabaseConfigured,
  });

  const districtPlaces = useMemo(() => (data || []).filter((p) => p.district === districtId), [data, districtId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push("/places")} style={[styles.topBtn, styles.topBtnBack]}><Text style={styles.topBtnBackText}>‹</Text></Pressable>
          <View style={[styles.topBtn, styles.topBtnCenter]}><Text style={styles.topBtnCenterIcon}>📍</Text></View>
          <Pressable onPress={() => router.push({ pathname: "/places/add", params: { district: districtId } })} style={[styles.topBtn, styles.topBtnAdd]}><Text style={styles.topBtnAddText}>+</Text></Pressable>
        </View>

        <View style={styles.titleWrap}><Text style={styles.title}>{selectedDistrict?.name || "Район"}</Text></View>

        {!isSupabaseConfigured && <View style={styles.stateBox}><Text style={styles.stateText}>Нужно настроить Supabase переменные окружения.</Text></View>}
        {isSupabaseConfigured && isLoading && <View style={styles.stateBox}><ActivityIndicator /><Text style={styles.stateText}>Загрузка мест...</Text></View>}
        {isSupabaseConfigured && isError && (
          <View style={styles.stateBox}>
            <Text style={styles.errorText}>Ошибка: {error?.message || "не удалось загрузить данные"}</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}><Text style={styles.retryText}>{isRefetching ? "Повторяем..." : "Повторить"}</Text></Pressable>
          </View>
        )}

        {isSupabaseConfigured && !isLoading && !isError && (
          <View style={styles.grid}>
            {PLACE_CATS.map((c) => {
              const cnt = districtPlaces.filter((p) => p.cat === c.id).length;
              if (!cnt) return null;
              return (
                <Link key={c.id} href={{ pathname: "/places/[district]/[category]", params: { district: districtId, category: c.id } }} asChild>
                  <Pressable style={styles.catCard}>
                    <View style={[styles.iconBox, { backgroundColor: `${c.color}12` }]}><Text style={styles.icon}>{c.icon}</Text></View>
                    <View>
                      <Text style={styles.catTitle}>{c.title}</Text>
                      <Text style={styles.catCount}>{cnt} мест</Text>
                    </View>
                  </Pressable>
                </Link>
              );
            })}
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
  titleWrap: { alignItems: "center", marginTop: 4, marginBottom: 18 },
  title: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCard: { width: "48.5%", backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 20 },
  catTitle: { fontWeight: "700", fontSize: 14, color: "#1A1A1A" },
  catCount: { marginTop: 2, fontSize: 12, color: "#6B6B6B" },
  stateBox: { marginTop: 14, backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#E7E1D2", padding: 14, gap: 8 },
  stateText: { fontSize: 14, color: "#374151" },
  errorText: { fontSize: 14, color: "#b91c1c" },
  retryButton: { alignSelf: "flex-start", marginTop: 4, backgroundColor: "#111827", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
