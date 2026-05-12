import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Heart } from "lucide-react-native";

const SCREEN_W = Dimensions.get("window").width;
const CARD_W = SCREEN_W - 32;
const PHOTO_H = 200;

function formatPrice(v) {
  const n = Number(v || 0);
  return n > 0 ? "$" + n.toLocaleString("en-US") + "/mo" : "Цена не указана";
}

function getTypeLabel(type) {
  const map = { studio: "Studio", room: "Комната", "1bd": "1 bd", "2bd": "2 bd", "3bd": "3+ bd" };
  return map[String(type || "").toLowerCase()] || type || "Жильё";
}

export default function HousingCard({ item, isFavorite, onToggleFavorite, onOpen }) {
  const photos =
    Array.isArray(item && item.photos) && item.photos.length
      ? item.photos
      : item && item.photo
      ? [item.photo]
      : [];

  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={styles.photoWrap}>
        {photos.length > 0 ? (
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item: uri }) => (
              <Image source={{ uri: uri }} style={styles.photo} resizeMode="cover" />
            )}
            style={styles.photoList}
            nestedScrollEnabled
          />
        ) : (
          <View style={styles.noPhoto}>
            <Text style={styles.noPhotoIcon}>🏠</Text>
            <Text style={styles.noPhotoText}>Нет фото</Text>
          </View>
        )}

        <Pressable style={styles.heartBtn} onPress={onToggleFavorite} hitSlop={12}>
          <Heart
            size={18}
            color={isFavorite ? "#F47B20" : "#fff"}
            fill={isFavorite ? "#F47B20" : "none"}
            strokeWidth={2.5}
          />
        </Pressable>

        {photos.length > 1 ? (
          <View style={styles.photoBadge}>
            <Text style={styles.photoBadgeText}>{photos.length} фото</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.price}>{formatPrice(item.minPrice)}</Text>
          <View style={styles.typeChip}>
            <Text style={styles.typeText}>{getTypeLabel(item.type)}</Text>
          </View>
        </View>

        <Text style={styles.address} numberOfLines={1}>
          {item.title || item.address || "Los Angeles"}
        </Text>

        <View style={styles.detailRow}>
          {item.beds > 0 ? (
            <View style={styles.detailChip}>
              <Text style={styles.detailText}>{item.beds} bd</Text>
            </View>
          ) : null}
          {item.baths > 0 ? (
            <View style={styles.detailChip}>
              <Text style={styles.detailText}>{item.baths} ba</Text>
            </View>
          ) : null}
          {item.district ? (
            <View style={styles.detailChip}>
              <Text style={styles.detailText} numberOfLines={1}>{item.district}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    overflow: "hidden",
    width: CARD_W,
  },
  photoWrap: {
    width: CARD_W,
    height: PHOTO_H,
    backgroundColor: "#2C2C2E",
    position: "relative",
  },
  photoList: { width: CARD_W, height: PHOTO_H },
  photo: { width: CARD_W, height: PHOTO_H },
  noPhoto: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
  noPhotoIcon: { fontSize: 36 },
  noPhotoText: { color: "#636366", fontSize: 12 },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.50)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoBadge: {
    position: "absolute",
    bottom: 8,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  body: { paddingHorizontal: 14, paddingVertical: 12 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  price: { fontSize: 22, fontWeight: "900", color: "#FFFFFF", flex: 1 },
  typeChip: {
    backgroundColor: "#F47B20",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  address: { marginTop: 5, color: "#AEAEB2", fontSize: 14 },
  detailRow: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  detailChip: {
    backgroundColor: "#2C2C2E",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailText: { color: "#8E8E93", fontSize: 12, fontWeight: "600" },
});
