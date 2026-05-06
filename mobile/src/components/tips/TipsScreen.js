import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import PhotoViewerModal from "../PhotoViewerModal";
import { TIPS_CATS } from "../../config/tips";
import TipCard from "./TipCard";
import TipForm from "./TipForm";

function topBarButtonStyle(type) {
  if (type === "add") {
    return {
      backgroundColor: "#FFF3E8",
      borderWidth: 1.5,
      borderColor: "#F47B2088",
    };
  }
  if (type === "center") {
    return { backgroundColor: "#F2EADF" };
  }
  return { backgroundColor: "#FFFFFF" };
}

export default function TipsScreen({
  tips,
  loading,
  selectedCategory,
  setSelectedCategory,
  expandedTip,
  setExpandedTip,
  likesMap,
  favorites,
  commentsOpen,
  setCommentsOpen,
  user,
  isAdmin,
  onGoHome,
  onRequireAuth,
  onOpenCreate,
  tipForm,
  onToggleFavorite,
  onToggleLike,
  onRecordView,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  canManageTip,
  onEditTip,
  onDeleteTip,
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPhotos, setViewerPhotos] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const applySearch = () => setSearchApplied(searchInput.trim());

  const filteredBySearch = useMemo(() => {
    const q = String(searchApplied || "").trim().toLowerCase();
    if (!q) return [];
    return (tips || []).filter((tip) => {
      const catTitle = TIPS_CATS.find((c) => c.id === tip.cat)?.title || "";
      const hay = `${tip.title || ""} ${tip.text || ""} ${catTitle}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tips, searchApplied]);

  const catTips = useMemo(() => {
    if (!selectedCategory) return [];
    return (tips || []).filter((t) => t.cat === selectedCategory.id);
  }, [tips, selectedCategory]);

  const openPhoto = (photos, index) => {
    setViewerPhotos(Array.isArray(photos) ? photos : []);
    setViewerIndex(Number(index || 0));
    setViewerOpen(true);
  };

  const renderTip = (tip, categoryLabel, canEdit = false) => (
    <TipCard
      key={tip.id}
      tip={tip}
      isExpanded={expandedTip === tip.id}
      isLiked={Boolean(likesMap[`tip-${tip.id}`])}
      isFavorited={Boolean(favorites[`tip-${tip.id}`])}
      canEdit={canEdit}
      categoryLabel={categoryLabel}
      showComments={commentsOpen === `tip-${tip.id}`}
      user={user}
      isAdmin={isAdmin}
      onToggleExpand={(open) => {
        setExpandedTip(open ? tip.id : null);
        if (open) onRecordView(tip.id);
      }}
      onOpenPhoto={openPhoto}
      onToggleFavorite={() => onToggleFavorite(tip.id)}
      onToggleLike={() => onToggleLike(tip.id)}
      onOpenComments={() => setCommentsOpen(commentsOpen === `tip-${tip.id}` ? "" : `tip-${tip.id}`)}
      onAddComment={(text) => onAddComment(tip.id, text)}
      onUpdateComment={onUpdateComment}
      onDeleteComment={onDeleteComment}
      onEdit={() => onEditTip(tip)}
      onDelete={() => onDeleteTip(tip)}
    />
  );

  return (
    <View style={styles.root}>
      {!selectedCategory ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <Pressable onPress={onGoHome} style={[styles.topBtn, topBarButtonStyle("back")]}><Text style={styles.topBack}>‹</Text></Pressable>
            <View style={[styles.topBtn, topBarButtonStyle("center")]}><Text style={styles.topCenter}>💡</Text></View>
            <Pressable onPress={onOpenCreate} style={[styles.topBtn, topBarButtonStyle("add")]}><Text style={styles.topAdd}>+</Text></Pressable>
          </View>

          <View style={styles.searchRow}>
            <TextInput value={searchInput} onChangeText={setSearchInput} placeholder="Поиск по советам" style={styles.searchInput} />
            <Pressable onPress={applySearch} style={styles.searchBtn}><Text style={styles.searchBtnTxt}>🔍</Text></Pressable>
          </View>

          {searchApplied ? (
            <View>
              {filteredBySearch.length === 0 ? (
                <View style={styles.emptyBox}><Text style={styles.emptyText}>Ничего не найдено по запросу: “{searchApplied}”</Text></View>
              ) : (
                filteredBySearch.map((tip) => renderTip(tip, TIPS_CATS.find((c) => c.id === tip.cat)?.title || "", false))
              )}
            </View>
          ) : (
            <View style={styles.catList}>
              {TIPS_CATS.map((c) => {
                const cnt = (tips || []).filter((t) => t.cat === c.id).length;
                return (
                  <Pressable key={c.id} onPress={() => setSelectedCategory(c)} style={styles.catCard}>
                    <View style={styles.catIcon}><Text style={styles.catIconText}>{c.icon}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.catTitle}>{c.title}</Text>
                      <Text style={styles.catDesc}>{c.desc}</Text>
                    </View>
                    {cnt > 0 ? <Text style={styles.catCount}>{cnt}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <Pressable onPress={() => setSelectedCategory(null)} style={[styles.topBtn, topBarButtonStyle("back")]}><Text style={styles.topBack}>‹</Text></Pressable>
            <View style={[styles.topBtn, topBarButtonStyle("center")]}><Text style={styles.topCenter}>{selectedCategory.icon}</Text></View>
            <Pressable onPress={onOpenCreate} style={[styles.topBtn, topBarButtonStyle("add")]}><Text style={styles.topAdd}>+</Text></Pressable>
          </View>

          {(catTips || []).map((tip) => renderTip(tip, "", canManageTip(tip)))}
          <Pressable style={styles.shareExpBtn} onPress={onOpenCreate}><Text style={styles.shareExpText}>＋ Поделиться опытом</Text></Pressable>
        </ScrollView>
      )}

      <TipForm
        visible={tipForm.visible}
        selectedCategory={selectedCategory}
        editingTip={tipForm.editingTip}
        form={tipForm.form}
        photos={tipForm.photos}
        loading={tipForm.loading}
        error={tipForm.error}
        canDelete={Boolean(tipForm.editingTip && canManageTip(tipForm.editingTip))}
        onChange={(field, value) => tipForm.setForm((prev) => ({ ...prev, [field]: value }))}
        onPhotos={tipForm.setPhotos}
        onClose={tipForm.reset}
        onSubmit={tipForm.submit}
        onDelete={tipForm.remove}
      />

      <PhotoViewerModal visible={viewerOpen} photos={viewerPhotos} index={viewerIndex} onRequestClose={() => setViewerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFECE6" },
  content: { padding: 16, paddingBottom: 120 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  topBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topBack: { fontSize: 24, lineHeight: 24, color: "#8A8680" },
  topCenter: { fontSize: 18 },
  topAdd: { fontSize: 28, lineHeight: 28, color: "#F47B20" },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: "#E5E5E5", backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: "#111827", fontSize: 14 },
  searchBtn: { minWidth: 44, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5E5", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  searchBtnTxt: { fontSize: 16 },
  catList: { gap: 8 },
  catCard: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", padding: 16, flexDirection: "row", alignItems: "center", gap: 14 },
  catIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#FFF3E8", alignItems: "center", justifyContent: "center" },
  catIconText: { fontSize: 24 },
  catTitle: { fontWeight: "700", fontSize: 15, color: "#1A1A1A" },
  catDesc: { fontSize: 12, color: "#6B6B6B", marginTop: 2 },
  catCount: { fontSize: 13, fontWeight: "700", color: "#F47B20" },
  emptyBox: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", padding: 16 },
  emptyText: { color: "#6B6B6B", fontSize: 13 },
  shareExpBtn: { marginTop: 4, borderRadius: 16, borderWidth: 2, borderStyle: "dashed", borderColor: "#F47B2060", paddingVertical: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  shareExpText: { color: "#F47B20", fontWeight: "700", fontSize: 14 },
});
