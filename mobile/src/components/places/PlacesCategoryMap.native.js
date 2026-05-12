import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import * as Location from "expo-location";
import { GlassContainer, GlassView, isLiquidGlassAvailable } from "expo-glass-effect";

function getInitialRegion(points, district) {
  if (!points.length) {
    return {
      latitude: district?.lat || 34.0522,
      longitude: district?.lng || -118.2437,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.03, (maxLat - minLat) * 1.8),
    longitudeDelta: Math.max(0.03, (maxLng - minLng) * 1.8),
  };
}

function decodePolyline(encoded) {
  if (!encoded || typeof encoded !== "string") return [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return coordinates;
}

const MINIMAL_GOOGLE_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f3f3f3" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f3f3f3" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e8e8e8" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e1e7ef" }] },
];

export default function PlacesCategoryMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  district,
  categoryTitle,
  placesCount,
  onBack,
  onAdd,
  mapHeight,
  insetTop,
}) {
  const mapRef = useRef(null);
  const routeRequestRef = useRef(0);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const liquidGlass = isLiquidGlassAvailable();
  const region = useMemo(() => getInitialRegion(places, district), [places, district]);
  const selectedPlace = useMemo(
    () => places.find((p) => String(p.id) === String(selectedPlaceId)) || null,
    [places, selectedPlaceId]
  );

  const routeStatusText = useMemo(() => {
    if (!selectedPlaceId) return "";
    if (routeLoading) return "Считаем маршрут...";
    if (routeInfo?.duration || routeInfo?.distance) {
      return `На машине: ${[routeInfo.duration, routeInfo.distance].filter(Boolean).join(" · ")}`;
    }
    return "Маршрут недоступен";
  }, [routeInfo, routeLoading, selectedPlaceId]);

  const buildRoute = async (place) => {
    if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return;
    const requestId = routeRequestRef.current + 1;
    routeRequestRef.current = requestId;
    onSelectPlace?.(String(place.id));
    setRoutePoints([]);
    setRouteInfo(null);
    setRouteLoading(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
      if (!apiKey) {
        setRouteLoading(false);
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setRouteLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const origin = `${position.coords.latitude},${position.coords.longitude}`;
      const destination = `${place.lat},${place.lng}`;
      const url =
        "https://maps.googleapis.com/maps/api/directions/json" +
        `?origin=${encodeURIComponent(origin)}` +
        `&destination=${encodeURIComponent(destination)}` +
        `&mode=driving&language=ru&key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url);
      const json = await response.json();
      if (routeRequestRef.current !== requestId) return;
      if (!response.ok || json?.status !== "OK") {
        if (__DEV__) {
          console.log("[PlacesCategoryMap] directions error:", {
            http: response.status,
            status: json?.status,
            message: json?.error_message,
          });
        }
        setRoutePoints([]);
        setRouteInfo(null);
        return;
      }

      const route = json?.routes?.[0];
      const points = decodePolyline(route?.overview_polyline?.points);
      if (__DEV__) {
        console.log("[PlacesCategoryMap] directions status:", json?.status);
        console.log("[PlacesCategoryMap] decoded points:", points.length);
        if (points.length > 0) {
          console.log("[PlacesCategoryMap] first point:", points[0]);
          console.log("[PlacesCategoryMap] last point:", points[points.length - 1]);
        }
      }
      if (points.length < 2) {
        setRoutePoints([]);
        setRouteInfo(null);
        return;
      }

      const leg = route?.legs?.[0];
      setRouteInfo({
        distance: leg?.distance?.text || "",
        duration: leg?.duration?.text || "",
      });
      setRoutePoints(points);
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 120, right: 40, bottom: 180, left: 40 },
        animated: true,
      });
    } catch {
      if (routeRequestRef.current !== requestId) return;
      setRoutePoints([]);
      setRouteInfo(null);
    } finally {
      if (routeRequestRef.current === requestId) setRouteLoading(false);
    }
  };

  return (
    <>
      <View style={[styles.mapHero, { height: mapHeight }]}> 
        {Platform.OS === "web" ? (
          <View style={styles.webMapFallback}><Text style={styles.webMapText}>Карта отображается в Expo Go на iPhone</Text></View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            provider={PROVIDER_GOOGLE}
            showsUserLocation
            customMapStyle={MINIMAL_GOOGLE_MAP_STYLE}
          >
            {routePoints.length > 1 ? (
              <Polyline
                key={`${selectedPlaceId || "route"}-${routePoints.length}`}
                coordinates={routePoints.map((p) => ({
                  latitude: Number(p.latitude),
                  longitude: Number(p.longitude),
                }))}
                strokeColor="#E74C3C"
                strokeWidth={6}
                lineCap="round"
                lineJoin="round"
                zIndex={999}
              />
            ) : null}
            {places.map((p) => {
              const isSelected = String(selectedPlaceId) === String(p.id);
              const size = isSelected ? 34 : 28;
              const r = size / 2 - 1.5;
              const cx = size / 2;
              const cy = size / 2;
              const fontSize = String(p.markerIndex).length > 1 ? 10 : 12;
              return (
                <Marker
                  key={p.id}
                  coordinate={{ latitude: p.lat, longitude: p.lng }}
                  onPress={() => buildRoute(p)}
                  tracksViewChanges={false}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <Circle
                      cx={cx} cy={cy} r={r}
                      fill={isSelected ? "#B71C1C" : "#D7261E"}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <SvgText
                      x={cx} y={cy + fontSize * 0.38}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize={fontSize}
                      fontWeight="bold"
                      fontFamily="Arial"
                    >
                      {p.markerIndex}
                    </SvgText>
                  </Svg>
                </Marker>
              );
            })}
          </MapView>
        )}

        <View style={[styles.overlayWrap, { top: insetTop + 8 }]}>
          {liquidGlass ? (
            <GlassContainer style={styles.overlayGlassContainer}>
              <GlassView glassEffectStyle="regular" style={styles.overlayGlassHeader}>
                <Pressable onPress={onBack} style={styles.headerBtn}><Text style={styles.headerBtnBackText}>‹</Text></Pressable>
                <View style={styles.overlayCenter}><Text style={styles.overlayTitle}>{categoryTitle || "Категория"}</Text><Text style={styles.overlaySub}>{district?.name || "Район"} · {placesCount} мест</Text></View>
                <Pressable style={styles.headerBtnPlus} disabled={!onAdd} onPress={onAdd}><Text style={styles.headerBtnPlusText}>+</Text></Pressable>
              </GlassView>
            </GlassContainer>
          ) : (
            <View style={styles.overlayFallbackHeader}>
              <Pressable onPress={onBack} style={styles.headerBtn}><Text style={styles.headerBtnBackText}>‹</Text></Pressable>
              <View style={styles.overlayCenter}><Text style={styles.overlayTitle}>{categoryTitle || "Категория"}</Text><Text style={styles.overlaySub}>{district?.name || "Район"} · {placesCount} мест</Text></View>
              <Pressable style={styles.headerBtnPlus} disabled={!onAdd} onPress={onAdd}><Text style={styles.headerBtnPlusText}>+</Text></Pressable>
            </View>
          )}
        </View>
      </View>

      {selectedPlaceId ? (
        <View style={[styles.routeInfoRow, { top: mapHeight - 90 }]}>
          <Text style={styles.routeInfoPlace} numberOfLines={1}>{selectedPlace?.name || ""}</Text>
          <Text style={styles.routeInfoMeta} numberOfLines={1}>{routeStatusText}</Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  mapHero: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: "#ECEFF3" },
  map: { flex: 1 },
  webMapFallback: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#ECEFF3" },
  webMapText: { color: "#6B6B6B", fontSize: 13 },
  overlayWrap: { position: "absolute", left: 0, right: 0, zIndex: 10 },
  overlayGlassContainer: { width: "100%" },
  overlayGlassHeader: { minHeight: 62, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(246,244,239,0.92)" },
  overlayFallbackHeader: { minHeight: 62, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(246,244,239,0.96)", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  overlayCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  overlayTitle: { fontSize: 17, fontWeight: "700", color: "#1F1F22" },
  overlaySub: { marginTop: 1, fontSize: 13, fontWeight: "600", color: "#6B6B6B" },
  headerBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.78)", alignItems: "center", justifyContent: "center" },
  headerBtnBackText: { fontSize: 24, lineHeight: 24, color: "#8E8E93" },
  headerBtnPlus: { width: 42, height: 42, borderRadius: 13, borderWidth: 1.5, borderColor: "#F47B2088", backgroundColor: "rgba(255,243,232,0.92)", alignItems: "center", justifyContent: "center" },
  headerBtnPlusText: { fontSize: 28, lineHeight: 28, color: "#F47B20" },
  pinWrap: { minWidth: 28, height: 28, borderRadius: 14, backgroundColor: "#D7261E", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF", paddingHorizontal: 6 },
  pinWrapActive: { transform: [{ scale: 1.08 }] },
  pinText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  routeInfoRow: {
    position: "absolute",
    left: 16,
    right: 16,
    marginTop: 2,
    zIndex: 5,
    paddingHorizontal: 2,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  routeInfoPlace: { flex: 1, color: "#1A1A1A", fontSize: 14, fontWeight: "800" },
  routeInfoMeta: { color: "#8A8680", fontSize: 12, fontWeight: "700" },
});
