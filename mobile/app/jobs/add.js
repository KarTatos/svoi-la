import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useAuth } from "../../src/hooks/useAuth";
import { useJobQuery, useCreateJob, useUpdateJob } from "../../src/hooks/useJobsQuery";
import { uploadJobPhotos } from "../../src/lib/jobs";
import PlacePhotoPicker from "../../src/components/places/PlacePhotoPicker";
import { DISTRICTS } from "../../src/config/places";

const ACCENT = "#F47B20";
const BOTTOM_NAV_H = 66;

const SCHEDULES = [
  { id: "fulltime", label: "Полный день" },
  { id: "parttime", label: "Частичная занятость" },
  { id: "remote",   label: "Удалённо" },
  { id: "contract", label: "Контракт" },
  { id: "oneoff",   label: "Разовая работа" },
];

const PRICE_TYPES = [
  { id: "hourly",     label: "В час" },
  { id: "monthly",    label: "В месяц" },
  { id: "fixed",      label: "Фиксированно" },
  { id: "negotiable", label: "Договорная" },
];

const ENGLISH_LEVELS = [
  { id: "none",         label: "Не нужен" },
  { id: "basic",        label: "Базовый" },
  { id: "intermediate", label: "Средний" },
  { id: "fluent",       label: "Свободный" },
  { id: "native",       label: "Native / Родной" },
];

const WORK_AUTHS = [
  { id: "any",     label: "Любой статус" },
  { id: "citizen", label: "Гражданство США" },
  { id: "gc",      label: "Green Card" },
  { id: "ead",     label: "EAD / Work Permit" },
  { id: "ask",     label: "По запросу" },
];

const EMPTY_FORM = {
  type:         "vacancy",
  title:        "",
  district:     "",
  schedule:     "",
  english_lvl:  "",
  work_auth:    "ask",
  price:        "",
  price_type:   "",
  description:  "",
  telegram:     "",
  phone:        "",
  existingPhotos: [],
};

function FieldLabel({ text, required }) {
  return (
    <Text style={styles.fieldLabel}>
      {text}{required ? <Text style={{ color: ACCENT }}> *</Text> : null}
    </Text>
  );
}

