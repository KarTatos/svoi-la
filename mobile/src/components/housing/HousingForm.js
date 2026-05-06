import * as ImagePicker from "expo-image-picker";
import { Pressable, StyleSheet, Text, TextInput, View, Modal, Image, ScrollView } from "react-native";

const MAX_HOUSING_PHOTOS = 10;

function HousingPhotoPicker({ photos, onChange }) {
  const safePhotos = Array.isArray(photos) ? photos : [];

  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX_HOUSING_PHOTOS - safePhotos.length),
      quality: 0.85,
    });
    if (res.canceled) return;
    onChange([...(safePhotos || []), ...(res.assets || [])].slice(0, MAX_HOUSING_PHOTOS));
  };

  const remove = (idx) => onChange(safePhotos.filter((_, i) => i !== idx));

  return (
    <View>
      <Text style={styles.label}>Фото (до 10)</Text>
      <View style={styles.photoRow}>
        {safePhotos.map((p, i) => (
          <View key={`${p.uri}-${i}`} style={styles.thumbWrap}>
            <Image source={{ uri: p.uri }} style={styles.thumb} />
            <Pressable onPress={() => remove(i)} style={styles.removeBtn}><Text style={styles.removeText}>×</Text></Pressable>
          </View>
        ))}
        {safePhotos.length < MAX_HOUSING_PHOTOS ? <Pressable style={styles.addPhotoBtn} onPress={pick}><Text style={styles.addPhotoText}>+ Фото</Text></Pressable> : null}
      </View>
    </View>
  );
}

export default function HousingForm({ visible, editing, form, saving, error, addressLoading, onSearchAddress, onPickAddress, setForm, onSave, onDelete, onClose }) {
  return (
    <Modal visible={Boolean(visible)} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.headerRow}><Text style={styles.title}>{editing ? "Редактировать жильё" : "Новое жильё"}</Text><Pressable onPress={onClose}><Text style={styles.close}>×</Text></Pressable></View>

            <Text style={styles.label}>Адрес *</Text>
            <TextInput value={form.address} onChangeText={onSearchAddress} placeholder="1457 N Main St, Los Angeles, CA" style={styles.input} />
            {addressLoading ? <Text style={styles.hint}>Ищем адрес...</Text> : null}
            {form.addressOptions?.length ? (
              <View style={styles.optionsBox}>
                {form.addressOptions.map((o, i) => (
                  <Pressable key={`${o.value}-${i}`} style={styles.option} onPress={() => onPickAddress(o)}><Text style={styles.optionText}>{o.label}</Text></Pressable>
                ))}
              </View>
            ) : null}

            <Text style={styles.label}>Название</Text>
            <TextInput value={form.title} onChangeText={(v) => setForm((s) => ({ ...s, title: v }))} placeholder="Cozy studio" style={styles.input} />

            <View style={styles.doubleRow}>
              <View style={{ flex: 1 }}><Text style={styles.label}>Район</Text><TextInput value={form.district} onChangeText={(v) => setForm((s) => ({ ...s, district: v }))} placeholder="Downtown LA" style={styles.input} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Тип</Text>
                <View style={styles.typeRow}>
                  {[
                    { id: "room", label: "Комната" },
                    { id: "studio", label: "Студия" },
                    { id: "1bd", label: "1 bd" },
                    { id: "2bd", label: "2 bd" },
                  ].map((opt) => (
                    <Pressable
                      key={opt.id}
                      onPress={() => setForm((s) => ({ ...s, type: opt.id }))}
                      style={[styles.typeChip, form.type === opt.id && styles.typeChipActive]}
                    >
                      <Text style={[styles.typeChipText, form.type === opt.id && styles.typeChipTextActive]}>{opt.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.label}>Цена от *</Text>
            <TextInput value={form.minPrice} onChangeText={(v) => setForm((s) => ({ ...s, minPrice: v.replace(/[^\d]/g, "") }))} keyboardType="numeric" placeholder="1850" style={styles.input} />

            <Text style={styles.label}>Комментарий</Text>
            <TextInput value={form.comment} onChangeText={(v) => setForm((s) => ({ ...s, comment: String(v || "").slice(0, 1000) }))} maxLength={1000} placeholder="Описание, условия..." style={[styles.input, styles.area]} multiline />

            <View style={styles.doubleRow}>
              <View style={{ flex: 1 }}><Text style={styles.label}>Telegram</Text><TextInput value={form.telegram} onChangeText={(v) => setForm((s) => ({ ...s, telegram: v }))} placeholder="@username" style={styles.input} /></View>
              <View style={{ flex: 1 }}><Text style={styles.label}>Телефон</Text><TextInput value={form.messageContact} onChangeText={(v) => setForm((s) => ({ ...s, messageContact: v }))} placeholder="+12135551234" style={styles.input} /></View>
            </View>

            <HousingPhotoPicker photos={form.photos} onChange={(photos) => setForm((s) => ({ ...s, photos }))} />

            {error ? <Text style={styles.err}>{error}</Text> : null}

            <Pressable style={[styles.primaryBtn, saving && styles.disabled]} disabled={saving} onPress={onSave}><Text style={styles.primaryBtnText}>{saving ? "Сохраняем..." : editing ? "Сохранить" : "Опубликовать"}</Text></Pressable>
            {editing ? <Pressable style={styles.deleteBtn} onPress={onDelete} disabled={saving}><Text style={styles.deleteBtnText}>Удалить</Text></Pressable> : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "93%", padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 17, fontWeight: "700", color: "#111827" },
  close: { fontSize: 28, color: "#8A8680", lineHeight: 28 },
  label: { fontSize: 12, color: "#6B6B6B", marginTop: 8, marginBottom: 6 },
  input: { minHeight: 44, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, backgroundColor: "#fff", paddingHorizontal: 12 },
  area: { minHeight: 90, textAlignVertical: "top", paddingTop: 10 },
  hint: { fontSize: 12, color: "#8A8680", marginTop: 4 },
  optionsBox: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, overflow: "hidden", marginTop: 6 },
  option: { paddingHorizontal: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  optionText: { fontSize: 12, color: "#374151" },
  doubleRow: { flexDirection: "row", gap: 8 },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  typeChip: { borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#FFFFFF", paddingHorizontal: 9, paddingVertical: 6 },
  typeChipActive: { backgroundColor: "#0E0E0E", borderColor: "#0E0E0E" },
  typeChipText: { fontSize: 11, fontWeight: "600", color: "#111827" },
  typeChipTextActive: { color: "#FFFFFF" },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumbWrap: { width: 72, height: 72, borderRadius: 10, overflow: "hidden", position: "relative" },
  thumb: { width: "100%", height: "100%" },
  removeBtn: { position: "absolute", top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  removeText: { color: "#fff", fontSize: 13, lineHeight: 13 },
  addPhotoBtn: { width: 72, height: 72, borderRadius: 10, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#E1DDD4", backgroundColor: "#F8F5EE", alignItems: "center", justifyContent: "center" },
  addPhotoText: { fontSize: 12, color: "#6B6B6B", fontWeight: "600" },
  err: { color: "#B91C1C", fontSize: 12, marginTop: 8 },
  primaryBtn: { minHeight: 46, borderRadius: 12, backgroundColor: "#0E0E0E", alignItems: "center", justifyContent: "center", marginTop: 12 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  deleteBtn: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: "#FECACA", backgroundColor: "#FFF5F5", alignItems: "center", justifyContent: "center", marginTop: 8 },
  deleteBtnText: { color: "#B91C1C", fontWeight: "700", fontSize: 14 },
  disabled: { opacity: 0.55 },
});
