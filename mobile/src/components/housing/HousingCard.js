import { Pressable, StyleSheet, Text, View, Image } from "react-native";

function formatHousingPrice(value) {
  const n = Number(value || 0);
  if (!n) return "0";
  return n.toLocaleString("en-US");
}

function formatHousingType(type) {
  const t = String(type || "").toLowerCase();
  if (t === "room") return "Комната";
  if (t === "studio") return "Студия";
  if (t === "1bd") return "1 bd";
  if (t === "2bd") return "2 bd";
  return type || "Жильё";
}

export default function HousingCard({ item, isFavorite, onToggleFavorite, onOpen }) {
  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={styles.photoWrap}>
        {item.photo ? <Image source={{ uri: item.photo }} style={styles.photo} /> : <View style={styles.noPhoto}><Text style={styles.noPhotoText}>Нет фото</Text></View>}
        {item.updatedLabel ? <View style={styles.updated}><Text style={styles.updatedText}>{item.updatedLabel}</Text></View> : null}
        <Pressable onPress={onToggleFavorite} style={styles.starBtn}><Text style={[styles.star, isFavorite && styles.starActive]}>★</Text></Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.price}>${formatHousingPrice(item.minPrice)}</Text>
        <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
        <Text style={styles.meta}>{formatHousingType(item.type)} · {item.district || "LA"}</Text>
        {item.comment ? <Text style={styles.comment} numberOfLines={2}>{item.comment}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#E8E4DB", overflow: "hidden" },
  photoWrap: { width: "100%", height: 188, backgroundColor: "#E9EDF2", position: "relative" },
  photo: { width: "100%", height: "100%" },
  noPhoto: { flex: 1, alignItems: "center", justifyContent: "center" },
  noPhotoText: { color: "#9CA3AF", fontSize: 12 },
  updated: { position: "absolute", top: 10, left: 10, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 10, paddingVertical: 6 },
  updatedText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  starBtn: { position: "absolute", right: 10, top: 10, width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  star: { fontSize: 20, color: "#1E4D97" },
  starActive: { color: "#D68910" },
  body: { paddingHorizontal: 12, paddingVertical: 10 },
  price: { fontSize: 24, fontWeight: "900", color: "#111827" },
  address: { marginTop: 4, color: "#2E2E3A", fontSize: 15 },
  meta: { marginTop: 3, color: "#8A8680", fontSize: 12 },
  comment: { marginTop: 6, color: "#8A8680", fontSize: 12, lineHeight: 18 },
});
