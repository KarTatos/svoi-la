import { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View, Image } from "react-native";
import MarketCard from "./MarketCard";
import MarketForm from "./MarketForm";

function formatPrice(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.startsWith("$") ? raw : `$${raw}`;
}

export default function MarketScreen({
  user,
  authLoading,
  authBusy,
  items,
  loading,
  error,
  likedMap,
  onRetry,
  onGoHome,
  onRequireAuth,
  onToggleLike,
  onRecordView,
  marketForm,
  canManage,
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const query = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      (items || []).filter((it) => {
        if (!query) return true;
        return String(it.title || "").toLowerCase().includes(query) || String(it.description || "").toLowerCase().includes(query);
      }),
    [items, query]
  );

  const openAdd = () => {
    if (authLoading || authBusy) return;
    if (!user) {
      onRequireAuth?.();
      return;
    }
    marketForm.openCreate();
  };

  const openItem = (item) => {
    setSelected(item);
    onRecordView?.(item.id);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <Pressable onPress={onGoHome} style={styles.backBtn}><Text style={styles.backBtnText}>‹</Text></Pressable>
        <View style={styles.titleIcon}><Text style={styles.titleIconText}>🏷️</Text></View>
        <Pressable onPress={openAdd} style={styles.addBtn}><Text style={styles.addBtnText}>+</Text></Pressable>
      </View>

      <TextInput value={search} onChangeText={setSearch} placeholder="Поиск объявлений..." style={styles.search} />

      {loading ? (
        <View style={styles.stateBox}><ActivityIndicator /><Text style={styles.stateText}>Загрузка объявлений...</Text></View>
      ) : error ? (
        <View style={styles.stateBox}><Text style={styles.errorText}>Ошибка: {error}</Text><Pressable onPress={onRetry}><Text style={styles.retry}>Повторить</Text></Pressable></View>
      ) : filtered.length === 0 ? (
        <View style={styles.stateBox}><Text style={styles.stateText}>{query ? `Ничего не найдено по запросу «${search}»` : "Объявлений пока нет. Будьте первым!"}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.gridCell}>
              <MarketCard
                item={item}
                isLiked={Boolean(likedMap[`market-${item.id}`])}
                onOpen={() => openItem(item)}
                onToggleLike={() => onToggleLike(item.id)}
              />
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBg}>
          <View style={styles.detailSheet}>
            <Pressable onPress={() => setSelected(null)} style={styles.detailClose}><Text style={styles.detailCloseText}>‹</Text></Pressable>
            {selected ? (
              <ScrollView>
                <View style={styles.detailPhotoWrap}>
                  {selected.photos?.[0] ? <Image source={{ uri: selected.photos[0] }} style={styles.detailPhoto} /> : <View style={styles.detailNoPhoto}><Text style={{ fontSize: 56 }}>🏷️</Text></View>}
                </View>

                <View style={styles.detailBody}>
                  {selected.price ? <Text style={styles.detailPrice}>{formatPrice(selected.price)}</Text> : null}
                  <Text style={styles.detailTitle}>{selected.title}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>👁 {selected.views || 0}</Text>
                    <Text style={[styles.meta, Boolean(likedMap[`market-${selected.id}`]) && { color: "#E74C3C" }]}>♥ {selected.likes || 0}</Text>
                    <Pressable
                      style={styles.shareBtn}
                      onPress={() =>
                        Share.share({
                          title: selected.title || "SVOI LA",
                          message: `${selected.title || "Объявление"}\n${selected.description || ""}`,
                        })
                      }
                    >
                      <Text style={styles.meta}>Поделиться</Text>
                    </Pressable>
                  </View>

                  {selected.description ? <Text style={styles.desc}>{selected.description}</Text> : null}

                  {(selected.telegram || selected.phone) ? (
                    <View style={styles.contactsRow}>
                      {selected.telegram ? <Text style={styles.contactPill}>✈️ {selected.telegram.startsWith("@") ? selected.telegram : `@${selected.telegram}`}</Text> : null}
                      {selected.phone ? <Text style={styles.contactPill}>📞 {selected.phone}</Text> : null}
                    </View>
                  ) : null}

                  {canManage(selected) ? (
                    <Pressable onPress={() => { setSelected(null); marketForm.openEdit(selected); }} style={styles.editBtn}><Text style={styles.editBtnText}>Редактировать</Text></Pressable>
                  ) : null}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <MarketForm
        visible={marketForm.visible}
        editing={marketForm.editingItem}
        form={marketForm.form}
        setForm={marketForm.setForm}
        saving={marketForm.saving}
        error={marketForm.error}
        onSave={marketForm.save}
        onDelete={marketForm.remove}
        onClose={marketForm.close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 8 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  backBtnText: { fontSize: 24, lineHeight: 24, color: "#8A8680" },
  titleIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#F2EADF", alignItems: "center", justifyContent: "center" },
  titleIconText: { fontSize: 19 },
  addBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1.5, borderColor: "#F47B2088", backgroundColor: "#FFF3E8", alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#F47B20", fontSize: 28, lineHeight: 28 },
  search: { minHeight: 46, borderRadius: 13, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", paddingHorizontal: 12, marginBottom: 12 },
  stateBox: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E7E1D2", flexDirection: "row", gap: 8, alignItems: "center" },
  stateText: { color: "#6B6B6B", fontSize: 13, flex: 1 },
  errorText: { color: "#B91C1C", fontSize: 13, flex: 1 },
  retry: { color: "#111827", fontWeight: "700", fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 120 },
  gridCell: { width: "48.5%" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  detailSheet: { backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: "92%" },
  detailClose: { position: "absolute", left: 14, top: 14, zIndex: 2, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  detailCloseText: { color: "#fff", fontSize: 24, lineHeight: 24 },
  detailPhotoWrap: { width: "100%", aspectRatio: 1.3, backgroundColor: "#EFECE6" },
  detailPhoto: { width: "100%", height: "100%" },
  detailNoPhoto: { flex: 1, alignItems: "center", justifyContent: "center" },
  detailBody: { padding: 16 },
  detailPrice: { fontSize: 26, fontWeight: "800", color: "#F47B20" },
  detailTitle: { marginTop: 4, fontSize: 17, fontWeight: "700", color: "#111827" },
  metaRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 14 },
  meta: { fontSize: 12, color: "#6B6B6B" },
  shareBtn: { marginLeft: "auto" },
  desc: { marginTop: 12, color: "#6B6B6B", fontSize: 14, lineHeight: 22 },
  contactsRow: { marginTop: 12, gap: 8 },
  contactPill: { alignSelf: "flex-start", backgroundColor: "#F7F7F8", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, color: "#374151" },
  editBtn: { marginTop: 14, minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  editBtnText: { fontSize: 13, fontWeight: "700", color: "#111827" },
});
