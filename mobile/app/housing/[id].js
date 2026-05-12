import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, MapPin, MoreHorizontal, Share2 } from "lucide-react-native";
import { ActionSheetIOS } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useHousingFavorites } from "../../src/hooks/useHousingFavorites";
import { useHousingQuery } from "../../src/hooks/useHousingQuery";
import { deleteHousing, recordHousingView } from "../../src/lib/housing";
import { isSupabaseConfigured } from "../../src/lib/supabase";
import PhotoViewerModal from "../../src/components/PhotoViewerModal";

const SCREEN_W = Dimensions.get("window").width;
const SCREEN_H = Dimensions.get("window").height;
const PHOTO_H = Math.round(SCREEN_H * 0.52);

function getTypeLabel(type) {
  const map = { studio: "Studio", room: "Комната", "1bd": "1 bd", "2bd": "2 bd", "3bd": "3+ bd" };
  return map[String(type || "").toLowerCase()] || type || "Жильё";
}

export default function HousingDetailRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useHousingFavorites();
  const { data: items = [] } = useHousingQuery(isSupabaseConfigured);

  const item = useMemo(
    () => items.find((x) => String(x.id) === String(id)) || null,
    [items, id]
  );

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const viewMutation = useMutation({
    mutationFn: () => recordHousingView(id, user?.id || null),
    onSuccess: (viewsCount) => {
      queryClient.setQueryData(["housing"], (prev = []) =>
        prev.map((h) => (String(h.id) === String(id) ? { ...h, views: viewsCount } : h))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteHousing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["housing"] });
      router.back();
    },
  });

  useEffect(() => {
    if (id) viewMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!item) {
    return <View style={styles.root} />;
  }

  const photos =
    Array.isArray(item.photos) && item.photos.length
      ? item.photos
      : item.photo
      ? [item.photo]
      : [];

  const canManage = Boolean(user && (isAdmin || (item.userId && item.userId === user.id)));
  const favorited = isFavorite(item.id);

  const openTelegram = () => {
    if (!item.telegram) return;
    Linking.openURL(`https://t.me/${String(item.telegram).replace(/^@/, "")}`);
  };

  const openMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        item.address || "Los Angeles"
      )}`
    );
  };

  const handleShare = () => {
    Share.share({
      title: item.title || "SVOI LA — Жильё",
      message: `${item.address} · ${item.minPrice ? `$${item.minPrice}` : ""}`,
    });
  };

  const handleMore = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Редактировать", "Удалить", "Отмена"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (idx) => {
          if (idx === 0)
            router.push({ pathname: "/housing/add", params: { editId: String(id) } });
          if (idx === 1) confirmDelete();
        }
      );
    } else {
      confirmDelete();
    }
  };

  const confirmDelete = () => {
    Alert.alert("Удалить объявление?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo gallery */}
        <View style={styles.photoWrap}>
          {photos.length > 0 ? (
            <FlatList
              data={photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item: uri, index: idx }) => (
                <Pressable onPress={() => { setViewerIndex(idx); setViewerOpen(true); }}>
                  <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
                </Pressable>
              )}
            />
          ) : (
            <View style={styles.noPhoto}>
              <Text style={styles.noPhotoIcon}>🏠</Text>
            </View>
          )}
          {photos.length > 1 ? (
            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>{photos.length} фото</Text>
            </View>
          ) : null}
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          {/* Price + type */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {item.minPrice > 0
                ? `$${item.minPrice.toLocaleString("en-US")}/mo`
                : "Цена не указана"}
            </Text>
            <View style={styles.typeChip}>
              <Text style={styles.typeText}>{getTypeLabel(item.type)}</Text>
            </View>
          </View>

          {/* Address */}
          <Pressable style={styles.addressRow} onPress={openMaps}>
            <MapPin size={14} color="#AEAEB2" strokeWidth={2} />
            <Text style={styles.address}>{item.address || "Los Angeles"}</Text>
          </Pressable>

          {/* Chips */}
          {(item.beds > 0 || item.baths > 0 || item.district) ? (
            <View style={styles.chipsRow}>
              {item.beds > 0 ? (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{item.beds} bd</Text>
                </View>
              ) : null}
              {item.baths > 0 ? (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{item.baths} ba</Text>
                </View>
              ) : null}
              {item.district ? (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{item.district}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Comment */}
          {item.comment ? (
            <Text style={styles.comment}>{item.comment}</Text>
          ) : null}

          <View style={styles.divider} />

          {/* Telegram / contact */}
          {item.telegram ? (
            <Pressable style={styles.telegramBtn} onPress={openTelegram}>
              <Text style={styles.telegramText}>✈ Написать в Telegram</Text>
            </Pressable>
          ) : (
            <View style={styles.noContact}>
              <Text style={styles.noContactText}>Контакт не указан</Text>
            </View>
          )}

          {/* Bottom icons */}
          <View style={styles.bottomRow}>
            <Pressable style={styles.iconBtn} onPress={() => toggleFavorite(item.id)}>
              <Heart
                size={22}
                color={favorited ? "#F47B20" : "#636366"}
                fill={favorited ? "#F47B20" : "none"}
                strokeWidth={2}
              />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={handleShare}>
              <Share2 size={22} color="#636366" strokeWidth={2} />
            </Pressable>
            {canManage ? (
              <Pressable style={[styles.iconBtn, styles.moreBtnRight]} onPress={handleMore}>
                <MoreHorizontal size={22} color="#AEAEB2" strokeWidth={2} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <PhotoViewerModal
        visible={viewerOpen}
        photos={photos}
        index={viewerIndex}
        onRequestClose={() => setViewerOpen(false)}
      />

      {/* Back button overlay */}
      <View style={styles.backOverlay} pointerEvents="box-none">
        <SafeAreaView edges={["top"]} style={{ pointerEvents: "box-none" }}>
          <View style={styles.headerRow} pointerEvents="box-none">
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backTxt}>‹</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D0F" },
  scroll: { paddingBottom: 60 },
  photoWrap: {
    width: SCREEN_W,
    height: PHOTO_H,
    backgroundColor: "#1C1C1E",
    position: "relative",
  },
  photo: { width: SCREEN_W, height: PHOTO_H },
  noPhoto: { flex: 1, alignItems: "center", justifyContent: "center" },
  noPhotoIcon: { fontSize: 60 },
  photoBadge: {
    position: "absolute",
    bottom: 12,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.60)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  photoBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  infoCard: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -22,
    padding: 20,
    paddingBottom: 32,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  price: { fontSize: 28, fontWeight: "900", color: "#FFFFFF", flex: 1 },
  typeChip: {
    backgroundColor: "#F47B20",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  typeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  address: { color: "#AEAEB2", fontSize: 14, flex: 1 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { color: "#8E8E93", fontSize: 13, fontWeight: "600" },
  comment: {
    marginTop: 14,
    color: "#AEAEB2",
    fontSize: 14,
    lineHeight: 22,
  },
  divider: { height: 1, backgroundColor: "#2C2C2E", marginVertical: 18 },
  telegramBtn: {
    backgroundColor: "#229ED9",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  telegramText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.2 },
  noContact: { height: 52, alignItems: "center", justifyContent: "center" },
  noContactText: { color: "#48484A", fontSize: 13 },
  bottomRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
  },
  moreBtnRight: { marginLeft: "auto" },

  backOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.50)",
    alignItems: "center",
    justifyContent: "center",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#fff" },
});
