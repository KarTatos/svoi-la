import { useState } from "react";
import { Image, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";

function canManageComment(comment, user, isAdmin) {
  if (!user) return false;
  if (isAdmin) return true;
  return Boolean(comment?.userId && comment.userId === user.id);
}

export default function TipCard({
  tip,
  isExpanded,
  isLiked,
  isFavorited,
  canEdit,
  categoryLabel,
  showComments,
  user,
  isAdmin,
  onToggleExpand,
  onOpenPhoto,
  onToggleFavorite,
  onToggleLike,
  onOpenComments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onEdit,
  onDelete,
}) {
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingText, setEditingText] = useState("");

  return (
    <View style={[styles.card, isExpanded && styles.cardExpanded]}>
      <Pressable style={styles.header} onPress={() => onToggleExpand(!isExpanded)}>
        {categoryLabel ? <Text style={styles.categoryLabel}>{categoryLabel}</Text> : null}
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.text} numberOfLines={isExpanded ? undefined : 2}>{tip.text}</Text>

        {isExpanded && Array.isArray(tip.photos) && tip.photos.length > 0 ? (
          <View style={styles.photosRow}>
            {tip.photos.map((ph, pi) => (
              <Pressable key={`${tip.id}-${pi}`} onPress={(e) => { e.stopPropagation(); onOpenPhoto(tip.photos, pi); }}>
                <Image source={{ uri: ph }} style={styles.photo} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.author}>от {tip.author}</Text>
          <View style={styles.inlineStats}>
            <Pressable onPress={(e) => { e.stopPropagation(); onToggleFavorite(); }}><Text style={[styles.metaIcon, isFavorited && styles.favorite]}>★</Text></Pressable>
            <Text style={styles.metaStat}>👁 {tip.views || 0}</Text>
            <Text style={[styles.metaStat, isLiked && styles.like]}>♥ {tip.likes || 0}</Text>
            <Text style={styles.metaStat}>💬 {(tip.comments || []).length}</Text>
          </View>
        </View>
      </Pressable>

      {isExpanded ? (
        <View style={styles.actionsPanel}>
          <View style={styles.actionsRow}>
            <Pressable onPress={onToggleFavorite}><Text style={[styles.actionText, isFavorited && styles.favorite]}>★</Text></Pressable>
            <Pressable onPress={onToggleLike}><Text style={[styles.actionText, isLiked && styles.like]}>♥ {tip.likes || 0}</Text></Pressable>
            <Pressable onPress={onOpenComments}><Text style={styles.actionText}>◍ {(tip.comments || []).length}</Text></Pressable>
            <Pressable
              onPress={async () => {
                await Share.share({ title: tip.title || "Совет", message: `${tip.title}\n${tip.text}` });
              }}
              style={{ marginLeft: "auto" }}
            >
              <Text style={styles.actionText}>Поделиться</Text>
            </Pressable>
          </View>

          {showComments ? (
            <View style={styles.commentsWrap}>
              {(tip.comments || []).map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHead}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    {canManageComment(comment, user, isAdmin) ? (
                      <View style={styles.commentActions}>
                        <Pressable onPress={() => { setEditingId(comment.id); setEditingText(comment.text || ""); }}><Text style={styles.commentAction}>Редактировать</Text></Pressable>
                        <Pressable onPress={() => onDeleteComment(comment.id)}><Text style={[styles.commentAction, styles.delete]}>Удалить</Text></Pressable>
                      </View>
                    ) : null}
                  </View>
                  {editingId === comment.id ? (
                    <View style={styles.editRow}>
                      <TextInput value={editingText} onChangeText={setEditingText} style={styles.input} placeholder="Текст комментария" />
                      <Pressable onPress={() => { onUpdateComment(comment.id, editingText); setEditingId(""); setEditingText(""); }} style={styles.saveBtn}><Text style={styles.saveBtnText}>Сохранить</Text></Pressable>
                    </View>
                  ) : (
                    <Text style={styles.commentText}>{comment.text}</Text>
                  )}
                </View>
              ))}

              {user ? (
                <View style={styles.addRow}>
                  <TextInput value={commentText} onChangeText={setCommentText} style={styles.input} placeholder="Оставьте комментарий" />
                  <Pressable
                    onPress={() => {
                      const clean = commentText.trim();
                      if (!clean) return;
                      onAddComment(clean);
                      setCommentText("");
                    }}
                    style={[styles.sendBtn, !commentText.trim() && styles.disabled]}
                  >
                    <Text style={styles.sendBtnText}>Отправить</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.loginHint}>Войдите, чтобы оставить комментарий</Text>
              )}
            </View>
          ) : null}

          {canEdit ? (
            <View style={styles.manageRow}>
              <Pressable style={styles.manageBtn} onPress={onEdit}><Text style={styles.manageTxt}>Редактировать</Text></Pressable>
              <Pressable style={[styles.manageBtn, styles.deleteBtn]} onPress={onDelete}><Text style={[styles.manageTxt, styles.delete]}>Удалить</Text></Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", marginBottom: 12, overflow: "hidden" },
  cardExpanded: { borderColor: "#F47B2055" },
  header: { padding: 16 },
  categoryLabel: { fontSize: 11, color: "#A0A0A0", marginBottom: 4 },
  title: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 6 },
  text: { fontSize: 13, lineHeight: 21, color: "#6B6B6B" },
  photosRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  photo: { width: 86, height: 86, borderRadius: 10, borderWidth: 1, borderColor: "#E5E5E5" },
  metaRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  author: { fontSize: 11, color: "#999" },
  inlineStats: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaIcon: { fontSize: 14, color: "#9CA3AF" },
  metaStat: { fontSize: 12, color: "#6B6B6B" },
  favorite: { color: "#D68910" },
  like: { color: "#E74C3C" },
  actionsPanel: { borderTopWidth: 1, borderTopColor: "#F0F0F0", padding: 14 },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8 },
  actionText: { fontSize: 14, color: "#6B6B6B" },
  commentsWrap: { gap: 8 },
  commentItem: { backgroundColor: "#F7F6F2", borderRadius: 10, padding: 10 },
  commentHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commentAuthor: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
  commentActions: { flexDirection: "row", gap: 10 },
  commentAction: { fontSize: 12, color: "#6B6B6B" },
  delete: { color: "#B91C1C" },
  commentText: { marginTop: 4, fontSize: 13, color: "#4B5563" },
  editRow: { marginTop: 8, gap: 8 },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, backgroundColor: "#FFF", paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827" },
  saveBtn: { alignSelf: "flex-start", backgroundColor: "#111827", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 12 },
  addRow: { gap: 8 },
  sendBtn: { alignSelf: "flex-start", backgroundColor: "#F47B20", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  sendBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  loginHint: { fontSize: 12, color: "#6B6B6B" },
  disabled: { opacity: 0.5 },
  manageRow: { marginTop: 6, flexDirection: "row", gap: 8 },
  manageBtn: { flex: 1, minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  deleteBtn: { borderColor: "#FECACA", backgroundColor: "#FFF5F5" },
  manageTxt: { fontSize: 12, fontWeight: "700", color: "#374151" },
});
