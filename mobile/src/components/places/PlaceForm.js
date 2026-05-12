import { useActionSheet } from "@expo/react-native-action-sheet";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { DISTRICTS, PLACE_CATS } from "../../config/places";
import PlacePhotoPicker from "./PlacePhotoPicker";

function SuggestList({ items, onSelect }) {
  if (!items.length) return null;
  return (
    <View style={styles.suggestBox}>
      {items.map((opt, i) => (
        <Pressable key={`${opt.value}-${i}`} onPress={() => onSelect(opt)} style={styles.suggestItem}>
          <Text style={styles.suggestText}>{opt.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function PlaceForm({ form, actions, loading, error, editMode }) {
  const { showActionSheetWithOptions } = useActionSheet();

  const openCategoryPicker = () => {
    const options = [...PLACE_CATS.map((c) => `${c.icon}  ${c.title}`), "Отмена"];
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: "Категория",
      },
      (index) => {
        if (index == null || index === options.length - 1) return;
        actions.onChangeField("cat", PLACE_CATS[index].id);
      }
    );
  };

  const openDistrictPicker = () => {
    const options = [...DISTRICTS.map((d) => `${d.emoji}  ${d.name}`), "Отмена"];
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: "Район",
      },
      (index) => {
        if (index == null || index === options.length - 1) return;
        actions.onChangeField("district", DISTRICTS[index].id);
      }
    );
  };

  const selectedCat = PLACE_CATS.find((c) => c.id === form.cat);
  const selectedDistrict = DISTRICTS.find((d) => d.id === form.district);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Название *</Text>
      <TextInput
        value={form.name}
        onChangeText={actions.onChangeName}
        placeholder="Name (English)"
        style={styles.input}
        autoCapitalize="words"
      />
      {form.nameLoading ? <Text style={styles.hint}>Searching...</Text> : null}
      <SuggestList items={form.nameOptions} onSelect={actions.onSelectNameSuggestion} />

      <Text style={styles.label}>Категория *</Text>
      <Pressable style={styles.selectBtn} onPress={openCategoryPicker}>
        <Text style={styles.selectBtnLeft}>
          {selectedCat
            ? <Text style={styles.selectText}>{selectedCat.icon}  {selectedCat.title}</Text>
            : <Text style={styles.selectPlaceholder}>Выберите категорию</Text>}
        </Text>
        <Text style={styles.selectChevron}>›</Text>
      </Pressable>

      <Text style={styles.label}>Район *</Text>
      <Pressable style={styles.selectBtn} onPress={openDistrictPicker}>
        <Text style={styles.selectBtnLeft}>
          {selectedDistrict
            ? <Text style={styles.selectText}>{selectedDistrict.emoji}  {selectedDistrict.name}</Text>
            : <Text style={styles.selectPlaceholder}>Выберите район</Text>}
        </Text>
        <Text style={styles.selectChevron}>›</Text>
      </Pressable>

      <Text style={styles.label}>Адрес *</Text>
      <TextInput
        value={form.address}
        onChangeText={actions.onChangeAddress}
        placeholder="Street address (English)"
        style={[styles.input, form.address && !form.addrValidPlace ? styles.inputInvalid : null]}
      />
      {form.addrLoading ? <Text style={styles.hint}>Searching...</Text> : null}
      <SuggestList items={form.addrOptions} onSelect={actions.onSelectAddressSuggestion} />
      {form.address && !form.addrValidPlace
        ? <Text style={styles.error}>Выберите адрес из подсказок.</Text>
        : null}

      <Text style={styles.label}>Комментарий *</Text>
      <TextInput
        value={form.tip}
        onChangeText={(v) => actions.onChangeField("tip", v.slice(0, 280))}
        placeholder="Ваш отзыв, совет, рекомендация..."
        style={[styles.input, styles.textarea]}
        multiline
        textAlignVertical="top"
      />
      <Text style={styles.count}>{form.tip.length}/280</Text>

      <PlacePhotoPicker
        photos={form.photos}
        onChange={actions.onPhotosChange}
        existingPhotos={form.existingPhotos || []}
        onRemoveExisting={actions.onRemoveExistingPhoto}
        disabled={loading}
        max={5}
      />

      {error ? <Text style={[styles.error, styles.errorBlock]}>{error}</Text> : null}

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.btn, styles.btnGhost]}
          onPress={actions.onCancel}
          disabled={loading}
        >
          <Text style={styles.btnGhostText}>Отмена</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={actions.onSubmit}
          disabled={loading}
        >
          <Text style={styles.btnPrimaryText}>
            {loading ? "Сохранение..." : editMode ? "Сохранить" : "Опубликовать"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },

  label: { marginTop: 6, fontSize: 12, fontWeight: "700", color: "#8A8680" },

  input: {
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
  textarea: { minHeight: 90, textAlignVertical: "top" },

  hint: { fontSize: 12, color: "#8A8680" },
  error: { fontSize: 12, color: "#E74C3C" },
  errorBlock: { marginTop: 4 },
  count: { fontSize: 11, color: "#A1A1AA", textAlign: "right" },

  suggestBox: {
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DFD8C8",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectBtnLeft: { flex: 1 },
  selectText: { color: "#111827", fontSize: 14, fontWeight: "600" },
  selectPlaceholder: { color: "#9CA3AF", fontSize: 14, fontWeight: "500" },
  selectChevron: { fontSize: 20, color: "#C4BFBA", marginLeft: 8 },

  actionsRow: { marginTop: 10, flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB" },
  btnGhostText: { color: "#111827", fontWeight: "700" },
  btnPrimary: { backgroundColor: "#111827" },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnDisabled: { opacity: 0.6 },
});
