import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import HousingCard from "./HousingCard";
import HousingForm from "./HousingForm";

export default function HousingScreen({
  user,
  authLoading,
  authBusy,
  items,
  loading,
  error,
  favorites,
  bedsFilter,
  setBedsFilter,
  sortFavorites,
  setSortFavorites,
  onGoHome,
  onRequireAuth,
  onOpenItem,
  onToggleFavorite,
  housingForm,
}) {
  const openAdd = () => {
    if (authLoading || authBusy) return;
    if (!user) {
      onRequireAuth?.();
      return;
    }
    housingForm.openCreate();
  };

  return (
    <View style={styles.root}>
      <View style={styles.headRow}>
        <Pressable style={styles.backBtn} onPress={onGoHome}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <View style={styles.iconWrap}><Text style={styles.icon}>🏠</Text></View>
        <Pressable style={styles.addBtn} onPress={openAdd}><Text style={styles.addBtnText}>+</Text></Pressable>
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Фильтр по спальням</Text>
        <View style={styles.filterRow}>
          {[
            { id: "all", label: "Все" },
            { id: "studio", label: "Studio" },
            { id: "1", label: "1+ bd" },
            { id: "2", label: "2+ bds" },
            { id: "room", label: "Комната" },
          ].map((opt) => (
            <Pressable key={opt.id} onPress={() => setBedsFilter(opt.id)} style={[styles.filterChip, bedsFilter === opt.id && styles.filterChipActive]}><Text style={[styles.filterChipText, bedsFilter === opt.id && styles.filterChipTextActive]}>{opt.label}</Text></Pressable>
          ))}
          <Pressable onPress={() => setSortFavorites((v) => !v)} style={[styles.starSort, sortFavorites && styles.starSortActive]}><Text style={[styles.starSortText, sortFavorites && styles.starSortTextActive]}>★</Text></Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.stateBox}><ActivityIndicator /><Text style={styles.stateText}>Загрузка жилья...</Text></View>
      ) : error ? (
        <View style={styles.stateBox}><Text style={styles.errorText}>Ошибка: {error}</Text></View>
      ) : items.length === 0 ? (
        <View style={styles.stateBox}><Text style={styles.stateText}>Ничего не найдено. Попробуйте другой запрос или фильтры.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {items.map((item) => (
            <HousingCard
              key={item.id}
              item={item}
              isFavorite={Boolean(favorites[`housing-${item.id}`])}
              onToggleFavorite={() => onToggleFavorite(item.id)}
              onOpen={() => onOpenItem(item)}
            />
          ))}
          <Pressable onPress={openAdd} style={styles.addBottom}><Text style={styles.addBottomText}>＋ Добавить жильё</Text></Pressable>
        </ScrollView>
      )}

      <HousingForm
        visible={housingForm.visible}
        editing={housingForm.editingItem}
        form={housingForm.form}
        setForm={housingForm.setForm}
        saving={housingForm.saving}
        error={housingForm.error}
        addressLoading={housingForm.addressLoading}
        onSearchAddress={housingForm.searchAddress}
        onPickAddress={housingForm.pickAddress}
        onSave={housingForm.save}
        onDelete={housingForm.remove}
        onClose={housingForm.close}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  backBtnText: { fontSize: 24, lineHeight: 24, color: "#8A8680" },
  iconWrap: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#F2EADF", alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 19 },
  addBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1.5, borderColor: "#F47B2088", backgroundColor: "#FFF3E8", alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#F47B20", fontSize: 28, lineHeight: 28 },
  filterCard: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E7E1D2", padding: 12, marginBottom: 10 },
  filterTitle: { fontSize: 12, color: "#6B6B6B", marginBottom: 8 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  filterChip: { borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 7 },
  filterChipActive: { backgroundColor: "#0E0E0E", borderColor: "#0E0E0E" },
  filterChipText: { color: "#0E0E0E", fontSize: 11, fontWeight: "600" },
  filterChipTextActive: { color: "#fff" },
  starSort: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  starSortActive: { backgroundColor: "#FFF6E8", borderColor: "#F4D6A8" },
  starSortText: { color: "#1E4D97", fontSize: 15 },
  starSortTextActive: { color: "#D68910" },
  list: { gap: 12, paddingBottom: 120 },
  stateBox: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E7E1D2", padding: 14, flexDirection: "row", gap: 8, alignItems: "center" },
  stateText: { color: "#6B6B6B", fontSize: 13 },
  errorText: { color: "#B91C1C", fontSize: 13 },
  addBottom: { minHeight: 46, borderRadius: 12, borderWidth: 2, borderStyle: "dashed", borderColor: "#F47B2066", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  addBottomText: { color: "#F47B20", fontWeight: "700", fontSize: 14 },
});