function PickerButton({ label, value, onPress, placeholder }) {
  return (
    <Pressable style={styles.pickerBtn} onPress={onPress}>
      <Text style={value ? styles.pickerVal : styles.pickerPlaceholder}>
        {value || placeholder}
      </Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function JobAddScreen() {
  const { editId } = useLocalSearchParams();
  const isEditMode = Boolean(editId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showActionSheetWithOptions } = useActionSheet();

  const { data: existingJob, isLoading: loadingJob } = useJobQuery(isEditMode ? editId : null);
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const [form, setForm] = useState(EMPTY_FORM);
  const [newPhotos, setNewPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode && existingJob) {
      setForm({
        type:           existingJob.type        || "vacancy",
        title:          existingJob.title       || "",
        district:       existingJob.district    || "",
        schedule:       existingJob.schedule    || "",
        english_lvl:    existingJob.english_lvl || "",
        work_auth:      existingJob.work_auth   || "ask",
        price:          existingJob.price       || "",
        price_type:     existingJob.price_type  || "",
        description:    existingJob.description || "",
        telegram:       existingJob.telegram    || "",
        phone:          existingJob.phone       || "",
        existingPhotos: Array.isArray(existingJob.photos) ? existingJob.photos : [],
      });
      setNewPhotos([]);
    }
  }, [isEditMode, existingJob]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const isVacancy = form.type === "vacancy";

  // ActionSheet pickers
  const pickDistrict = () => {
    const options = [...DISTRICTS.map(d => `${d.emoji}  ${d.name}`), "Отмена"];
    showActionSheetWithOptions(
      { options, cancelButtonIndex: options.length - 1 },
      (i) => { if (i < DISTRICTS.length) set("district", DISTRICTS[i].id); }
    );
  };

  const pickSchedule = () => {
    const options = [...SCHEDULES.map(s => s.label), "Отмена"];
    showActionSheetWithOptions(
      { options, cancelButtonIndex: options.length - 1 },
      (i) => { if (i < SCHEDULES.length) set("schedule", SCHEDULES[i].id); }
    );
  };

  const pickPriceType = () => {
    const options = [...PRICE_TYPES.map(p => p.label), "Отмена"];
    showActionSheetWithOptions(
      { options, cancelButtonIndex: options.length - 1 },
      (i) => { if (i < PRICE_TYPES.length) set("price_type", PRICE_TYPES[i].id); }
    );
  };

  const pickEnglish = () => {
    const options = [...ENGLISH_LEVELS.map(e => e.label), "Отмена"];
    showActionSheetWithOptions(
      { options, cancelButtonIndex: options.length - 1 },
      (i) => { if (i < ENGLISH_LEVELS.length) set("english_lvl", ENGLISH_LEVELS[i].id); }
    );
  };

  const pickWorkAuth = () => {
    const options = [...WORK_AUTHS.map(w => w.label), "Отмена"];
    showActionSheetWithOptions(
      { options, cancelButtonIndex: options.length - 1 },
      (i) => { if (i < WORK_AUTHS.length) set("work_auth", WORK_AUTHS[i].id); }
    );
  };

  const labelFor = (list, id) => list.find(x => x.id === id)?.label || "";
  const districtLabel = () => DISTRICTS.find(d => d.id === form.district)
    ? `${DISTRICTS.find(d => d.id === form.district).emoji}  ${DISTRICTS.find(d => d.id === form.district).name}`
    : "";

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert("Укажи заголовок");
      return;
    }
    if (!form.telegram.trim() && !form.phone.trim()) {
      Alert.alert("Укажи контакт", "Telegram или телефон обязателен");
      return;
    }

    setSaving(true);
    try {
      // Upload new photos and merge with existing
      let uploadedUrls = [];
      if (newPhotos.length > 0) {
        uploadedUrls = await uploadJobPhotos(newPhotos);
      }
      const allPhotos = [...(form.existingPhotos || []), ...uploadedUrls].slice(0, 3);

      const fields = {
        type:        form.type,
        title:       form.title.trim(),
        district:    form.district || null,
        schedule:    isVacancy ? (form.schedule || null) : null,
        english_lvl: isVacancy ? (form.english_lvl || null) : null,
        work_auth:   isVacancy ? (form.work_auth || null) : null,
        price:       form.price.trim() || null,
        price_type:  form.price_type || null,
        description: form.description.trim() || null,
        telegram:    form.telegram.trim() || null,
        phone:       form.phone.trim() || null,
        author:      user?.name || user?.email?.split("@")[0] || "Аноним",
        user_id:     user?.id || null,
        // photos only if migration 024 has been run
        ...(allPhotos.length > 0 ? { photos: allPhotos } : {}),
      };

      if (isEditMode) {
        await updateMutation.mutateAsync({ id: editId, fields });
      } else {
        await createMutation.mutateAsync(fields);
      }
      router.back();
    } catch (e) {
      Alert.alert("Ошибка", e.message);
    } finally {
      setSaving(false);
    }
  };

  if (isEditMode && loadingJob) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditMode ? "Редактировать" : "Новое объявление"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + BOTTOM_NAV_H + 32 },
          ]}
        >
          {/* Type selector (only in create mode) */}
          {!isEditMode && (
            <View style={styles.section}>
              <FieldLabel text="Тип объявления" required />
              <View style={styles.typeRow}>
                <Pressable
                  style={[styles.typeBtn, form.type === "vacancy" && styles.typeBtnActive]}
                  onPress={() => set("type", "vacancy")}
                >
                  <Text style={styles.typeIcon}>💼</Text>
                  <Text style={[styles.typeLabel, form.type === "vacancy" && styles.typeLabelActive]}>
                    Вакансия
                  </Text>
                  <Text style={[styles.typeDesc, form.type === "vacancy" && styles.typeDescActive]}>
                    Ищу сотрудника
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.typeBtn, form.type === "service" && styles.typeBtnActive]}
                  onPress={() => set("type", "service")}
                >
                  <Text style={styles.typeIcon}>🔧</Text>
                  <Text style={[styles.typeLabel, form.type === "service" && styles.typeLabelActive]}>
                    Услуга
                  </Text>
                  <Text style={[styles.typeDesc, form.type === "service" && styles.typeDescActive]}>
                    Предлагаю себя
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Title */}
          <View style={styles.section}>
            <FieldLabel
              text={isVacancy ? "Название вакансии" : "Название услуги"}
              required
            />
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={v => set("title", v)}
              placeholder={isVacancy ? "Например: Официант, кассир..." : "Например: Уборка, ремонт..."}
              placeholderTextColor="#B0B7C3"
              returnKeyType="next"
            />
          </View>

          {/* District */}
          <View style={styles.section}>
            <FieldLabel text="Район" />
            <PickerButton
              value={districtLabel()}
              placeholder="Выбрать район"
              onPress={pickDistrict}
            />
          </View>

          {/* Schedule (vacancy only) */}
          {isVacancy && (
            <View style={styles.section}>
              <FieldLabel text="График" />
              <PickerButton
                value={labelFor(SCHEDULES, form.schedule)}
                placeholder="Выбрать график"
                onPress={pickSchedule}
              />
            </View>
          )}

          {/* Price */}
          <View style={styles.section}>
            <FieldLabel text="Оплата" />
            <View style={styles.priceRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={form.price}
                onChangeText={v => set("price", v)}
                placeholder="Сумма (напр. $18)"
                placeholderTextColor="#B0B7C3"
                keyboardType="default"
              />
              <Pressable style={styles.priceTypeBtn} onPress={pickPriceType}>
                <Text style={form.price_type ? styles.priceTypeVal : styles.priceTypePlaceholder}>
                  {labelFor(PRICE_TYPES, form.price_type) || "Тип"}
                </Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* English + Work auth (vacancy only) */}
          {isVacancy && (
            <>
              <View style={styles.section}>
                <FieldLabel text="Уровень английского" />
                <PickerButton
                  value={labelFor(ENGLISH_LEVELS, form.english_lvl)}
                  placeholder="Выбрать уровень"
                  onPress={pickEnglish}
                />
              </View>
              <View style={styles.section}>
                <FieldLabel text="Рабочий статус" />
                <PickerButton
                  value={labelFor(WORK_AUTHS, form.work_auth)}
                  placeholder="Выбрать требование"
                  onPress={pickWorkAuth}
                />
              </View>
            </>
          )}

          {/* Description */}
          <View style={styles.section}>
            <FieldLabel text="Описание" />
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.description}
              onChangeText={v => set("description", v)}
              placeholder="Подробности, требования, условия..."
              placeholderTextColor="#B0B7C3"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <FieldLabel text="Фото" />
            <PlacePhotoPicker
              photos={newPhotos}
              onChange={setNewPhotos}
              existingPhotos={form.existingPhotos}
              onRemoveExisting={(url) =>
                set("existingPhotos", form.existingPhotos.filter(u => u !== url))
              }
              max={3}
              disabled={saving}
            />
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <FieldLabel text="Telegram" required />
            <TextInput
              style={styles.input}
              value={form.telegram}
              onChangeText={v => set("telegram", v)}
              placeholder="@username"
              placeholderTextColor="#B0B7C3"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.section}>
            <FieldLabel text="Телефон" />
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={v => set("phone", v)}
              placeholder="+1 (323) 000-0000"
              placeholderTextColor="#B0B7C3"
              keyboardType="phone-pad"
            />
          </View>

          {/* Submit */}
          <Pressable
            style={[styles.submitBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>
                  {isEditMode ? "Сохранить" : "Опубликовать"}
                </Text>
            }
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAF8" },

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
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  section: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 },

  input: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: "#111827",
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  textarea: { minHeight: 110, paddingTop: 13 },

  pickerBtn: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
    paddingHorizontal: 14, paddingVertical: 13,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  pickerVal: { fontSize: 15, color: "#111827", flex: 1 },
  pickerPlaceholder: { fontSize: 15, color: "#B0B7C3", flex: 1 },
  chevron: { fontSize: 20, color: "#9CA3AF", marginLeft: 8 },

  // Price row
  priceRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  priceTypeBtn: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
    paddingHorizontal: 12, paddingVertical: 13,
    flexDirection: "row", alignItems: "center",
    minWidth: 110,
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  priceTypeVal: { fontSize: 14, color: "#111827", flex: 1, fontWeight: "600" },
  priceTypePlaceholder: { fontSize: 14, color: "#B0B7C3", flex: 1 },

  // Type selector
  typeRow: { flexDirection: "row", gap: 12 },
  typeBtn: {
    flex: 1, borderRadius: 16,
    borderWidth: 2, borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    padding: 16, alignItems: "center", gap: 4,
  },
  typeBtnActive: { borderColor: ACCENT, backgroundColor: "#FFF3E8" },
  typeIcon: { fontSize: 28, marginBottom: 4 },
  typeLabel: { fontSize: 15, fontWeight: "800", color: "#6B7280" },
  typeLabelActive: { color: ACCENT },
  typeDesc: { fontSize: 12, color: "#9CA3AF" },
  typeDescActive: { color: "#D97706" },

  // Submit
  submitBtn: {
    backgroundColor: ACCENT, borderRadius: 16,
    paddingVertical: 18, alignItems: "center",
    marginTop: 8,
    shadowColor: ACCENT, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "900" },
});
