import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import KeyboardDoneBar, { KEYBOARD_DONE_ID } from "../../src/components/KeyboardDoneBar";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import {
  buildHousingPayload,
  createHousing,
  deleteHousing,
  updateHousing,
  uploadHousingPhotos,
} from "../../src/lib/housing";
import { fetchPlaceSuggestions } from "../../src/lib/googlePlaces";
import PlacePhotoPicker from "../../src/components/places/PlacePhotoPicker";
import { DISTRICTS } from "../../src/config/places";

const TYPE_OPTIONS = [
  { id: "studio", label: "Studio" },
  { id: "room", label: "Комната" },
  { id: "1bd", label: "1 Bedroom" },
  { id: "2bd", label: "2 Bedrooms" },
  { id: "3bd", label: "3+ Bedrooms" },
];

const EMPTY_FORM = {
  title: "",
  address: "",
  addressSelected: false,
  addrOptions: [],
  addrLoading: false,
  district: "",
  type: "studio",
  minPrice: "",
  beds: "",
  baths: "",
  comment: "",
  telegram: "",
  photos: [],
  existingPhotos: [],
};

export default function HousingAddScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { editId } = useLocalSearchParams();
  const { user } = useAuth();

  const editMode = Boolean(editId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [typeOpen, setTypeOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);

  // Pre-fill in edit mode
  const items = useMemo(
    () => queryClient.getQueryData(["housing"]) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const initialItem = useMemo(
    () => (editId ? (items.find((x) => String(x.id) === String(editId)) || null) : null),
    [editId, items]
  );

  useEffect(() => {
    if (!initialItem) return;
    setForm({
      title: initialItem.title || "",
      address: initialItem.address || "",
      addressSelected: true,
      addrOptions: [],
      addrLoading: false,
      district: initialItem.district || "",
      type: initialItem.type || "studio",
      minPrice: String(initialItem.minPrice || ""),
      beds: String(initialItem.beds > 0 ? initialItem.beds : ""),
      baths: String(initialItem.baths > 0 ? initialItem.baths : ""),
      comment: initialItem.comment || "",
      telegram: initialItem.telegram || "",
      photos: [],
      existingPhotos: Array.isArray(initialItem.photos) ? initialItem.photos : [],
    });
  }, [initialItem]);

  const set = useCallback(
    (key, value) => setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const onChangeAddress = useCallback(
    async (value) => {
      setForm((prev) => ({ ...prev, address: value, addressSelected: false }));
      const q = String(value || "").trim();
      if (q.length < 3) {
        set("addrOptions", []);
        return;
      }
      set("addrLoading", true);
      try {
        const opts = await fetchPlaceSuggestions(q);
        set("addrOptions", opts);
      } catch {
        set("addrOptions", []);
      } finally {
        set("addrLoading", false);
      }
    },
    [set]
  );

  const onSelectAddress = useCallback((opt) => {
    setForm((prev) => ({
      ...prev,
      address: opt.value || prev.address,
      addressSelected: true,
      addrOptions: [],
    }));
  }, []);

  const handleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!String(form.address || "").trim()) {
      setError("Укажите адрес");
      return;
    }
    if (!form.addressSelected && !editMode) {
      setError("Выберите адрес из подсказок Google");
      return;
    }
    if (!String(form.minPrice || "").trim()) {
      setError("Укажите цену");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const newAssets = (form.photos || []).filter((p) => p?.uri && !p?.uploaded);
      const uploadedUrls = await uploadHousingPhotos(newAssets);
      const payload = buildHousingPayload(form, user, uploadedUrls, form.existingPhotos || []);

      if (editMode && editId) {
        await updateHousing(editId, payload);
      } else {
        await createHousing(payload);
      }

      queryClient.invalidateQueries({ queryKey: ["housing"] });
      router.back();
    } catch (e) {
      setError(e?.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Удалить объявление?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteHousing(editId);
            queryClient.invalidateQueries({ queryKey: ["housing"] });
            router.back();
          } catch (e) {
            setError(e?.message || "Не удалось удалить");
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} disabled={saving}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {editMode ? "Редактировать жильё" : "Новое объявление"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.label}>Заголовок</Text>
          <TextInput
            value={form.title}
            onChangeText={(v) => set("title", v)}
            placeholder="Название объявления (необязательно)"
            style={styles.input}
          />

          {/* Address */}
          <Text style={styles.label}>Адрес *</Text>
          <TextInput
            value={form.address}
            onChangeText={onChangeAddress}
            placeholder="Street address (English)"
            style={[
              styles.input,
              form.address && !form.addressSelected ? styles.inputInvalid : null,
            ]}
          
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />
          {form.addrLoading ? <Text style={styles.hint}>Searching...</Text> : null}
          {form.addrOptions.length > 0 ? (
            <View style={styles.suggestBox}>
              {form.addrOptions.map((opt, i) => (
                <Pressable
                  key={`${opt.value}-${i}`}
                  onPress={() => onSelectAddress(opt)}
                  style={styles.suggestItem}
                >
                  <Text style={styles.suggestText}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          {form.address && !form.addressSelected ? (
            <Text style={styles.fieldError}>Выберите адрес из подсказок.</Text>
          ) : null}

          {/* District */}
          <Text style={styles.label}>Район</Text>
          <Pressable style={styles.selectBtn} onPress={() => setDistrictOpen(true)}>
            <Text style={[styles.selectText, !form.district && styles.selectPlaceholder]}>
              {DISTRICTS.find((d) => d.id === form.district)?.name || "Выберите район"}
            </Text>
          </Pressable>

          {/* Type */}
          <Text style={styles.label}>Тип жилья *</Text>
          <Pressable style={styles.selectBtn} onPress={() => setTypeOpen(true)}>
            <Text style={[styles.selectText, !form.type && styles.selectPlaceholder]}>
              {TYPE_OPTIONS.find((t) => t.id === form.type)?.label || "Выберите тип"}
            </Text>
          </Pressable>

          {/* Price */}
          <Text style={styles.label}>Цена ($/mo) *</Text>
          <TextInput
            value={form.minPrice}
            onChangeText={(v) => set("minPrice", v.replace(/\D/g, ""))}
            placeholder="2500"
            style={styles.input}
            keyboardType="numeric"
          />

          {/* Beds / Baths */}
          <View style={styles.row2}>
            <View style={styles.row2Item}>
              <Text style={styles.label}>Спальни</Text>
              <TextInput
                value={form.beds}
                onChangeText={(v) => set("beds", v.replace(/\D/g, ""))}
                placeholder="0"
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.row2Item}>
              <Text style={styles.label}>Ванные</Text>
              <TextInput
                value={form.baths}
                onChangeText={(v) => set("baths", v.replace(/\D/g, ""))}
                placeholder="0"
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Telegram */}
          <Text style={styles.label}>Telegram</Text>
          <TextInput
            value={form.telegram}
            onChangeText={(v) => set("telegram", v)}
            placeholder="@username"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Comment */}
          <Text style={styles.label}>Описание</Text>
          <TextInput
            value={form.comment}
            onChangeText={(v) => set("comment", v.slice(0, 500))}
            placeholder="Особенности, условия, инфраструктура..."
            style={[styles.input, styles.textarea]}
            multiline
          />
          <Text style={styles.count}>{(form.comment || "").length}/500</Text>

          {/* Photos */}
          <Text style={styles.label}>Фотографии (до 8)</Text>
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
            max={8}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Action buttons */}
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
                <Text style={styles.btnPrimaryText}>
                  {editMode ? "Сохранить" : "Опубликовать"}
                </Text>
              )}
            </Pressable>
          </View>

          {editMode ? (
            <Pressable
              style={[styles.btnDelete, saving && styles.btnDisabled]}
              onPress={handleDelete}
              disabled={saving}
            >
              <Text style={styles.btnDeleteText}>Удалить объявление</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Type picker */}
      <Modal
        visible={typeOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTypeOpen(false)}
      >
        <Pressable style={styles.modalBg} onPress={() => setTypeOpen(false)}>
          <View style={styles.modalCard}>
            <ScrollView style={{ maxHeight: 400 }}>
              {TYPE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={styles.modalItem}
                  onPress={() => {
                    set("type", opt.id);
                    setTypeOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.type === opt.id && styles.modalItemTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* District picker */}
      <Modal
        visible={districtOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDistrictOpen(false)}
      >
        <Pressable style={styles.modalBg} onPress={() => setDistrictOpen(false)}>
          <View style={styles.modalCard}>
            <ScrollView style={{ maxHeight: 440 }}>
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  set("district", "");
                  setDistrictOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    !form.district && styles.modalItemTextActive,
                  ]}
                >
                  Не указан
                </Text>
              </Pressable>
              {DISTRICTS.map((d) => (
                <Pressable
                  key={d.id}
                  style={styles.modalItem}
                  onPress={() => {
                    set("district", d.id);
                    setDistrictOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      form.district === d.id && styles.modalItemTextActive,
                    ]}
                  >
                    {d.emoji} {d.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
          <KeyboardDoneBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFECE6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  scroll: { paddingHorizontal: 16, paddingBottom: 80, gap: 2 },
  label: { marginTop: 12, fontSize: 12, fontWeight: "700", color: "#8A8680" },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#DFD8C8",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  inputInvalid: { borderColor: "#F5B7B1" },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  hint: { fontSize: 12, color: "#8A8680", marginTop: 2 },
  count: { fontSize: 11, color: "#A1A1AA", textAlign: "right", marginTop: 2 },
  fieldError: { fontSize: 12, color: "#E74C3C", marginTop: 2 },
  errorText: { marginTop: 10, fontSize: 13, color: "#E74C3C" },
  suggestBox: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  suggestItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  suggestText: { fontSize: 12, color: "#4B5563" },
  selectBtn: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#DFD8C8",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectText: { color: "#111827", fontSize: 14, fontWeight: "600" },
  selectPlaceholder: { color: "#9CA3AF", fontWeight: "500" },
  row2: { flexDirection: "row", gap: 10 },
  row2Item: { flex: 1 },
  btnRow: { marginTop: 20, flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB" },
  btnGhostText: { color: "#111827", fontWeight: "700" },
  btnPrimary: { backgroundColor: "#111827" },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnDisabled: { opacity: 0.6 },
  btnDelete: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  btnDeleteText: { color: "#EF4444", fontWeight: "700" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    maxHeight: "76%",
  },
  modalItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalItemText: { color: "#111827", fontSize: 15, fontWeight: "600" },
  modalItemTextActive: { color: "#F47B20" },
});
