import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import KeyboardDoneBar, { KEYBOARD_DONE_ID } from "../../src/components/KeyboardDoneBar";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import {
  createMarketItem,
  deleteMarketItem,
  updateMarketItem,
  uploadMarketPhotos,
} from "../../src/lib/market";
import PlacePhotoPicker from "../../src/components/places/PlacePhotoPicker";

const EMPTY = {
  title: "",
  price: "",
  description: "",
  telegram: "",
  phone: "",
  photos: [],
  existingPhotos: [],
};

export default function MarketAddScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { editId } = useLocalSearchParams();
  const { user } = useAuth();
  const editMode = Boolean(editId);

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const items = useMemo(() => queryClient.getQueryData(["market"]) || [], []);
  const initialItem = useMemo(
    () => (editId ? (items.find((x) => String(x.id) === String(editId)) || null) : null),
    [editId, items]
  );

  useEffect(() => {
    if (!initialItem) return;
    setForm({
      title: initialItem.title || "",
      price: initialItem.price || "",
      description: initialItem.description || "",
      telegram: initialItem.telegram || "",
      phone: initialItem.phone || "",
      photos: [],
      existingPhotos: Array.isArray(initialItem.photos) ? initialItem.photos : [],
    });
  }, [initialItem]);

  const set = useCallback((key, value) => setForm((prev) => ({ ...prev, [key]: value })), []);

  const handleSave = async () => {
    if (!user) { router.push("/login"); return; }
    const title = String(form.title || "").trim();
    const description = String(form.description || "").trim();
    if (!title || !description) { setError("Заполните название и описание"); return; }

    setSaving(true);
    setError("");
    try {
      const newAssets = (form.photos || []).filter((p) => p && p.uri && !p.uploaded);
      const uploaded = await uploadMarketPhotos(newAssets);
      const photos = [...(form.existingPhotos || []), ...uploaded].slice(0, 5);

      const payload = {
        title,
        price: String(form.price || "").trim() || null,
        description,
        photos,
        telegram: String(form.telegram || "").trim() || null,
        phone: String(form.phone || "").trim() || null,
        author: user.name || user.email || "Пользователь",
        user_id: user.id || null,
      };

      if (editMode && editId) {
        await updateMarketItem(editId, payload);
      } else {
        await createMarketItem(payload);
      }

      queryClient.invalidateQueries({ queryKey: ["market"] });
      router.back();
    } catch (e) {
      setError(e && e.message ? e.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Удалить объявление?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить", style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteMarketItem(editId);
            queryClient.invalidateQueries({ queryKey: ["market"] });
            router.back();
          } catch (e) {
            setError(e && e.message ? e.message : "Не удалось удалить");
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} disabled={saving}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{editMode ? "Редактировать" : "Новое объявление"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <Text style={styles.label}>Название *</Text>
          <TextInput
            value={form.title}
            onChangeText={(v) => set("title", v)}
            placeholder="Что продаёте?"
            style={styles.input}
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />

          <Text style={styles.label}>Цена</Text>
          <TextInput
            value={form.price}
            onChangeText={(v) => set("price", v)}
            placeholder="$0"
            style={styles.input}
            keyboardType="default"
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />

          <Text style={styles.label}>Описание *</Text>
          <TextInput
            value={form.description}
            onChangeText={(v) => set("description", v.slice(0, 500))}
            placeholder="Состояние, особенности, условия продажи..."
            style={[styles.input, styles.textarea]}
            multiline
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />
          <Text style={styles.count}>{(form.description || "").length}/500</Text>

          <Text style={styles.label}>Telegram</Text>
          <TextInput
            value={form.telegram}
            onChangeText={(v) => set("telegram", v)}
            placeholder="@username"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />

          <Text style={styles.label}>Телефон</Text>
          <TextInput
            value={form.phone}
            onChangeText={(v) => set("phone", v)}
            placeholder="+1 (818) 000-0000"
            style={styles.input}
            keyboardType="phone-pad"
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />

          <Text style={styles.label}>Фотографии (до 5)</Text>
          <PlacePhotoPicker
            photos={form.photos}
            onChange={(p) => set("photos", p)}
            existingPhotos={form.existingPhotos}
            onRemoveExisting={(url) =>
              setForm((prev) => ({
                ...prev,
                existingPhotos: (prev.existingPhotos || []).filter((u) => u !== url),
              }))
            }
            disabled={saving}
            max={5}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.btnRow}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => router.back()} disabled={saving}>
              <Text style={styles.btnGhostText}>Отмена</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnPrimary, saving && styles.btnDisabled]} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>{editMode ? "Сохранить" : "Опубликовать"}</Text>
              )}
            </Pressable>
          </View>

          {editMode ? (
            <Pressable style={[styles.btnDelete, saving && styles.btnDisabled]} onPress={handleDelete} disabled={saving}>
              <Text style={styles.btnDeleteText}>Удалить объявление</Text>
            </Pressable>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>
    
      <KeyboardDoneBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFECE6" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  scroll: { paddingHorizontal: 16, paddingBottom: 80, gap: 2 },
  label: { marginTop: 12, fontSize: 12, fontWeight: "700", color: "#8A8680" },
  input: {
    marginTop: 4, borderWidth: 1, borderColor: "#DFD8C8",
    backgroundColor: "#fff", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: "#111827",
  },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  count: { fontSize: 11, color: "#A1A1AA", textAlign: "right", marginTop: 2 },
  errorText: { marginTop: 10, fontSize: 13, color: "#E74C3C" },
  btnRow: { marginTop: 20, flexDirection: "row", gap: 10 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB" },
  btnGhostText: { color: "#111827", fontWeight: "700" },
  btnPrimary: { backgroundColor: "#111827" },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnDisabled: { opacity: 0.6 },
  btnDelete: {
    marginTop: 10, borderRadius: 12, paddingVertical: 14,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA",
  },
  btnDeleteText: { color: "#EF4444", fontWeight: "700" },
});