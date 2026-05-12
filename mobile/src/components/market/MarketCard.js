import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Heart } from "lucide-react-native";

const SCREEN_W = Dimensions.get("window").width;
const COL_W = (SCREEN_W - 32 - 10) / 2; // 16px padding each side, 10px gap

function formatPrice(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  return raw.startsWith("$") ? raw : "$" + raw;
}

export default function MarketCard({ item, isFavorite, onToggleFavorite, onOpen }) {
  const photo = Array.isArray(item.photos) && item.photos.length ? item.photos[0] : "";
  const price = formatPrice(item.price);

  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={styles.photoWrap}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.noPhoto}>
            <Text style={styles.noPhotoIcon}>🏷️</Text>
          </View>
        )}
        <Pressable style={styles.heartBtn} onPress={onToggleFavorite} hitSlop={10}>
          <Heart
            size={15}
            color={isFavorite ? "#F47B20" : "#fff"}
            fill={isFavorite ? "#F47B20" : "none"}
            strokeWidth={2.5}
          />
        </Pressable>
        {Array.isArray(item.photos) && item.photos.length > 1 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>+{item.photos.length - 1}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{item.title || "Без названия"}</Text>
        {price ? (
          <Text style={styles.price}>{price}</Text>
        ) : (
          <Text style={styles.noPrice}>Цена не указана</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: COL_W,
    backgroundColor: "#1C1C1E",
    borderRadius: 16,
    overflow: "hidden",
  },
  photoWrap: {
    width: COL_W,
    height: COL_W,
    backgroundColor: "#2C2C2E",
    position: "relative",
  },
  photo: { width: "100%", height: "100%" },
  noPhoto: { flex: 1, alignItems: "center", justifyContent: "center" },
  noPhotoIcon: { fontSize: 32 },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    position: "absolute",
    bottom: 6,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  body: { paddingHorizontal: 10, paddingVertical: 10 },
  title: { fontSize: 13, lineHeight: 18, color: "#FFFFFF", minHeight: 36 },
  price: { marginTop: 4, fontSize: 16, fontWeight: "800", color: "#F47B20" },
  noPrice: { marginTop: 4, fontSize: 12, color: "#636366" },
});
