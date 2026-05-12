import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { CARD_TEXT_MAX } from "../../config/tips";
import TipPhotoPicker from "./TipPhotoPicker";

export default function TipForm({
  visible,
  selectedCategory,
  editingTip,
  form,
  photos,
  loading,
  error,
  canDelete,
  onChange,
  onPhotos,
  onClose,
  onSubmit,
  onDelete,
}) {
  if (!visible || !selectedCategory) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />
          <Text style={styles.title}>{selectedCategory.icon} {editingTip ? "Редактировать совет" : "Новый совет"} · {selectedCategory.title}</Text>

          <Text style={styles.label}>Заголовок *</Text>
          <TextInput value={form.title} onChangeText={(v) => onChange("title", v)} placeholder="О чём совет?" style={styles.input} />

          <Text style={styles.label}>Текст *</Text>
          <TextInput
            value={form.text}
            onChangeText={(v) => onChange("text", v.slice(0, CARD_TEXT_MAX))}
            placeholder="Поделитесь опытом..."
            style={[styles.input, styles.textarea]}
            multiline
          />
          <Text style={styles.counter}>{form.text.length}/{CARD_TEXT_MAX}</Text>

          <TipPhotoPicker photos={photos} onChange={onPhotos} max={3} disabled={loading} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>Отмена</Text>
            </Pressable>
            {editingTip && canDelete ? (
              <Pressable style={[styles.btn, styles.btnDanger]} onPress={onDelete} disabled={loading}>
                <Text style={styles.btnDangerText}>Удалить</Text>
              </Pressable>
            ) : null}
            <Pressable style={[styles.btn, styles.btnPrimary, loading && styles.disabled]} onPress={onSubmit} disabled={loading}>
              <Text style={styles.btnPrimaryText}>{editingTip ? "Сохранить" : "Опубликовать"}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.42)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 22, maxHeight: "90%" },
  grabber: { width: 40, height: 4, borderRadius: 10, backgroundColor: "#D1D5DB", alignSelf: "center", marginBottom: 14 },
  title: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "700", color: "#8A8680", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#DFD8C8", borderRadius: 12, backgroundColor: "#FFFFFF", paddingHorizontal: 12, paddingVertical: 10, color: "#111827", fontSize: 14, marginBottom: 12 },
  textarea: { minHeight: 110, textAlignVertical: "top", marginBottom: 6 },
  counter: { color: "#9CA3AF", fontSize: 11, textAlign: "right", marginBottom: 10 },
  error: { color: "#B91C1C", fontSize: 12, marginTop: 2 },
  actions: { marginTop: 12, flexDirection: "row", gap: 8 },
  btn: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnGhost: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB" },
  btnGhostText: { color: "#111827", fontWeight: "700" },
  btnDanger: { backgroundColor: "#FFF5F5", borderWidth: 1, borderColor: "#FECACA" },
  btnDangerText: { color: "#E74C3C", fontWeight: "700" },
  btnPrimary: { backgroundColor: "#111827" },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "700" },
  disabled: { opacity: 0.6 },
});
