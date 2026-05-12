import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
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
import { useTipsQuery } from "../../src/hooks/useTipsQuery";
import { CARD_TEXT_MAX, TIPS_CATS } from "../../src/config/tips";
import { createTip, deleteTip, updateTip } from "../../src/lib/tips";
import TipPhotoPicker from "../../src/components/tips/TipPhotoPicker";

export default function TipsAddScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { category, editId } = useLocalSearchParams();
  const categoryId = String(category || "").toLowerCase();
  const tipIdToEdit = String(editId || "");
  const isEditMode = Boolean(tipIdToEdit);

  const { user } = useAuth();
  const { data: allTips = [] } = useTipsQuery();

  const selCat = TIPS_CATS.find((c) => c.id === categoryId) || null;

  const initialTip = useMemo(
    () => (isEditMode ? (allTips.find((t) => String(t.id) === tipIdToEdit) || null) : null),
    [allTips, tipIdToEdit, isEditMode]
  );

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTip) {
      setTitle(initialTip.title || "");
      setText(initialTip.text || "");
    }
  }, [initialTip]);

  const handleSubmit = async () => {
    if (!selCat) { setError("Категория не найдена"); return; }
    if (!title.trim()) { setError("Введите заголовок"); return; }
    if (!text.trim()) { setError("Введите текст совета"); return; }

    setLoading(true);
    setError("");
    try {
      if (isEditMode && initialTip) {
        await updateTip({
          id: initialTip.id,
          cat: selCat.id,
          title: title.trim(),
          text: text.trim(),
          photos,
          existingPhotos: initialTip.photos || [],
          user,
        });
      } else {
        await createTip({
          cat: selCat.id,
          title: title.trim(),
          text: text.trim(),
          photos,
          user,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["tips"] });
      router.back();
    } catch (e) {
      setError(e?.message || "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Удалить совет?",
      "Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteTip(initialTip.id);
              await queryClient.invalidateQueries({ queryKey: ["tips"] });
              router.back();
            } catch (e) {
              setError(e?.message || "Ошибка удаления");
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.centerText}>Нужно войти в аккаунт</Text>
          <Pressable style={styles.loginBtn} onPress={() => router.replace("/login")}>
            <Text style={styles.loginTxt}>Войти</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditMode && !initialTip) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.centerText}>Загрузка...</Text>
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
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Редактировать совет" : "Новый совет"}
          </Text>
          {selCat ? (
            <Text style={styles.headerSub}>{selCat.icon} {selCat.title}</Text>
          ) : null}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Заголовок *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="О чём совет?"
            style={styles.input}
            returnKeyType="next"
            maxLength={120}
          />

          <Text style={styles.label}>Текст *</Text>
          <TextInput
            value={text}
            onChangeText={(v) => setText(v.slice(0, CARD_TEXT_MAX))}
            placeholder="Поделитесь опытом..."
            style={[styles.input, styles.textarea]}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.counter}>{text.length}/{CARD_TEXT_MAX}</Text>

          <Text style={styles.label}>Фото</Text>
          <TipPhotoPicker
            photos={photos}
            onChange={setPhotos}
            max={3}
            disabled={loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.btnGhost]}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.btnGhostText}>Отмена</Text>
            </Pressable>

            {isEditMode ? (
              <Pressable
                style={[styles.btn, styles.btnDanger]}
                onPress={handleDelete}
                disabled={loading}
              >
                <Text style={styles.btnDangerText}>Удалить</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[styles.btn, styles.btnPrimary, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.btnPrimaryText}>
                {loading ? "Сохранение..." : isEditMode ? "Сохранить" : "Опубликовать"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFECE6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 13, color: "#8A8680", fontWeight: "600", marginTop: 2 },
  content: { padding: 16, paddingBottom: 48 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8A8680",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DFD8C8",
    borderRadius: 12,
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111827",
    fontSize: 15,
    marginBottom: 16,
  },
  textarea: {
    minHeight: 130,
    marginBottom: 4,
  },
  counter: { color: "#9CA3AF", fontSize: 12, textAlign: "right", marginBottom: 16 },
  error: { color: "#B91C1C", fontSize: 13, marginTop: 8, marginBottom: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 24 },
  btn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E5E7EB" },
  btnGhostText: { color: "#374151", fontWeight: "700", fontSize: 15 },
  btnDanger: { backgroundColor: "#FFF5F5", borderWidth: 1, borderColor: "#FECACA" },
  btnDangerText: { color: "#E74C3C", fontWeight: "700", fontSize: 15 },
  btnPrimary: { backgroundColor: "#111827" },
  btnPrimaryText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  disabled: { opacity: 0.55 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  centerText: { fontSize: 15, color: "#6B7280" },
  loginBtn: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  loginTxt: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});
