import { useState } from "react";
import { Pressable, StyleSheet, Text, View, Image, ScrollView } from "react-native";

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

export default function HousingDetailScreen({
  item,
  isFavorite,
  isLiked,
  onBack,
  onToggleFavorite,
  onToggleLike,
  onShare,
  onOpenAddress,
  onOpenTelegram,
  onOpenMessage,
  onEdit,
  canManage,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const photos = Array.isArray(item?.photos) && item.photos.length ? item.photos : item?.photo ? [item.photo] : [];

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Pressable onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>×</Text></Pressable>

      {photos.length ? (
        <View style={styles.galleryStack}>
          {photos.map((uri, idx) => <Image key={`${uri}-${idx}`} source={{ uri }} style={styles.galleryImage} />)}
        </View>
      ) : (
        <View style={styles.noPhoto}><Text style={{ color: "#9CA3AF" }}>Нет фото</Text></View>
      )}

      <View style={styles.sheet}>
        <View style={styles.topRow}>
          <Text style={styles.price}>${formatHousingPrice(item.minPrice)}</Text>
          {item.comment ? (
            <Pressable onPress={() => setCollapsed((v) => !v)} style={styles.toggleBtn}><Text style={styles.toggleBtnText}>{collapsed ? "Развернуть текст" : "Свернуть текст"}</Text></Pressable>
          ) : null}
        </View>

        <Pressable onPress={onOpenAddress}><Text style={styles.address}>{item.address}</Text></Pressable>
        {item.comment && !collapsed ? <Text style={styles.comment}>{item.comment}</Text> : null}

        <View style={styles.tagsRow}>
          {item.beds > 0 ? <Text style={styles.tag}>{item.beds} beds</Text> : null}
          {item.baths > 0 ? <Text style={styles.tag}>{item.baths} baths</Text> : null}
          <Text style={styles.tag}>{item.district || "LA"}</Text>
          <Text style={styles.tag}>{formatHousingType(item.type)}</Text>
        </View>

        {(item.telegram || item.messageContact) ? (
          <View style={styles.actionsRow}>
            {item.telegram ? <Pressable style={styles.actionBtn} onPress={onOpenTelegram}><Text style={styles.actionText}>Telegram</Text></Pressable> : null}
            {item.messageContact ? <Pressable style={styles.actionBtn} onPress={onOpenMessage}><Text style={styles.actionText}>Сообщение</Text></Pressable> : null}
          </View>
        ) : null}

        <View style={styles.iconRow}>
          <Pressable onPress={onToggleFavorite}><Text style={[styles.icon, isFavorite && styles.iconStarActive]}>★</Text></Pressable>
          <Pressable onPress={onToggleLike}><Text style={[styles.icon, isLiked && styles.iconLikeActive]}>♥ {item.likes || 0}</Text></Pressable>
          <Pressable onPress={onShare} style={{ marginLeft: "auto" }}><Text style={styles.share}>Поделиться</Text></Pressable>
        </View>

        {canManage ? <Pressable onPress={onEdit} style={styles.editBtn}><Text style={styles.editText}>Редактировать</Text></Pressable> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { paddingBottom: 120, backgroundColor: "#EFECE6" },
  backBtn: { position: "absolute", top: 14, left: 14, zIndex: 4, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 28, lineHeight: 28, color: "#222" },
  galleryStack: { width: "100%", backgroundColor: "#E9EDF2", marginTop: 58 },
  galleryImage: { width: "100%", minHeight: 240, maxHeight: 560, resizeMode: "cover" },
  noPhoto: { width: "100%", height: 260, alignItems: "center", justifyContent: "center", backgroundColor: "#E9EDF2", marginTop: 58 },
  sheet: { marginTop: -6, backgroundColor: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, borderWidth: 1, borderColor: "#E8E4DB", padding: 14 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  price: { fontSize: 28, fontWeight: "900", color: "#111827" },
  toggleBtn: { borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 6 },
  toggleBtnText: { color: "#374151", fontSize: 11, fontWeight: "600" },
  address: { marginTop: 6, fontSize: 16, fontWeight: "700", color: "#111827", textDecorationLine: "underline" },
  comment: { marginTop: 8, color: "#6B6B6B", fontSize: 13, lineHeight: 20 },
  tagsRow: { marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { backgroundColor: "#F3F4F6", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, color: "#6B6B6B" },
  actionsRow: { marginTop: 10, flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, minHeight: 38, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  actionText: { color: "#111827", fontSize: 12, fontWeight: "700" },
  iconRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 14 },
  icon: { color: "#6B6B6B", fontSize: 18 },
  iconStarActive: { color: "#D68910" },
  iconLikeActive: { color: "#E74C3C" },
  share: { color: "#6B6B6B", fontSize: 13, fontWeight: "600" },
  editBtn: { marginTop: 12, minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  editText: { color: "#111827", fontSize: 13, fontWeight: "700" },
});
