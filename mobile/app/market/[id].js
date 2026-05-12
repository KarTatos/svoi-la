import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActionSheetIOS,
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
import { MoreHorizontal, Phone, Send, Share2 } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useMarketQuery } from "../../src/hooks/useMarketQuery";
import { deleteMarketItem, recordMarketView } from "../../src/lib/market";
import { isSupabaseConfigured } from "../../src/lib/supabase";
import PhotoViewerModal from "../../src/components/PhotoViewerModal";

const SCREEN_W = Dimensions.get("window").width;
const SCREEN_H = Dimensions.get("window").height;
const PHOTO_H = Math.round(SCREEN_H * 0.50);

function formatPrice(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  return raw.startsWith("$") ? raw : "$" + raw;
}

export default function MarketDetailRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { data: items = [] } = useMarketQuery(isSupabaseConfigured);

  const item = useMemo(
    () => items.find((x) => String(x.id) === String(id)) || null,
    [items, id]
  );

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const viewMutation = useMutation({
    mutationFn: () => recordMarketView(id, user && user.id ? user.id : null),
    onSuccess: (count) => {
      queryClient.setQueryData(["market"], (prev) =>
        (prev || []).map((x) => String(x.id) === String(id) ? { ...x, views: count } : x)
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMarketItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market"] });
      router.back();
    },
  });

  useEffect(() => {
    if (id) viewMutation.mutate();
  }, [id]);

  if (!item) return <View style={styles.root} />;

  const photos = Array.isArray(item.photos) && item.photos.length ? item.photos : [];
  const price = formatPrice(item.price);
  const canManage = Boolean(user && (isAdmin || (item.userId && item.userId === user.id)));

  const openTelegram = () => {
    if (!item.telegram) return;
    Linking.openURL("https://t.me/" + String(item.telegram).replace(/^@/, ""));
  };

  const openPhone = () => {
    if (!item.phone) return;
    Linking.openURL("sms:" + item.phone);
  };

  const handleShare = () => {
    Share.share({
      title: item.title || "SVOI LA — Продам",
      message: item.title + (price ? " · " + price : ""),
    });
  };

  const confirmDelete = () => {
    Alert.alert("Удалить объявление?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      { text: "Удалить", style: "destructive", onPress: () => deleteMutation.mutate() },
    ]);
  };

  const handleMore = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Редактировать", "Удалить", "Отмена"], destructiveButtonIndex: 1, cancelButtonIndex: 2 },
        (idx) => {
          if (idx === 0) router.push({ pathname: "/market/add", params: { editId: String(id) } });
          if (idx === 1) confirmDelete();
        }
      );
    } else {
      confirmDelete();
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Photos */}
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
              <Text style={styles.noPhotoIcon}>🏷️</Text>
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
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title || "Без названия"}</Text>
            {canManage ? (
              <Pressable style={styles.moreBtn} onPress={handleMore}>
                <MoreHorizontal size={20} color="#636366" strokeWidth={2} />
              </Pressable>
            ) : null}
          </View>

          {price ? (
            <Text style={styles.price}>{price}</Text>
          ) : null}

          {item.author ? (
            <Text style={styles.author}>от {item.author}</Text>
          ) : null}

          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}

          <View style={styles.divider} />

          {/* Contact buttons */}
          <View style={styles.contactRow}>
            {item.telegram ? (
              <Pressable style={styles.contactBtn} onPress={openTelegram}>
                <Send size={22} color="#FFFFFF" strokeWidth={2} />
              </Pressable>
            ) : null}
            {item.phone ? (
              <Pressable style={styles.contactBtn} onPress={openPhone}>
                <Phone size={22} color="#FFFFFF" strokeWidth={2} />
              </Pressable>
            ) : null}
            {!item.telegram && !item.phone ? (
              <Text style={styles.noContact}>Контакты не указаны</Text>
            ) : null}
            <Pressable style={[styles.contactBtn, styles.contactBtnGhost]} onPress={handleShare}>
              <Share2 size={20} color="#636366" strokeWidth={2} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <PhotoViewerModal
        visible={viewerOpen}
        photos={photos}
        index={viewerIndex}
        onRequestClose={() => setViewerOpen(false)}
      />

      {/* Back button */}
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
  photoWrap: { width: SCREEN_W, height: PHOTO_H, backgroundColor: "#1C1C1E", position: "relative" },
  photo: { width: SCREEN_W, height: PHOTO_H },
  noPhoto: { flex: 1, alignItems: "center", justifyContent: "center" },
  noPhotoIcon: { fontSize: 60 },
  photoBadge: {
    position: "absolute", bottom: 12, right: 14,
    backgroundColor: "rgba(0,0,0,0.60)", borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  photoBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  infoCard: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -22,
    padding: 20,
    paddingBottom: 32,
  },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: "#FFFFFF", lineHeight: 26 },
  moreBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#2C2C2E", alignItems: "center", justifyContent: "center",
  },
  price: { marginTop: 8, fontSize: 28, fontWeight: "900", color: "#F47B20" },
  author: { marginTop: 6, fontSize: 13, color: "#636366" },
  description: { marginTop: 14, fontSize: 14, color: "#AEAEB2", lineHeight: 22 },
  divider: { height: 1, backgroundColor: "#2C2C2E", marginVertical: 18 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactBtn: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#2C2C2E",
  },
  contactBtnGhost: {
    marginLeft: "auto",
    backgroundColor: "#2C2C2E",
    borderColor: "transparent",
  },
  noContact: { color: "#48484A", fontSize: 13 },
  backOverlay: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: { paddingHorizontal: 16, paddingTop: 8 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.50)",
    alignItems: "center", justifyContent: "center",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#fff" },
});
