import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Animated,
  ActivityIndicator,
  Image,
  ImageBackground,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useAuth } from "../../../src/hooks/useAuth";
import { fetchPlaces } from "../../../src/lib/places";
import { getDistrictById, getPlaceCatById } from "../../../src/config/places";
import { isSupabaseConfigured } from "../../../src/lib/supabase";
import PlacesCategoryMap from "../../../src/components/places/PlacesCategoryMap";

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatPlaceAddressLabel(address = "") {
  const raw = String(address || "").trim();
  if (!raw) return "";
  const noState = raw.replace(/,\s*CA(?:\s+\d{5}(?:-\d{4})?)?$/i, "").trim();
  return noState.split(",")[0].trim();
}

export default function PlacesCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const { user } = useAuth();
  const { district, category } = useLocalSearchParams();

  const districtId = String(district || "").toLowerCase();
  const categoryId = String(category || "").toLowerCase();
  const selD = getDistrictById(districtId);
  const selPC = getPlaceCatById(categoryId);

  const [sortField] = useState(null);
  const [sortDir] = useState("desc");
  const [selectedMapPlaceId, setSelectedMapPlaceId] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {}
    })();
  }, []);

  const mapHeight = Math.max(430, Math.min(520, Math.round(screenHeight * 0.55)));
  const sheetTop = mapHeight - 48;
  const headerBottom = insets.top + 70;
  const containerHeight = screenHeight - headerBottom;

  // Bottom sheet pan logic
  const sheetY = useRef(new Animated.Value(sheetTop)).current;
  const scrollRef = useRef(null);
  const scrollAtTop = useRef(true);
  const sheetAtTop = useRef(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  const snapOpen = () => {
    Animated.spring(sheetY, { toValue: headerBottom, useNativeDriver: false, speed: 18, bounciness: 0 }).start(() => {
      sheetAtTop.current = true;
      setScrollEnabled(true);
    });
  };

  const snapClosed = () => {
    setScrollEnabled(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    Animated.spring(sheetY, { toValue: sheetTop, useNativeDriver: false, speed: 18, bounciness: 0 }).start(() => {
      sheetAtTop.current = false;
    });
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_, g) => {
      if (!sheetAtTop.current && g.dy < -10) return true;
      if (sheetAtTop.current && scrollAtTop.current && g.dy > 10) return true;
      return false;
    },
    onPanResponderGrant: () => { sheetY.stopAnimation(); },
    onPanResponderMove: (_, g) => {
      if (!sheetAtTop.current) {
        sheetY.setValue(Math.max(headerBottom, sheetTop + g.dy));
      } else {
        sheetY.setValue(Math.min(sheetTop, Math.max(headerBottom, headerBottom + g.dy)));
      }
    },
    onPanResponderRelease: (_, g) => {
      const mid = (sheetTop + headerBottom) / 2;
      if (!sheetAtTop.current) {
        const next = sheetTop + g.dy;
        if (g.vy < -0.5 || next < mid) snapOpen();
        else Animated.spring(sheetY, { toValue: sheetTop, useNativeDriver: false, speed: 18, bounciness: 0 }).start();
      } else {
        const next = headerBottom + g.dy;
        if (g.vy > 0.5 || next > mid) snapClosed();
        else Animated.spring(sheetY, { toValue: headerBottom, useNativeDriver: false, speed: 18, bounciness: 0 }).start();
      }
    },
  })).current;

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["places"],
    queryFn: fetchPlaces,
    enabled: isSupabaseConfigured,
  });

  const places = useMemo(
    () => (data || []).filter((p) => p.district === districtId && p.cat === categoryId),
    [data, districtId, categoryId]
  );

  const placesWithCoords = useMemo(
    () => places.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
    [places]
  );

  const sortedPlaces = useMemo(() => {
    const arr = [...places];
    arr.sort((a, b) => {
      if (sortField === "likes") {
        const cmp = (a.likes || 0) - (b.likes || 0);
        return sortDir === "asc" ? cmp : -cmp;
      }
      if (userLocation) {
        const dA = Number.isFinite(a.lat) && Number.isFinite(a.lng)
          ? haversineKm(userLocation.latitude, userLocation.longitude, a.lat, a.lng)
          : Infinity;
        const dB = Number.isFinite(b.lat) && Number.isFinite(b.lng)
          ? haversineKm(userLocation.latitude, userLocation.longitude, b.lat, b.lng)
          : Infinity;
        return dA - dB;
      }
      return 0;
    });
    return arr;
  }, [places, sortField, sortDir, userLocation]);

  const indexedCoords = useMemo(() => {
    const idToIndex = new Map();
    sortedPlaces.forEach((p, i) => idToIndex.set(String(p.id), i + 1));
    return placesWithCoords
      .map((p) => ({ ...p, markerIndex: idToIndex.get(String(p.id)) || 0 }))
      .sort((a, b) => a.markerIndex - b.markerIndex);
  }, [sortedPlaces, placesWithCoords]);

  return (
    <ImageBackground
      source={require("../../../assets/bg-pattern.png")}
      style={styles.root}
      imageStyle={{ opacity: 0.13 }}
      resizeMode="repeat"
    >
      <PlacesCategoryMap
        places={indexedCoords}
        selectedPlaceId={selectedMapPlaceId}
        onSelectPlace={setSelectedMapPlaceId}
        district={selD}
        categoryTitle={selPC?.title || "Категория"}
        placesCount={sortedPlaces.length}
        onBack={() => router.push(`/places/${districtId}`)}
        onAdd={() =>
          router.push({
            pathname: "/places/add",
            params: { district: districtId, category: categoryId },
          })
        }
        mapHeight={mapHeight}
        insetTop={insets.top}
      />

      <Animated.View
        style={[styles.sheetHost, { top: sheetY, height: containerHeight }]}
        {...panResponder.panHandlers}
      >
        <ScrollView
          ref={scrollRef}
          scrollEnabled={scrollEnabled}
          onScroll={(e) => { scrollAtTop.current = e.nativeEvent.contentOffset.y <= 0; }}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: Math.max(120, insets.bottom + 90) }}
        >
          <View style={styles.sheet}>
            <View style={styles.handleWrap}><View style={styles.handle} /></View>

            {!isSupabaseConfigured && <View style={styles.stateBox}><Text style={styles.stateText}>Нужно настроить Supabase переменные окружения.</Text></View>}
            {isSupabaseConfigured && isLoading && <View style={styles.stateBox}><ActivityIndicator /><Text style={styles.stateText}>Загрузка мест...</Text></View>}
            {isSupabaseConfigured && isError && (
              <View style={styles.stateBox}><Text style={styles.errorText}>Ошибка: {error?.message || "не удалось загрузить данные"}</Text><Pressable onPress={() => refetch()} style={styles.retryButton}><Text style={styles.retryText}>{isRefetching ? "Повторяем..." : "Повторить"}</Text></Pressable></View>
            )}

            {isSupabaseConfigured && !isLoading && !isError && sortedPlaces.length === 0 && (
              <View style={styles.stateBox}><Text style={styles.stateText}>В этой категории пока нет мест.</Text></View>
            )}

            {isSupabaseConfigured && !isLoading && !isError && sortedPlaces.length > 0 && (
              <View>
                {sortedPlaces.map((p, idx) => (
                  <Pressable
                    key={p.id}
                    style={styles.card}
                    onPress={() =>
                      router.push({
                        pathname: "/places/detail/[id]",
                        params: { id: String(p.id), district: districtId, category: categoryId },
                      })
                    }
                  >
                    <View style={styles.cardBody}>
                      <View style={styles.headRow}>
                        <View style={styles.headLeft}>
                          <View style={styles.nameRow}>
                            <Text style={styles.idx}>{idx + 1}</Text>
                            <Text style={styles.name}>{p.name}</Text>
                          </View>
                          <Text style={styles.addr}>{formatPlaceAddressLabel(p.address || selD?.name || "")}</Text>
                        </View>
                      </View>

                      <View style={[styles.tipBox, { borderLeftColor: selPC?.color || "#F47B20" }]}>
                        <Text numberOfLines={2} style={styles.tip}>{p.tip || ""}</Text>
                      </View>

                      {Array.isArray(p.photos) && p.photos.length > 0 && (
                        <View style={styles.photos}>
                          {p.photos.slice(0, 3).map((ph, i) => (
                            <Image key={`${p.id}-${i}`} source={{ uri: ph }} style={styles.photo} />
                          ))}
                        </View>
                      )}

                      <Text style={styles.author}>от {p.addedBy || "пользователь"}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFECE6" },
  sheetHost: { position: "absolute", left: 0, right: 0, zIndex: 10, backgroundColor: "#EFECE6" },
  sheet: { backgroundColor: "#EFECE6", borderTopLeftRadius: 22, borderTopRightRadius: 22, minHeight: 200 },
  handleWrap: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(0,0,0,0.18)" },
  card: { backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", marginHorizontal: 16, marginBottom: 12, overflow: "hidden" },
  cardBody: { padding: 16 },
  headRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  headLeft: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  idx: { color: "#D7261E", fontWeight: "800", fontSize: 16 },
  name: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", flexShrink: 1 },
  addr: { marginTop: 3, fontSize: 12, color: "#6B6B6B" },
  tipBox: { marginTop: 12, padding: 12, backgroundColor: "#EFECE6", borderRadius: 10, borderLeftWidth: 3 },
  tip: { fontSize: 13, color: "#6B6B6B" },
  photos: { marginTop: 10, flexDirection: "row", gap: 6 },
  photo: { width: "31.5%", height: 90, borderRadius: 10, borderWidth: 1, borderColor: "#F0F0F0" },
  author: { marginTop: 10, fontSize: 12, color: "#999" },
  stateBox: { marginHorizontal: 16, marginTop: 14, backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#E7E1D2", padding: 14, gap: 8 },
  stateText: { fontSize: 14, color: "#374151" },
  errorText: { fontSize: 14, color: "#b91c1c" },
  retryButton: { alignSelf: "flex-start", marginTop: 4, backgroundColor: "#111827", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
