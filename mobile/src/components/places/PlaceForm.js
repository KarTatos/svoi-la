import { useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { GlassContainer, GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
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

function PickerList({ children, scrollY }) {
  const pulseScale = scrollY.interpolate({
    inputRange: [0, 20, 60, 120],
    outputRange: [1, 1.08, 1.14, 1.18],
    extrapolate: "clamp",
  });
  const pulseOpacity = scrollY.interpolate({
    inputRange: [0, 10, 40],
    outputRange: [0.45, 0.7, 0.9],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.pickerWrap}>
      <View style={styles.scrollHintRow}>
        <Animated.View
          style={[
            styles.scrollHintDot,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
        <Text style={styles.scrollHintText}>Потяните вверх/вниз</Text>
      </View>

      <Animated.ScrollView
        style={styles.pickerScroll}
        contentContainerStyle={styles.pickerContent}
        showsVerticalScrollIndicator
        bounces
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

function GlassPicker({ children, scrollY }) {
  const liquidGlass = isLiquidGlassAvailable();

  if (liquidGlass) {
    return (
      <GlassContainer style={styles.modalGlassWrap}>
        <GlassView glassEffectStyle="regular" style={styles.modalCardGlass}>
          <PickerList scrollY={scrollY}>{children}</PickerList>
        </GlassView>
      </GlassContainer>
    );
  }

  return (
    <View style={styles.modalCard}>
      <PickerList scrollY={scrollY}>{children}</PickerList>
    </View>
  );
}

export default function PlaceForm({ form, actions, loading, error }) {
  const [catOpen, setCatOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const catScrollY = useRef(new Animated.Value(0)).current;
  const districtScrollY = useRef(new Animated.Value(0)).current;

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
      <Pressable style={styles.selectBtn} onPress={() => setCatOpen(true)}>
        <Text style={[styles.selectText, !form.cat && styles.selectPlaceholder]}>
          {PLACE_CATS.find((c) => c.id === form.cat)?.title || "Выберите категорию"}
        </Text>
      </Pressable>

      <Text style={styles.label}>Район *</Text>
      <Pressable style={styles.selectBtn} onPress={() => setDistrictOpen(true)}>
        <Text style={[styles.selectText, !form.district && styles.selectPlaceholder]}>
          {DISTRICTS.find((d) => d.id === form.district)?.name || "Выберите район"}
        </Text>
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
      {form.address && !form.addrValidPlace ? <Text style={styles.error}>Выберите адрес из подсказок.</Text> : null}

      <Text style={styles.label}>Комментарий *</Text>
      <TextInput
        value={form.tip}
        onChangeText={(v) => actions.onChangeField("tip", v.slice(0, 280))}
        placeholder="Ваш отзыв, совет, рекомендация..."
        style={[styles.input, styles.textarea]}
        multiline
      />
      <Text style={styles.count}>{form.tip.length}/280</Text>

      <PlacePhotoPicker photos={form.photos} onChange={actions.onPhotosChange} disabled={loading} max={5} />

      {error ? <Text style={[styles.error, styles.errorBlock]}>{error}</Text> : null}

      <View style={styles.actionsRow}>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={actions.onCancel} disabled={loading}>
          <Text style={styles.btnGhostText}>Отмена</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnPrimary, loading ? styles.btnDisabled : null]} onPress={actions.onSubmit} disabled={loading}>
          <Text style={styles.btnPrimaryText}>{loading ? "Загрузка..." : "Опубликовать"}</Text>
        </Pressable>
      </View>

      <Modal visible={catOpen} transparent animationType="fade" onRequestClose={() => setCatOpen(false)}>
        <Pressable style={styles.modalBg} onPress={() => setCatOpen(false)}>
          <GlassPicker scrollY={catScrollY}>
            {PLACE_CATS.map((c) => (
              <Pressable
                key={c.id}
                style={styles.modalItem}
                onPress={() => {
                  actions.onChangeField("cat", c.id);
                  setCatOpen(false);
                }}
              >
                <Text style={styles.modalItemText}>{c.icon} {c.title}</Text>
              </Pressable>
            ))}
          </GlassPicker>
        </Pressable>
      </Modal>

      <Modal visible={districtOpen} transparent animationType="fade" onRequestClose={() => setDistrictOpen(false)}>
        <Pressable style={styles.modalBg} onPress={() => setDistrictOpen(false)}>
          <GlassPicker scrollY={districtScrollY}>
            {DISTRICTS.map((d) => (
              <Pressable
                key={d.id}
                style={styles.modalItem}
                onPress={() => {
                  actions.onChangeField("district", d.id);
                  setDistrictOpen(false);
                }}
              >
                <Text style={styles.modalItemText}>{d.name}</Text>
              </Pressable>
            ))}
          </GlassPicker>
        </Pressable>
      </Modal>
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
  suggestBox: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, overflow: "hidden", backgroundColor: "#fff" },
  suggestItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  suggestText: { fontSize: 12, color: "#4B5563" },
  selectBtn: { borderWidth: 1, borderColor: "#DFD8C8", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  selectText: { color: "#111827", fontSize: 14, fontWeight: "600" },
  selectPlaceholder: { color: "#9CA3AF", fontWeight: "500" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 20 },
  modalGlassWrap: { borderRadius: 18, overflow: "hidden", maxHeight: "76%" },
  modalCardGlass: {
    borderRadius: 18,
    overflow: "hidden",
    maxHeight: "76%",
    backgroundColor: "rgba(255,255,255,0.66)",
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 14, maxHeight: "76%", overflow: "hidden" },
  pickerWrap: { maxHeight: 520 },
  pickerScroll: { maxHeight: 472 },
  pickerContent: { paddingBottom: 8 },
  scrollHintRow: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  scrollHintDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#F47B20",
  },
  scrollHintText: { color: "#F3F4F6", fontSize: 12, fontWeight: "700" },
  modalItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(241,245,249,0.85)" },
  modalItemText: { color: "#111827", fontSize: 14, fontWeight: "600" },
  actionsRow: { marginTop: 10, flexDirection: "row", gap: 10 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB" },
  btnGhostText: { color: "#111827", fontWeight: "700" },
  btnPrimary: { backgroundColor: "#111827" },
  btnPrimaryText: { color: "#fff", fontWeight: "700" },
  btnDisabled: { opacity: 0.6 },
});
