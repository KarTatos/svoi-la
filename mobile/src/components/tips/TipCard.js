import { useCallback, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Heart, MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react-native";

function canManageComment(comment, user, isAdmin) {
  if (!user) return false;
  if (isAdmin) return true;
  return Boolean(comment?.userId && comment.userId === user.id);
}

export default function TipCard({
  tip,
  isExpanded,
  isFavorited,
  canEdit,
  showComments,
  user,
  isAdmin,
  onToggleExpand,
  onOpenPhoto,
  onToggleFavorite,
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

  const handleThreeDots = useCallback(() => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Отмена", "Редактировать", "Удалить"],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
      },
      (idx) => {
        if (idx === 1) onEdit?.();
        if (idx === 2) {
          Alert.alert(
            "Удалить совет?",
            "Это действие нельзя отменить.",
            [
              { text: "Отмена", style: "cancel" },
              { text: "Удалить", style: "destructive", onPress: () => onDelete?.() },
            ]
          );
        }
      }
    );
  }, [onEdit, onDelete]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: tip.title || "Совет",
        message: `${tip.title || ""}\n${tip.text || ""}`,
      });
    } catch {}
  }, [tip]);

  const likesCount = tip.likes || 0;
  const commentsCount = (tip.comments || []).length;

  return (
    <View style={[styles.card, isExpanded && styles.cardExpanded]}>
      {/* Body — tap to expand */}
      <Pressable onPress={() => onToggleExpand(!isExpanded)} style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{tip.title}</Text>
          {canEdit ? (
            <Pressable
              onPress={(e) => { e.stopPropagation(); handleThreeDots(); }}
              style={styles.dotsBtn}
              hitSlop={10}
            >
              <MoreHorizontal size={18} color="#C4C4C4" />
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.text} numberOfLines={isExpanded ? undefined : 3}>
          {tip.text}
        </Text>

        {isExpanded && Array.isArray(tip.photos) && tip.photos.length > 0 && (
          <View style={styles.photosRow}>
            {tip.photos.map((ph, pi) => (
              <Pressable
                key={`${tip.id}-${pi}`}
                onPress={(e) => { e.stopPropagation(); onOpenPhoto?.(tip.photos, pi); }}
              >
                <Image source={{ uri: ph }} style={styles.photo} />
              </Pressable>
            ))}
          </View>
        )}
      </Pressable>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Pressable style={styles.footerAction} onPress={() => onOpenComments?.()}>
            <MessageCircle size={15} color="#9CA3AF" strokeWidth={1.8} />
            <Text style={styles.footerCount}>{commentsCount}</Text>
          </Pressable>

          <Pressable style={styles.footerAction} onPress={() => onToggleFavorite?.()}>
            <Heart
              size={15}
              color={isFavorited ? "#E74C3C" : "#9CA3AF"}
              fill={isFavorited ? "#E74C3C" : "none"}
              strokeWidth={1.8}
            />
            <Text style={[styles.footerCount, isFavorited && styles.likedCount]}>
              {likesCount}
            </Text>
          </Pressable>

          <Pressable style={styles.footerAction} onPress={handleShare}>
            <Share2 size={15} color="#9CA3AF" strokeWidth={1.8} />
          </Pressable>
        </View>

        <Text style={styles.author}>от {tip.author || "пользователь"}</Text>
      </View>

      {/* Comments — only when expanded and open */}
      {isExpanded && showComments ? (
        <View style={styles.commentsSection}>
          {(tip.comments || []).map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHead}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                {canManageComment(comment, user, isAdmin) ? (
                  <Pressable
                    hitSlop={10}
                    onPress={() => {
                      ActionSheetIOS.showActionSheetWithOptions(
                        {
                          options: ["Отмена", "Редактировать", "Удалить"],
                          destructiveButtonIndex: 2,
                          cancelButtonIndex: 0,
                        },
                        (idx) => {
                          if (idx === 1) {
                            setEditingId(comment.id);
                            setEditingText(comment.text || "");
                          }
                          if (idx === 2) {
                            Alert.alert("Удалить мнение?", "", [
                              { text: "Отмена", style: "cancel" },
                              {
                                text: "Удалить",
                                style: "destructive",
                                onPress: () => onDeleteComment?.(comment.id),
                              },
                            ]);
                          }
                        }
                      );
                    }}
                  >
                    <MoreHorizontal size={16} color="#C4C4C4" />
                  </Pressable>
                ) : null}
              </View>

              {editingId === comment.id ? (
                <View style={styles.editBlock}>
                  <TextInput
                    value={editingText}
                    onChangeText={setEditingText}
                    style={styles.input}
                    placeholder="Текст мнения"
                    multiline
                  />
                  <View style={styles.editBtns}>
                    <Pressable
                      style={styles.saveBtn}
                      onPress={() => {
                        onUpdateComment?.(comment.id, editingText);
                        setEditingId("");
                        setEditingText("");
                      }}
                    >
                      <Text style={styles.saveBtnText}>Сохранить</Text>
                    </Pressable>
                    <Pressable
                      style={styles.cancelBtn}
                      onPress={() => { setEditingId(""); setEditingText(""); }}
                    >
                      <Text style={styles.cancelBtnText}>Отмена</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Text style={styles.commentText}>{comment.text}</Text>
              )}
            </View>
          ))}

          {user ? (
            <View style={styles.addRow}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                style={styles.input}
                placeholder="Оставьте мнение..."
                multiline
              />
              <Pressable
                onPress={() => {
                  const clean = commentText.trim();
                  if (!clean) return;
                  onAddComment?.(clean);
                  setCommentText("");
                }}
                disabled={!commentText.trim()}
                style={[styles.sendBtn, !commentText.trim() && styles.disabled]}
              >
                <Send size={18} color="#FFF" strokeWidth={2} />
              </Pressable>
            </View>
          ) : (
            <Text style={styles.loginHint}>Войдите, чтобы оставить мнение</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardExpanded: {
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  body: {
    padding: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 22,
  },
  dotsBtn: {
    paddingTop: 2,
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4B5563",
  },
  photosRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerCount: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  likedCount: {
    color: "#E74C3C",
  },
  author: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    padding: 14,
    gap: 10,
  },
  commentItem: {
    backgroundColor: "#F7F6F2",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  commentHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  commentText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#374151",
  },
  editBlock: {
    gap: 8,
    marginTop: 6,
  },
  editBtns: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  saveBtn: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
  },
  addRow: {
    gap: 8,
  },
  sendBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#F47B20",
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  loginHint: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 4,
  },
  disabled: {
    opacity: 0.45,
  },
});
