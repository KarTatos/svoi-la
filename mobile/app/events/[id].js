import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActionSheet } from "@expo/react-native-action-sheet";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, Heart, MapPin, Share2, Users } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { fetchEventById, fetchEventAttendees, toggleAttendee, deleteEvent } from "../../src/lib/events";
import { isSupabaseConfigured } from "../../src/lib/supabase";

const ACCENT = "#F47B20";
const COVER_H = 300;
// BottomNav height: pill(56) + paddingBottom(10) = 66px above safe area
const BOTTOM_NAV_H = 66;

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    weekday: "long", day: "numeric", month: "long",
  }) + " · " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function AvatarStack({ attendees = [] }) {
  const visible = attendees.slice(0, 4);
  const extra = attendees.length > 4 ? attendees.length - 4 : 0;
  if (attendees.length === 0) return null;
  return (
    <View style={av.row}>
      {visible.map((a, i) => (
        <View key={a.id ?? i} style={[av.bubble, { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }]}>
          {a.avatar_url ? (
            <Image source={{ uri: a.avatar_url }} style={av.img} />
          ) : (
            <View style={[av.img, av.letter]}>
              <Text style={av.letterText}>{(a.name || "?")[0].toUpperCase()}</Text>
            </View>
          )}
        </View>
      ))}
      {extra > 0 && (
        <View style={[av.bubble, av.more, { marginLeft: -10 }]}>
          <Text style={av.moreText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { showActionSheetWithOptions } = useActionSheet();
  const [descExpanded, setDescExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [attending, setAttending] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEventById(id),
    enabled: Boolean(id) && isSupabaseConfigured,
  });

  const { data: attendees = [] } = useQuery({
    queryKey: ["event-attendees", id],
    queryFn: () => fetchEventAttendees(id),
    enabled: Boolean(id) && isSupabaseConfigured,
  });

  useEffect(() => {
    if (!user?.id || !attendees.length) return;
    setAttending(attendees.some((a) => a.user_id === user.id));
  }, [attendees, user?.id]);

  const attendMutation = useMutation({
    mutationFn: () => toggleAttendee(id, user),
    onMutate: () => setAttending((v) => !v),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-attendees", id] });
    },
    onError: () => {
      setAttending((v) => !v);
      Alert.alert("Ошибка", "Не удалось обновить участие");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.back();
    },
    onError: (err) => Alert.alert("Ошибка", err?.message || "Не удалось удалить"),
  });

  const canManage = useMemo(() => {
    if (!user || !event) return false;
    return isAdmin || event.user_id === user.id;
  }, [user, isAdmin, event]);

  const handleAttend = () => {
    if (!user) { router.push("/login"); return; }
    attendMutation.mutate();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: event?.title || "Событие",
        message: `${event?.title || ""}\n${event?.location || ""}\n${formatDateTime(event?.date)}`,
      });
    } catch {}
  };

  const handleManageMenu = () => {
    showActionSheetWithOptions(
      {
        options: ["Редактировать", "Удалить", "Отмена"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 2,
      },
      (index) => {
        if (index === 0) {
          router.push({ pathname: "/events/add", params: { editId: id } });
        } else if (index === 1) {
          Alert.alert("Удалить событие?", "Это действие нельзя отменить.", [
            { text: "Отмена", style: "cancel" },
            { text: "Удалить", style: "destructive", onPress: () => deleteMutation.mutate() },
          ]);
        }
      }
    );
  };

  if (isLoading || !event) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  const desc = event.description || "";
  const descShort = desc.length > 160;
  const displayDesc = descExpanded || !descShort ? desc : desc.slice(0, 160) + "…";
  const dateStr = formatDateTime(event.date);

  // Total bottom padding: safe area + BottomNav height + breathing room
  const bottomPad = insets.bottom + BOTTOM_NAV_H + 16;

  return (
    <View style={styles.root}>

      {/* ── Hero cover — FIXED, does not scroll ── */}
      <View style={styles.coverWrap}>
        {event.cover_url ? (
          <Image source={{ uri: event.cover_url }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Text style={styles.placeholderIcon}>🎉</Text>
          </View>
        )}
        <View style={styles.coverGradient} />
      </View>

      {/* ── Floating nav buttons — FIXED on top ── */}
      <View style={[styles.floatRow, { top: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.floatBtn}>
          <Text style={styles.floatBtnText}>‹</Text>
        </Pressable>
        <View style={styles.floatRight}>
          <Pressable onPress={handleShare} style={styles.floatBtn}>
            <Share2 size={18} color="#1F2937" strokeWidth={2.2} />
          </Pressable>
          {canManage && (
            <Pressable onPress={handleManageMenu} style={styles.floatBtn}>
              <Text style={{ fontSize: 18, color: "#1F2937", fontWeight: "700", lineHeight: 20 }}>⋯</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Content scrolls over the fixed image ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: COVER_H - 24, paddingBottom: bottomPad + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          {/* Title + price */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
            {event.price ? (
              <View style={styles.priceBox}>
                <Text style={styles.priceValue}>{event.price}</Text>
              </View>
            ) : null}
          </View>

          {/* Date */}
          <View style={styles.metaRow}>
            <View style={styles.metaIcon}>
              <Calendar size={16} color={ACCENT} strokeWidth={2.2} />
            </View>
            <Text style={styles.metaText}>{dateStr}</Text>
          </View>

          {/* Location */}
          {event.location ? (
            <View style={styles.metaRow}>
              <View style={styles.metaIcon}>
                <MapPin size={16} color={ACCENT} strokeWidth={2.2} />
              </View>
              <Text style={styles.metaText}>{event.location}{event.address ? `, ${event.address}` : ""}</Text>
            </View>
          ) : null}

          {/* Organizer */}
          {event.organizer || event.author ? (
            <View style={styles.metaRow}>
              <View style={styles.metaIcon}>
                <Users size={16} color={ACCENT} strokeWidth={2.2} />
              </View>
              <Text style={styles.metaText}>Организатор: {event.organizer || event.author}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          {/* Photo gallery strip */}
          {Array.isArray(event.photos) && event.photos.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Фото</Text>
              <FlatList
                data={event.photos}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(url, i) => `${url}-${i}`}
                ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.galleryPhoto}
                    resizeMode="cover"
                  />
                )}
              />
            </View>
          ) : null}

          {/* Description */}
          {desc ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>О событии</Text>
              <Text style={styles.descText}>{displayDesc}</Text>
              {descShort && (
                <Pressable onPress={() => setDescExpanded((v) => !v)}>
                  <Text style={styles.readMore}>
                    {descExpanded ? "Свернуть" : "Читать далее..."}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null}

          {/* Attendees */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Участники</Text>
            <View style={styles.attendeesRow}>
              <AvatarStack attendees={attendees} />
              <View style={styles.attendeesInfo}>
                <Text style={styles.attendeesCount}>
                  {attendees.length > 0
                    ? `${attendees.length} ${attendees.length === 1 ? "участник" : attendees.length < 5 ? "участника" : "участников"}`
                    : "Будь первым!"}
                </Text>
                <Text style={styles.attendeesSub}>
                  {attending ? "Вы идёте 🎉" : "Присоединяйся"}
                </Text>
              </View>
            </View>
          </View>

          {/* External link */}
          {event.url ? (
            <View style={styles.section}>
              <Pressable
                style={styles.linkBtn}
                onPress={() => {
                  const { Linking } = require("react-native");
                  Linking.openURL(event.url);
                }}
              >
                <Text style={styles.linkBtnText}>Открыть страницу события ↗</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* ── Bottom CTA — always visible above BottomNav ── */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
        <Pressable
          style={[styles.attendBtn, attending && styles.attendBtnActive]}
          onPress={handleAttend}
          disabled={attendMutation.isPending}
        >
          <Text style={[styles.attendBtnText, attending && styles.attendBtnTextActive]}>
            {attendMutation.isPending ? "..." : attending ? "Я иду ✓" : "Иду"}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.saveBtn, saved && styles.saveBtnActive]}
          onPress={() => setSaved((v) => !v)}
        >
          <Heart
            size={22}
            color={saved ? "#fff" : ACCENT}
            fill={saved ? "#fff" : "none"}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>
    </View>
  );
}

const av = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  bubble: { width: 36, height: 36, borderRadius: 18, borderWidth: 2.5, borderColor: "#fff", overflow: "hidden" },
  img: { width: 31, height: 31, borderRadius: 16 },
  letter: { backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },
  letterText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  more: { backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  moreText: { fontSize: 11, fontWeight: "700", color: "#374151" },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAF8" },

  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAF8" },
  loadingText: { color: "#9CA3AF", fontSize: 15 },

  // ── Fixed hero image ──
  coverWrap: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: COVER_H,
    zIndex: 0,
  },
  cover: { width: "100%", height: COVER_H },
  coverPlaceholder: { backgroundColor: "#F3F0EA", alignItems: "center", justifyContent: "center" },
  placeholderIcon: { fontSize: 64 },
  coverGradient: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: "rgba(250,250,248,0.3)",
  },

  // ── Floating nav buttons (fixed, above everything) ──
  floatRow: {
    position: "absolute", left: 16, right: 16,
    zIndex: 10,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  floatRight: { flexDirection: "row", gap: 8 },
  floatBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  floatBtnText: { fontSize: 24, lineHeight: 24, color: "#1F2937", fontWeight: "500" },

  // ── Scrollable area ──
  scroll: {
    flex: 1,
    zIndex: 1,
  },

  // ── Content card (slides up over fixed image) ──
  content: {
    backgroundColor: "#FAFAF8",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: 400,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 28,
  },
  priceBox: {
    backgroundColor: "#FFF3E8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 70,
    borderWidth: 1,
    borderColor: "#FDE3C8",
  },
  priceValue: { fontSize: 16, fontWeight: "800", color: ACCENT },

  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  metaIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: "#FFF3E8",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  metaText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    lineHeight: 20,
    paddingTop: 6,
  },

  divider: { height: 1, backgroundColor: "#F0EDE8", marginVertical: 16 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 10 },
  descText: { fontSize: 14, color: "#4B5563", lineHeight: 22 },
  readMore: { marginTop: 6, fontSize: 14, color: ACCENT, fontWeight: "600" },

  attendeesRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  attendeesInfo: { flex: 1 },
  attendeesCount: { fontSize: 15, fontWeight: "700", color: "#111827" },
  attendeesSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  galleryPhoto: {
    width: 160, height: 120, borderRadius: 12,
    backgroundColor: "#F3F0EA",
  },

  linkBtn: {
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
    paddingVertical: 13, alignItems: "center",
  },
  linkBtnText: { fontSize: 14, fontWeight: "600", color: "#374151" },

  // ── Bottom CTA (floats above BottomNav) ──
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    zIndex: 5,
    backgroundColor: "#FAFAF8",
    borderTopWidth: 1, borderTopColor: "#F0EDE8",
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  attendBtn: {
    flex: 1, height: 52, borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: "center", justifyContent: "center",
    shadowColor: ACCENT, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  attendBtnActive: {
    backgroundColor: "#111827",
    shadowColor: "#000",
  },
  attendBtnText: { fontSize: 17, fontWeight: "800", color: "#fff" },
  attendBtnTextActive: { color: "#fff" },
  saveBtn: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "#FFF3E8",
    borderWidth: 1.5, borderColor: "#FDE3C8",
    alignItems: "center", justifyContent: "center",
  },
  saveBtnActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
});
