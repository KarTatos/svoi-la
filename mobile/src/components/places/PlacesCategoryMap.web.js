import { Pressable, StyleSheet, Text, View } from "react-native";
import { GlassContainer, GlassView, isLiquidGlassAvailable } from "expo-glass-effect";

export default function PlacesCategoryMap({
  district,
  categoryTitle,
  placesCount,
  onBack,
  onAdd,
  mapHeight,
  insetTop,
}) {
  const liquidGlass = isLiquidGlassAvailable();

  return (
    <View style={[styles.mapHero, { height: mapHeight }]}> 
      <View style={styles.webMapFallback}>
        <Text style={styles.webMapTitle}>Карта доступна в Expo Go на iPhone</Text>
        <Text style={styles.webMapText}>Для web-preview показываем только заглушку карты.</Text>
      </View>

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
  );
}

const styles = StyleSheet.create({
  mapHero: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: "#ECEFF3" },
  webMapFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECEFF3",
    paddingHorizontal: 24,
  },
  webMapTitle: { color: "#2F2F2F", fontSize: 14, fontWeight: "700", textAlign: "center" },
  webMapText: { marginTop: 6, color: "#6B6B6B", fontSize: 12, textAlign: "center" },
  overlayWrap: { position: "absolute", left: 16, right: 16, zIndex: 10 },
  overlayGlassContainer: { width: "100%" },
  overlayGlassHeader: { minHeight: 62, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(246,244,239,0.88)" },
  overlayFallbackHeader: { minHeight: 62, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(246,244,239,0.96)", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  overlayCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  overlayTitle: { fontSize: 17, fontWeight: "700", color: "#1F1F22" },
  overlaySub: { marginTop: 1, fontSize: 13, fontWeight: "600", color: "#6B6B6B" },
  headerBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.78)", alignItems: "center", justifyContent: "center" },
  headerBtnBackText: { fontSize: 24, lineHeight: 24, color: "#8E8E93" },
  headerBtnPlus: { width: 42, height: 42, borderRadius: 13, borderWidth: 1.5, borderColor: "#F47B2088", backgroundColor: "rgba(255,243,232,0.92)", alignItems: "center", justifyContent: "center" },
  headerBtnPlusText: { fontSize: 28, lineHeight: 28, color: "#F47B20" },
});
