import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Callout, Marker } from "react-native-maps";
import * as Linking from "expo-linking";
import { fetchPlaces } from "../../src/lib/places";
import { getDistrictById, getPlaceCatById } from "../../src/config/places";
import { isSupabaseConfigured } from "../../src/lib/supabase";

export default function PlacesMapScreen() {
  const router = useRouter();
  const { district, category, focusId } = useLocalSearchParams();
  const districtId = String(district || "").toLowerCase();
  const categoryId = String(category || "").toLowerCase();
  const selD = getDistrictById(districtId);
  const selPC = getPlaceCatById(categoryId);
  const [selected, setSelected] = useState(null);

  const { data } = useQuery({ queryKey: ["places"], queryFn: fetchPlaces, enabled: isSupabaseConfigured });

  const places = useMemo(() => {
    const list = (data || []).filter((p) => p.district === districtId && (!categoryId || p.cat === categoryId) && p.lat != null && p.lng != null);
    if (!focusId) return list;
    const idx = list.findIndex((p) => String(p.id) === String(focusId));
    if (idx <= 0) return list;
    return [list[idx], ...list.slice(0, idx), ...list.slice(idx + 1)];
  }, [data, districtId, categoryId, focusId]);

  const initialRegion = useMemo(() => {
    const first = places[0];
    if (first) {
      return { latitude: first.lat, longitude: first.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 };
    }
    return { latitude: selD?.lat || 34.0901, longitude: selD?.lng || -118.4065, latitudeDelta: 0.12, longitudeDelta: 0.12 };
  }, [places, selD]);

  const openRoute = (place) => {
    if (!place) return;
    if (place.lat != null && place.lng != null) {
      Linking.openURL(`http://maps.apple.com/?daddr=${place.lat},${place.lng}`);
      return;
    }
    const q = encodeURIComponent(place.address || place.name || "Los Angeles");
    Linking.openURL(`http://maps.apple.com/?q=${q}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backText}>‹</Text></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{selPC?.title || "Карта мест"}</Text>
          <Text style={styles.sub}>{selD?.name || "Район"}</Text>
        </View>
      </View>

      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation>
        {places.map((place) => (
          <Marker key={place.id} coordinate={{ latitude: place.lat, longitude: place.lng }} onPress={() => setSelected(place)}>
            <Callout onPress={() => router.push({ pathname: "/places/detail/[id]", params: { id: String(place.id), district: districtId, category: categoryId } })}>
              <View style={{ maxWidth: 220 }}>
                <Text style={{ fontWeight: "700" }}>{place.name}</Text>
                <Text style={{ color: "#6B6B6B", marginTop: 2 }}>{place.address || "Без адреса"}</Text>
                <Text style={{ color: "#F47B20", marginTop: 4, fontWeight: "700" }}>Открыть карточку</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{places.length} точек на карте</Text>
        <Pressable onPress={() => openRoute(selected || places[0])} style={styles.routeBtn}><Text style={styles.routeText}>Маршрут</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
  header: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 8, flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: "#EFECE6" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E5E5E5", alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 24, lineHeight: 24, color: "#6B6B6B" },
  title: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  sub: { fontSize: 12, color: "#6B6B6B", marginTop: 2 },
  map: { flex: 1 },
  footer: { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#E5E5E5", backgroundColor: "#FFF", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerText: { color: "#6B6B6B", fontSize: 13 },
  routeBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5, borderColor: "#F47B2088", backgroundColor: "#FFF3E8" },
  routeText: { color: "#F47B20", fontWeight: "700" },
});
