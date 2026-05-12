import { useCallback, useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Clock, ImagePlus } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { createEvent, updateEvent, fetchEventById, uploadEventPhotos } from "../../src/lib/events";
import PlacePhotoPicker from "../../src/components/places/PlacePhotoPicker";

const ACCENT = "#F47B20";

const CATEGORIES = [
  { id: "community",  label: "🤝 Сообщество" },
  { id: "culture",    label: "🎭 Культура" },
  { id: "education",  label: "📚 Обучение" },
  { id: "sport",      label: "⚽ Спорт" },
  { id: "food",       label: "🍕 Еда" },
  { id: "music",      label: "🎵 Музыка" },
  { id: "networking", label: "💼 Нетворкинг" },
  { id: "outdoor",    label: "🏕️ Активный отдых" },
  { id: "other",      label: "✨ Другое" },
];

function formatDateDisplay(d) {
  if (!d) return "";
  return d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function formatTimeDisplay(d) {
  if (!d) return "";
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

const EMPTY_FORM = {
  title: "",
  category: "",
  date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
  location: "",
  address: "",
  description: "",
  price: "",
  organizer: "",
  url: "",
  photos: [],
};

const BOTTOM_NAV_H = 66;

export default function EventAddScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { editId } = useLocalSearchParams();
  const isEditMode = Boolean(editId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState("");

  // Загружаем данные события при редактировании
  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    fetchEventById(editId)
      .then((event) => {
        if (!event) return;
        setForm({
          title:       event.title || "",
          category:    event.category || "",
          date:        event.date ? new Date(event.date) : new Date(Date.now() + 24 * 60 * 60 * 1000),
          location:    event.location || "",
          address:     event.address || "",
          description: event.description || "",
          price:       event.price || "",
          organizer:   event.organizer || "",
          url:         event.url || "",
          photos:      [],  // новые фото; существующие показываем отдельно
          existingPhotos: Array.isArray(event.photos) ? event.photos : [],
        });
      })
      .catch(() => setError("Не удалось загрузить событие"))
      .finally(() => setLoading(false));
  }, [editId]);

  // Pickers visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const set = useCallback((key, value) => setForm((prev) => ({ ...prev, [key]: value })), []);

  const handleDateChange = (_, selected) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (!selected) return;
    // Merge new date keeping existing time
    const merged = new Date(selected);
    merged.setHours(form.date.getHours(), form.date.getMinutes(), 0, 0);
    set("date", merged);
  };

  const handleTimeChange = (_, selected) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (!selected) return;
    const merged = new Date(form.date);
    merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    set("date", merged);
  };

  const handleSave = async () => {
    if (!user) { router.push("/login"); return; }

    const title = String(form.title || "").trim();
    if (!title) { setError("Укажите название события"); return; }

    setSaving(true);
    setError("");
    try {
      // Загружаем новые фото
      let newUrls = [];
      if (form.photos.length > 0) {
        newUrls = await uploadEventPhotos(form.photos);
      }

      // В режиме редактирования сохраняем старые фото + новые
      const allPhotos = isEditMode
        ? [...(form.existingPhotos || []), ...newUrls]
        : newUrls;

      const payload = {
        title,
        date:        form.date.toISOString(),
        category:    form.category || null,
        location:    String(form.location || "").trim() || null,
        address:     String(form.address || "").trim() || null,
        description: String(form.description || "").trim() || null,
        price:       String(form.price || "").trim() || "Бесплатно",
        organizer:   String(form.organizer || "").trim() || null,
        url:         String(form.url || "").trim() || null,
        cover_url:   allPhotos[0] || null,
        photos:      allPhotos,
      };

      if (isEditMode) {
        await updateEvent(editId, payload);
        queryClient.invalidateQueries({ queryKey: ["events"] });
        queryClient.invalidateQueries({ queryKey: ["event", editId] });
        router.back();
      } else {
        await createEvent({
          ...payload,
          user_id: user.id,
          author: user.name || user.email?.split("@")[0] || "Участник",
          is_published: true,
        });
        queryClient.invalidateQueries({ queryKey: ["events"] });
        router.back();
      }
    } catch (e) {
      setError(e?.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} disabled={saving}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{isEditMode ? "Редактировать" : "Новое событие"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + BOTTOM_NAV_H + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.label}>Название *</Text>
          <TextInput
            value={form.title}
            onChangeText={(v) => set("title", v.slice(0, 100))}
            placeholder="Название события"
            style={styles.input}
            returnKeyType="next"
          />
          <Text style={styles.charCount}>{form.title.length}/100</Text>

          {/* Photos */}
          <Text style={styles.label}>Фотографии (до 3)</Text>
          <PlacePhotoPicker
            photos={form.photos}
            onChange={(p) => set("photos", p)}
            disabled={saving}
            max={3}
          />

          {/* Category */}
          <Text style={styles.label}>Категория</Text>
          <Pressable style={styles.selectBtn} onPress={() => setCatOpen(true)}>
            <Text style={[styles.selectText, !form.category && styles.selectPlaceholder]}>
              {CATEGORIES.find((c) => c.id === form.category)?.label || "Выберите категорию"}
            </Text>
          </Pressable>

          {/* Date & Time */}
          <Text style={styles.label}>Дата и время *</Text>
          <View style={styles.dtRow}>
            <Pressable style={[styles.dtBtn, { flex: 1.6 }]} onPress={() => setShowDatePicker(true)}>
              <Calendar size={15} color={ACCENT} strokeWidth={2.3} />
              <Text style={styles.dtText}>{formatDateDisplay(form.date)}</Text>
            </Pressable>
            <Pressable style={[styles.dtBtn, { flex: 0.9 }]} onPress={() => setShowTimePicker(true)}>
              <Clock size={15} color={ACCENT} strokeWidth={2.3} />
              <Text style={styles.dtText}>{formatTimeDisplay(form.date)}</Text>
            </Pressable>
          </View>

          {/* iOS inline pickers shown conditionally */}
          {showDatePicker && (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={form.date}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={handleDateChange}
                minimumDate={new Date()}
                themeVariant="light"
                accentColor={ACCENT}
              />
              {Platform.OS === "ios" && (
                <Pressable style={styles.pickerDone} onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerDoneText}>Готово</Text>
                </Pressable>
              )}
            </View>
          )}

          {showTimePicker && (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={form.date}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
                themeVariant="light"
                accentColor={ACCENT}
              />
              {Platform.OS === "ios" && (
                <Pressable style={styles.pickerDone} onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerDoneText}>Готово</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Location */}
          <Text style={styles.label}>Место проведения</Text>
          <TextInput
            value={form.location}
            onChangeText={(v) => set("location", v)}
            placeholder="Название места (кафе, парк, зал...)"
            style={styles.input}
            returnKeyType="next"
          />

          {/* Address */}
          <Text style={styles.label}>Адрес</Text>
          <TextInput
            value={form.address}
            onChangeText={(v) => set("address", v)}
            placeholder="Полный адрес (необязательно)"
            style={styles.input}
            returnKeyType="next"
          />

          {/* Organizer */}
          <Text style={styles.label}>Организатор</Text>
          <TextInput
            value={form.organizer}
            onChangeText={(v) => set("organizer", v)}
            placeholder="Имя, организация или telegram"
            style={styles.input}
            returnKeyType="next"
          />

          {/* Price */}
          <Text style={styles.label}>Вход</Text>
          <TextInput
            value={form.price}
            onChangeText={(v) => set("price", v)}
            placeholder="Бесплатно / $10 / Donation"
            style={styles.input}
            returnKeyType="next"
          />

          {/* URL */}
          <Text style={styles.label}>Ссылка на событие</Text>
          <TextInput
            value={form.url}
            onChangeText={(v) => set("url", v)}
            placeholder="https://eventbrite.com/..."
            style={styles.input}
            autoCapitalize="none"
            keyboardType="url"
            returnKeyType="next"
          />

          {/* Description */}
          <Text style={styles.label}>Описание</Text>
          <TextInput
            value={form.description}
            onChangeText={(v) => set("description", v.slice(0, 1000))}
            placeholder="Подробности, программа, что взять с собой..."
            style={[styles.input, styles.textarea]}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{form.description.length}/1000</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Buttons */}
          <View style={styles.btnRow}>
            <Pressable
              style={[styles.btn, styles.btnGhost]}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.btnGhostText}>Отмена</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary, saving && styles.btnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>{isEditMode ? "Сохранить" : "Опубликовать"}</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category picker modal */}
      <Modal
        visible={catOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCatOpen(false)}
      >
        <Pressable style={styles.modalBg} onPress={() => setCatOpen(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Категория</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <Pressable
                style={styles.modalItem}
                onPress={() => { set("category", ""); setCatOpen(false); }}
              >
                <Text style={[styles.modalItemText, !form.category && styles.modalItemTextActive]}>
                  Не указана
                </Text>
              </Pressable>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.modalItem}
                  onPress={() => { set("category", c.id); setCatOpen(false); }}
                >
                  <Text style={[styles.modalItemText, form.category === c.id && styles.modalItemTextActive]}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAF8" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#FAFAF8",
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDE8",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },

  scroll: { paddingHorizontal: 16, gap: 2 },

  label: { marginTop: 16, fontSize: 12, fontWeight: "700", color: "#8A8680", letterSpacing: 0.4 },

  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  textarea: { minHeight: 110, paddingTop: 12 },
  charCount: { fontSize: 11, color: "#C4C4C4", textAlign: "right", marginTop: 3 },

  selectBtn: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectText: { color: "#111827", fontSize: 15, fontWeight: "600" },
  selectPlaceholder: { color: "#9CA3AF", fontWeight: "400" },

  // Date-time row
  dtRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  dtBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  dtText: { fontSize: 14, color: "#111827", fontWeight: "600", flexShrink: 1 },

  // Inline picker wrapper
  pickerWrap: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F0EDE8",
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
    paddingBottom: 4,
  },
  pickerDone: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pickerDoneText: { fontSize: 15, fontWeight: "700", color: ACCENT },

  errorText: { marginTop: 12, fontSize: 13, color: "#E74C3C", fontWeight: "500" },

  // Action buttons
  btnRow: { marginTop: 24, flexDirection: "row", gap: 10 },
  btn: {
    flex: 1, borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center", justifyContent: "center",
  },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#E5E7EB" },
  btnGhostText: { color: "#374151", fontWeight: "700", fontSize: 15 },
  btnPrimary: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  btnDisabled: { opacity: 0.6 },

  // Modal
  modalBg: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff", borderRadius: 18,
    overflow: "hidden", maxHeight: "75%",
    paddingTop: 4,
  },
  modalTitle: {
    fontSize: 13, fontWeight: "700", color: "#9CA3AF",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#F0EDE8",
    letterSpacing: 0.4,
  },
  modalItem: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F9F9F7",
  },
  modalItemText: { color: "#111827", fontSize: 15, fontWeight: "600" },
  modalItemTextActive: { color: ACCENT },
});
