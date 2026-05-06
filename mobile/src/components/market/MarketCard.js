import { Pressable, StyleSheet, Text, View, Image } from "react-native";

function formatPrice(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.startsWith("$") ? raw : `$${raw}`;
}

export default function MarketCard({ item, isLiked, onOpen, onToggleLike }) {
  const photo = Array.isArray(item.photos) && item.photos.length ? item.photos[0] : "";

  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={styles.photoWrap}>
        {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <View style={styles.noPhoto}><Text style={styles.noPhotoText}>🏷️</Text></View>}
        <Pressable onPress={onToggleLike} style={styles.heartBtn}><Text style={[styles.heart, isLiked && styles.heartActive]}>♥</Text></Pressable>
        {item.photos?.length > 1 ? <View style={styles.badge}><Text style={styles.badgeText}>+{item.photos.length - 1}</Text></View> : null}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
        {item.price ? <Text style={styles.price}>{formatPrice(item.price)}</Text> : <Text style={styles.muted}>Цена не указана</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#E8E4DB", overflow: "hidden" },
  photoWrap: { width: "100%", aspectRatio: 1, backgroundColor: "#F1EEE7", position: "relative" },
  photo: { width: "100%", height: "100%" },
  noPhoto: { flex: 1, alignItems: "center", justifyContent: "center" },
  noPhotoText: { fontSize: 34 },
  heartBtn: { position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  heart: { color: "#8A8680", fontSize: 14 },
  heartActive: { color: "#E74C3C" },
  badge: { position: "absolute", right: 8, bottom: 8, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: "#fff", fontSize: 11 },
  body: { paddingHorizontal: 10, paddingVertical: 10 },
  title: { fontSize: 13, lineHeight: 18, color: "#111827", minHeight: 36 },
  price: { marginTop: 4, fontSize: 15, fontWeight: "700", color: "#F47B20" },
  muted: { marginTop: 4, fontSize: 13, color: "#8A8680" },
});
