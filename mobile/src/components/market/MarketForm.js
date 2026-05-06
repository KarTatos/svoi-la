import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MarketPhotoPicker from "./MarketPhotoPicker";

export default function MarketForm({ visible, editing, form, setForm, saving, error, onSave, onDelete, onClose }) {
  const valid = String(form?.title || "").trim() && String(form?.description || "").trim();

  return (
    <Modal visible={Boolean(visible)} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{editing ? "Редактировать" : "Новое объявление"}</Text>
            <Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable>
          </View>

          <Text style={styles.label}>Название *</Text>
          <TextInput value={form.title} onChangeText={(v) => setForm((s) => ({ ...s, title: v }))} placeholder="iPhone 14, диван..." style={styles.input} />

          <Text style={styles.label}>Цена</Text>
          <TextInput value={form.price} onChangeText={(v) => setForm((s) => ({ ...s, price: v }))} placeholder="150" style={styles.input} keyboardType="numeric" />

          <Text style={styles.label}>Описание *</Text>
          <TextInput value={form.description} onChangeText={(v) => setForm((s) => ({ ...s, description: v }))} placeholder="Состояние, детали..." style={[styles.input, styles.area]} multiline />

          <Text style={styles.label}>Telegram</Text>
          <TextInput value={form.telegram} onChangeText={(v) => setForm((s) => ({ ...s, telegram: v }))} placeholder="@username" style={styles.input} />

          <Text style={styles.label}>Телефон</Text>
          <TextInput value={form.phone} onChangeText={(v) => setForm((s) => ({ ...s, phone: v }))} placeholder="13235550100" style={styles.input} keyboardType="phone-pad" />

          <MarketPhotoPicker photos={form.photos} onChange={(photos) => setForm((s) => ({ ...s, photos }))} />

          {error ? <Text style={styles.err}>{error}</Text> : null}

          <Pressable onPress={onSave} disabled={saving || !valid} style={[styles.primaryBtn, (saving || !valid) && styles.disabled]}>
            <Text style={styles.primaryBtnText}>{saving ? "Сохраняем..." : editing ? "Сохранить" : "Опубликовать"}</Text>
          </Pressable>

          {editing ? (
            <Pressable onPress={onDelete} disabled={saving} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>Удалить объявление</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, gap: 8, maxHeight: "92%" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  title: { fontSize: 17, fontWeight: "700", color: "#111827" },
  close: { fontSize: 28, color: "#8A8680", lineHeight: 28 },
  label: { fontSize: 12, color: "#6B6B6B" },
  input: { minHeight: 44, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 12, backgroundColor: "#fff", color: "#111827" },
  area: { minHeight: 90, textAlignVertical: "top", paddingTop: 10 },
  err: { color: "#B91C1C", fontSize: 12, marginTop: 4 },
  primaryBtn: { marginTop: 6, minHeight: 46, borderRadius: 12, backgroundColor: "#0E0E0E", alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.55 },
  deleteBtn: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: "#FECACA", backgroundColor: "#FFF5F5", alignItems: "center", justifyContent: "center", marginTop: 8 },
  deleteBtnText: { color: "#B91C1C", fontSize: 14, fontWeight: "700" },
});
