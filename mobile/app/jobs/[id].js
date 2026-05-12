import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Clock, Globe, Phone, X } from "lucide-react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useAuth } from "../../src/hooks/useAuth";
import { useJobQuery, useDeleteJob } from "../../src/hooks/useJobsQuery";
import { DISTRICTS } from "../../src/config/places";

const ACCENT = "#F47B20";
const COVER_H = 280;
const { width: SCREEN_W } = Dimensions.get("window");

const SCHEDULE_LABELS = {
  fulltime: "Полный день",
  parttime: "Частичная занятость",
  remote:   "Удалённо",
  contract: "Контракт",
  oneoff:   "Разовая работа",
};

const PRICE_TYPE_LABELS = {
  hourly:     "в час",
  fixed:      "фиксированно",
  negotiable: "договорная",
  monthly:    "в месяц",
};

const WORK_AUTH_LABELS = {
  any:      "Любой рабочий статус",
  citizen:  "Гражданство США",
  gc:       "Green Card",
  ead:      "EAD / Work Permit",
  ask:      "По запросу",
};

const ENGLISH_LABELS = {
  none:         "Английский не нужен",
  basic:        "Базовый",
  intermediate: "Средний",
  fluent:       "Свободный",
  native:       "Native / Родной",
};

function districtName(id) {
  return DISTRICTS.find(d => d.id === id)?.name || id || "";
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>{icon}</View>
      <View style={styles.infoBody}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showActionSheetWithOptions } = useActionSheet();
  const { data: job, isLoading, error } = useJobQuery(id);
  const deleteMutation = useDeleteJob();

  const [lightboxIndex, setLightboxIndex] = useState(null);

  const isOwner = user?.id && job?.user_id === user.id;
  const isVacancy = job?.type === "vacancy";
  const photos = Array.isArray(job?.photos) ? job.photos : [];
  const coverPhoto = photos[0] || null;
  const extraPhotos = photos.slice(1);

  const handleManageMenu = () => {
    showActionSheetWithOptions(
      {
        options: ["Редактировать", "Удалить", "Отмена"],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 2,
      },
      (index) => {
        if (index === 0) {
          router.push({ pathname: "/jobs/add", params: { editId: id } });
        } else if (index === 1) {
          Alert.alert(
            "Удалить объявление?",
            "Это действие нельзя отменить.",
            [
              { text: "Отмена", style: "cancel" },
              {
                text: "Удалить",
                style: "destructive",
                onPress: () => {
                  deleteMutation.mutate(id, {
                    onSuccess: () => router.back(),
                    onError: (e) => Alert.alert("Ошибка", e.message),
                  });
                },
              },
            ]
          );
        }
      }
    );
  };

  const handleTelegram = () => {
    if (!job?.telegram) return;
    const handle = job.telegram.replace(/^@/, "");
    Linking.openURL(`https://t.me/${handle}`).catch(() =>
      Alert.alert("Ошибка", "Не удалось открыть Telegram")
    );
  };

  const handlePhone = () => {
    if (!job?.phone) return;
    Linking.openURL(`tel:${job.phone}`).catch(() =>
      Alert.alert("Ошибка", "Не удалось позвонить")
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.loadWrap}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.loadWrap}>
          <Text style={styles.errorText}>Объявление не найдено</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtnLarge}>
            <Text style={styles.backBtnLargeTxt}>← Назад</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {/* ─── Sticky cover (not inside ScrollView) ─── */}
      {coverPhoto ? (
        <Pressable
          style={[styles.coverWrap, { paddingTop: insets.top }]}
          onPress={() => setLightboxIndex(0)}
        >
          <Image source={{ uri: coverPhoto }} style={styles.coverImg} resizeMode="cover" />
          {/* gradient overlay */}
          <View style={styles.coverGradient} />
        </Pressable>
      ) : (
        <View style={[styles.coverPlaceholder, { height: insets.top + 64 }]} />
      )}

      {/* ─── Floating header over cover ─── */}
      <View style={[styles.floatingHeader, { top: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.floatBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        {isOwner ? (
          <Pressable onPress={handleManageMenu} style={styles.floatBtn}>
            <Text style={styles.moreTxt}>⋯</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* ─── Scrollable content below cover ─── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Type badge + title */}
        <View style={styles.topSection}>
          <View style={[styles.typeBadge, isVacancy ? styles.vacancyBadge : styles.serviceBadge]}>
            <Text style={[styles.typeText, isVacancy ? styles.vacancyText : styles.serviceText]}>
              {isVacancy ? "💼 Вакансия" : "🔧 Услуга"}
            </Text>
          </View>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.authorLine}>{job.author || "Аноним"}</Text>
        </View>

        {/* Extra photos strip (photos[1], photos[2]) */}
        {extraPhotos.length > 0 ? (
          <View style={styles.extraPhotosSection}>
            <FlatList
              horizontal
              data={extraPhotos}
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.extraPhotosContent}
              renderItem={({ item, index }) => (
                <Pressable onPress={() => setLightboxIndex(index + 1)}>
                  <Image
                    source={{ uri: item }}
                    style={styles.extraPhoto}
                    resizeMode="cover"
                  />
                </Pressable>
              )}
            />
          </View>
        ) : null}

        <View style={styles.divider} />

        {/* Info rows */}
        <View style={styles.infoSection}>
          <InfoRow
            icon={<MapPin size={16} color={ACCENT} strokeWidth={2} />}
            label="Район"
            value={districtName(job.district)}
          />
          {isVacancy && (
            <>
              <InfoRow
                icon={<Clock size={16} color={ACCENT} strokeWidth={2} />}
                label="График"
                value={SCHEDULE_LABELS[job.schedule] || job.schedule}
              />
              <InfoRow
                icon={<Globe size={16} color={ACCENT} strokeWidth={2} />}
                label="Английский"
                value={ENGLISH_LABELS[job.english_lvl] || job.english_lvl}
              />
              <InfoRow
                icon={<Globe size={16} color={ACCENT} strokeWidth={2} />}
                label="Рабочий статус"
                value={WORK_AUTH_LABELS[job.work_auth] || job.work_auth}
              />
            </>
          )}
          {job.price ? (
            <InfoRow
              icon={<Text style={{ fontSize: 16 }}>💰</Text>}
              label="Оплата"
              value={
                job.price +
                (job.price_type && PRICE_TYPE_LABELS[job.price_type]
                  ? " · " + PRICE_TYPE_LABELS[job.price_type]
                  : "")
              }
            />
          ) : null}
        </View>

        {/* Description */}
        {job.description ? (
          <>
            <View style={styles.divider} />
            <View style={styles.descSection}>
              <Text style={styles.descLabel}>Описание</Text>
              <Text style={styles.descText}>{job.description}</Text>
            </View>
          </>
        ) : null}

        {/* Contact buttons */}
        <View style={styles.contactSection}>
          {job.telegram ? (
            <Pressable style={[styles.contactBtn, styles.telegramBtn]} onPress={handleTelegram}>
              <Text style={styles.contactBtnText}>✈️  Написать в Telegram</Text>
            </Pressable>
          ) : null}
          {job.phone ? (
            <Pressable style={[styles.contactBtn, styles.phoneBtn]} onPress={handlePhone}>
              <Phone size={18} color={ACCENT} strokeWidth={2.5} />
              <Text style={[styles.contactBtnText, styles.phoneBtnText]}>{job.phone}</Text>
            </Pressable>
          ) : null}
          {!job.telegram && !job.phone ? (
            <Text style={styles.noContact}>Контакт не указан</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* ─── Lightbox modal ─── */}
      <Modal
        visible={lightboxIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxIndex(null)}
      >
        <View style={styles.lightbox}>
          <Pressable style={styles.lightboxClose} onPress={() => setLightboxIndex(null)}>
            <X size={24} color="#fff" strokeWidth={2.5} />
          </Pressable>

          <FlatList
            data={photos}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={lightboxIndex ?? 0}
            getItemLayout={(_, index) => ({ length: SCREEN_W, offset: SCREEN_W * index, index })}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.lightboxImg}
                resizeMode="contain"
              />
            )}
          />

          {photos.length > 1 ? (
            <View style={styles.lightboxDots}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, lightboxIndex === i && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAF8" },
  loadWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  errorText: { fontSize: 16, color: "#6B7280" },
  backBtnLarge: { paddingHorizontal: 20, paddingVertical: 10 },
  backBtnLargeTxt: { fontSize: 16, color: ACCENT, fontWeight: "700" },

  // Cover
  coverWrap: {
    height: COVER_H,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  coverImg: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
  },
  coverGradient: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
    // visual gradient via opacity overlay
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  coverPlaceholder: {
    height: 56,
    backgroundColor: "#F3F0EA",
  },

  // Floating header
  floatingHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  floatBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.40)",
    alignItems: "center", justifyContent: "center",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#fff" },
  moreTxt: { fontSize: 20, color: "#fff", letterSpacing: 1 },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 0 },

  topSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, gap: 8 },
  typeBadge: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  vacancyBadge: { backgroundColor: "#EEF6FF" },
  serviceBadge: { backgroundColor: "#F0FFF4" },
  typeText: { fontSize: 12, fontWeight: "700" },
  vacancyText: { color: "#2563EB" },
  serviceText: { color: "#16A34A" },
  title: { fontSize: 22, fontWeight: "900", color: "#111827", lineHeight: 28 },
  authorLine: { fontSize: 14, color: "#6B7280", fontWeight: "500" },

  // Extra photos
  extraPhotosSection: { marginBottom: 4 },
  extraPhotosContent: { paddingHorizontal: 20, gap: 10 },
  extraPhoto: {
    width: 120, height: 90, borderRadius: 12, overflow: "hidden",
  },

  divider: { height: 1, backgroundColor: "#F0EDE8", marginHorizontal: 20, marginVertical: 4 },

  infoSection: { paddingHorizontal: 20, paddingVertical: 12, gap: 14 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  infoIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#FFF3E8", alignItems: "center", justifyContent: "center" },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 15, color: "#111827", fontWeight: "600" },

  descSection: { paddingHorizontal: 20, paddingVertical: 16 },
  descLabel: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 8 },
  descText: { fontSize: 15, color: "#4B5563", lineHeight: 24 },

  contactSection: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  contactBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, borderRadius: 16, paddingVertical: 16,
  },
  telegramBtn: { backgroundColor: "#2AABEE" },
  phoneBtn: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#FDE3C8" },
  contactBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  phoneBtnText: { color: ACCENT },
  noContact: { textAlign: "center", color: "#9CA3AF", fontSize: 14, paddingTop: 8 },

  // Lightbox
  lightbox: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  lightboxClose: {
    position: "absolute", top: 56, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    zIndex: 10,
  },
  lightboxImg: { width: SCREEN_W, height: "100%" },
  lightboxDots: {
    position: "absolute", bottom: 48,
    left: 0, right: 0,
    flexDirection: "row", justifyContent: "center", gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" },
  dotActive: { backgroundColor: "#fff", width: 18 },
});
