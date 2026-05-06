import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActionSheetIOS, Alert, Image, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import { useAuth } from "../../../src/hooks/useAuth";
import { usePlaceFavorites } from "../../../src/hooks/usePlaceFavorites";
import { deletePlace, fetchPlaces } from "../../../src/lib/places";
import {
  addPlaceComment,
  deletePlaceComment,
  fetchPlaceComments,
  recordPlaceView,
  updatePlaceComment,
} from "../../../src/lib/placesEngagement";
import { getDistrictById, getPlaceCatById } from "../../../src/config/places";
import { isSupabaseConfigured } from "../../../src/lib/supabase";
import PhotoViewerModal from "../../../src/components/PhotoViewerModal";

function formatPlaceAddressLabel(address = "") {
  const raw = String(address || "").trim();
  if (!raw) return "";
  const noState = raw.replace(/,\s*CA(?:\s+\d{5}(?:-\d{4})?)?$/i, "").trim();
  return noState.split(",")[0].trim();
}

export default function PlaceDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = usePlaceFavorites();
  const { id, district, category } = useLocalSearchParams();
  const districtId = String(district || "").toLowerCase();
  const categoryId = String(category || "").toLowerCase();
  const placeId = String(id || "");
  const selD = getDistrictById(districtId);
  const selPC = getPlaceCatById(categoryId);
  const viewedRef = useRef(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingText, setEditingText] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const { data: places = [] } = useQuery({
    queryKey: ["places"],
    queryFn: fetchPlaces,
    enabled: isSupabaseConfigured,
  });

  const place = useMemo(() => places.find((p) => String(p.id) === placeId) || null, [places, placeId]);

  const canManagePlace = useMemo(() => {
    if (!user || !place) return false;
    if (isAdmin) return true;
    return Boolean(place.userId && place.userId === user.id);
  }, [user, isAdmin, place]);

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["place-comments", placeId],
    queryFn: () => fetchPlaceComments(placeId),
    enabled: Boolean(placeId),
  });

  const favorite = isFavorite(placeId);

  const viewMutation = useMutation({
    mutationFn: () => recordPlaceView(placeId, user?.id || null),
    onSuccess: (viewsCount) => {
      queryClient.setQueryData(["places"], (prev = []) =>
        prev.map((p) => (String(p.id) === placeId ? { ...p, views: viewsCount } : p))
      );
    },
  });

  useEffect(() => {
    if (!placeId || viewedRef.current) return;
    viewedRef.current = true;
    viewMutation.mutate();
  }, [placeId]);

  const deletePlaceMutation = useMutation({
    mutationFn: () => deletePlace(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      router.push(`/places/${districtId}/${categoryId}`);
    },
    onError: (err) => {
      Alert.alert("Ошибка", err?.message || "Не удалось удалить место");
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (text) => addPlaceComment(placeId, user, text),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["place-comments", placeId] });
    },
    onError: (err) => {
      Alert.alert("Ошибка", err?.message || "Не удалось добавить мнение");
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, text }) => updatePlaceComment(commentId, text),
    onSuccess: () => {
      setEditingCommentId("");
      setEditingText("");
      queryClient.invalidateQueries({ queryKey: ["place-comments", placeId] });
    },
    onError: (err) => {
      Alert.alert("Ошибка", err?.message || "Не удалось сохранить мнение");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deletePlaceComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["place-comments", placeId] });
    },
    onError: (err) => {
      Alert.alert("Ошибка", err?.message || "Не удалось удалить мнение");
    },
  });

  const canEditComment = (comment) => {
    if (!user) return false;
    if (isAdmin) return true;
    return Boolean(comment?.userId && comment.userId === user.id);
  };

  const handleOpenMaps = () => {
    const address = place?.address || selD?.name || "Los Angeles";
    const query = encodeURIComponent(place?.name ? `${place.name}, ${address}` : address);
    const googleNativeUrl = `comgooglemaps://?q=${query}`;
    const googleWebUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    const appleUrl = `maps://?q=${query}`;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { title: address, options: ["Google Maps", "Apple Maps", "Отмена"] },
        async (index) => {
          if (index === 0) {
            const canOpen = await Linking.canOpenURL(googleNativeUrl);
            Linking.openURL(canOpen ? googleNativeUrl : googleWebUrl);
          } else if (index === 1) {
            Linking.openURL(appleUrl);
          }
        }
      );
    } else {
      Linking.openURL(googleWebUrl);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: place?.name || "SVOI LA",
        message: `${place?.name || "Место"}\n${place?.address || ""}`,
      });
    } catch {
      // ignore
    }
  };

  const handlePlaceMenu = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Редактировать", "Удалить", "Отмена"] },
        (index) => {
          if (index === 0) {
            router.push({
              pathname: "/places/add",
              params: { editId: placeId, district: districtId, category: categoryId },
            });
          } else if (index === 1) {
            Alert.alert(
              "Удалить место?",
              `«${place?.name || "Это место"}» будет удалено безвозвратно.`,
              [
                { text: "Отмена", style: "cancel" },
                { text: "Удалить", style: "destructive", onPress: () => deletePlaceMutation.mutate() },
              ]
            );
          }
        }
      );
    } else {
      Alert.alert("Управление местом", "", [
        { text: "Редактировать", onPress: () => router.push({ pathname: "/places/add", params: { editId: placeId, district: districtId, category: categoryId } }) },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () =>
            Alert.alert(
              "Удалить место?",
              `«${place?.name || "Это место"}» будет удалено безвозвратно.`,
              [
                { text: "Отмена", style: "cancel" },
                { text: "Удалить", style: "destructive", onPress: () => deletePlaceMutation.mutate() },
              ]
            ),
        },
        { text: "Отмена", style: "cancel" },
      ]);
    }
  };

  if (!place) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}><Text style={styles.empty}>Место не найдено.</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Top bar: back ‹ left, three dots ⋯ right */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push(`/places/${districtId}/${categoryId}`)} style={styles.topBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          {canManagePlace ? (
            <Pressable onPress={handlePlaceMenu} style={styles.topBtn}>
              <Text style={styles.dotsText}>•••</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.headRow}>
            <View style={styles.headLeft}>
              <Text style={styles.title}>{place.name}</Text>
              <Pressable onPress={handleOpenMaps}>
                <Text style={styles.addr}>{formatPlaceAddressLabel(place.address || selD?.name || "")}</Text>
              </Pressable>
              <Text style={styles.author}>от {place.addedBy || "пользователь"}</Text>
            </View>

            {/* Heart (placeholder for likes system) */}
            <View style={styles.pillCol}>
              <Pressable
                onPress={() => toggleFavorite(placeId)}
                style={[styles.pillBtn, favorite ? styles.heartActiveBg : styles.pillInactiveBg]}
              >
                <Text style={[styles.pillIcon, favorite ? styles.heartActiveColor : styles.pillInactiveColor]}>
                  {favorite ? "♥" : "♡"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.tipBox, { borderLeftColor: selPC?.color || "#F47B20" }]}>
            <Text style={styles.tip}>{place.tip || ""}</Text>
          </View>

          {Array.isArray(place.photos) && place.photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
              {place.photos.map((ph, i) => (
                <Pressable
                  key={`${place.id}-${i}`}
                  onPress={() => { setViewerIndex(i); setViewerOpen(true); }}
                >
                  <Image source={{ uri: ph }} style={styles.photo} />
                </Pressable>
              ))}
            </ScrollView>
          )}

          <View style={styles.opRow}>
            <Pressable onPress={() => setCommentsOpen((v) => !v)} style={styles.opBtn}>
              <Text style={styles.opText}>Мнения ({comments.length})</Text>
              <Text style={[styles.chevron, commentsOpen && styles.chevronOpen]}>▼</Text>
            </Pressable>

            {/* Share icon */}
            <Pressable onPress={handleShare} style={styles.shareBtn}>
              <View style={styles.shareIcon}>
                <Text style={styles.shareArrow}>↑</Text>
              </View>
            </Pressable>
          </View>

          {commentsOpen ? (
            <View style={styles.commentsWrap}>
              {commentsLoading ? <Text style={styles.muted}>Загрузка мнений...</Text> : null}
              {!commentsLoading && comments.length === 0 ? <Text style={styles.muted}>Пока нет мнений</Text> : null}

              {comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHead}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    {canEditComment(comment) ? (
                      <View style={styles.commentActions}>
                        <Pressable onPress={() => { setEditingCommentId(comment.id); setEditingText(comment.text || ""); }}>
                          <Text style={styles.commentActionText}>Изменить</Text>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            Alert.alert("Удалить мнение?", "", [
                              { text: "Отмена", style: "cancel" },
                              { text: "Удалить", style: "destructive", onPress: () => deleteCommentMutation.mutate(comment.id) },
                            ])
                          }
                        >
                          <Text style={[styles.commentActionText, styles.deleteText]}>Удалить</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>

                  {editingCommentId === comment.id ? (
                    <View style={styles.editRow}>
                      <TextInput
                        value={editingText}
                        onChangeText={setEditingText}
                        style={styles.input}
                        placeholder="Текст мнения"
                        multiline
                      />
                      <View style={styles.editBtnRow}>
                        <Pressable
                          style={[styles.saveBtn, !editingText.trim() && styles.saveBtnDisabled]}
                          disabled={!editingText.trim() || editCommentMutation.isPending}
                          onPress={() => editCommentMutation.mutate({ commentId: comment.id, text: editingText })}
                        >
                          <Text style={styles.saveBtnText}>
                            {editCommentMutation.isPending ? "Сохраняю..." : "Сохранить"}
                          </Text>
                        </Pressable>
                        <Pressable
                          style={styles.cancelBtn}
                          onPress={() => { setEditingCommentId(""); setEditingText(""); }}
                        >
                          <Text style={styles.cancelBtnText}>Отмена</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.commentText}>{comment.text}</Text>
                  )}
                </View>
              ))}

              {user ? (
                <View style={styles.newCommentWrap}>
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    style={styles.input}
                    placeholder="Оставьте мнение"
                    multiline
                  />
                  <Pressable
                    style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
                    onPress={() => addCommentMutation.mutate(commentText)}
                    disabled={!commentText.trim() || addCommentMutation.isPending}
                  >
                    <Text style={styles.sendBtnText}>
                      {addCommentMutation.isPending ? "Отправляю..." : "Отправить"}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => router.push("/login")} style={styles.loginBtn}>
                  <Text style={styles.loginBtnText}>Войти, чтобы оставить мнение</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <PhotoViewerModal
        visible={viewerOpen}
        photos={place.photos || []}
        index={viewerIndex}
        onRequestClose={() => setViewerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
  content: { padding: 16, paddingBottom: 130 },

  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  topBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5E5", backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 24, lineHeight: 24, color: "#6B6B6B" },
  dotsText: { fontSize: 11, letterSpacing: 1, color: "#6B6B6B", lineHeight: 14 },

  card: { backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", padding: 16 },
  headRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  headLeft: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
  addr: { marginTop: 5, fontSize: 13, color: "#6B6B6B", textDecorationLine: "underline" },
  author: { marginTop: 5, fontSize: 12, color: "#999" },

  pillCol: { flexDirection: "row", justifyContent: "flex-end", gap: 6 },
  pillBtn: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center" },
  pillIcon: { fontSize: 20 },
  heartActiveBg: { backgroundColor: "#FFF1F1" },
  heartActiveColor: { color: "#C0392B" },
  pillInactiveBg: { backgroundColor: "#F7F7F8" },
  pillInactiveColor: { color: "#AAAAAA" },

  tipBox: { marginTop: 12, padding: 12, backgroundColor: "#EFECE6", borderRadius: 10, borderLeftWidth: 3 },
  tip: { fontSize: 14, color: "#6B6B6B", lineHeight: 21 },
  photosRow: { marginTop: 12, gap: 8 },
  photo: { width: 120, height: 120, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5E5" },

  opRow: { marginTop: 12, flexDirection: "row", alignItems: "center" },
  opBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  opText: { fontSize: 13, fontWeight: "600", color: "#6B6B6B" },
  chevron: { fontSize: 10, color: "#9CA3AF" },
  chevronOpen: { transform: [{ rotate: "180deg" }] },
  shareBtn: { marginLeft: "auto" },
  shareIcon: { width: 32, height: 32, borderRadius: 8, borderWidth: 1.5, borderColor: "#D0CCC6", backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  shareArrow: { fontSize: 15, color: "#6B6B6B", fontWeight: "600", marginTop: -1 },

  commentsWrap: { marginTop: 10, gap: 8 },
  muted: { fontSize: 13, color: "#6B6B6B" },
  commentItem: { backgroundColor: "#F7F6F2", borderRadius: 10, padding: 10 },
  commentHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commentAuthor: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
  commentActions: { flexDirection: "row", gap: 10 },
  commentActionText: { fontSize: 12, color: "#6B6B6B" },
  deleteText: { color: "#B91C1C" },
  commentText: { marginTop: 4, fontSize: 13, color: "#4B5563" },
  editRow: { marginTop: 8, gap: 8 },
  editBtnRow: { flexDirection: "row", gap: 8 },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, backgroundColor: "#FFF", paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827" },
  saveBtn: { alignSelf: "flex-start", backgroundColor: "#111827", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 12 },
  cancelBtn: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  cancelBtnText: { color: "#6B6B6B", fontWeight: "600", fontSize: 12 },
  newCommentWrap: { gap: 8 },
  sendBtn: { alignSelf: "flex-start", backgroundColor: "#F47B20", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  sendBtnDisabled: { opacity: 0.55 },
  sendBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  loginBtn: { alignSelf: "flex-start", backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  loginBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  empty: { fontSize: 15, color: "#6B6B6B" },
});
