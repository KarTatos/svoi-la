import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send } from "lucide-react-native";
import KeyboardDoneBar, { KEYBOARD_DONE_ID } from "../../src/components/KeyboardDoneBar";
import { useAuth } from "../../src/hooks/useAuth";
import { useCommunityQuery, useRepliesQuery } from "../../src/hooks/useCommunityQuery";
import { isSupabaseConfigured } from "../../src/lib/supabase";
import {
  createPost,
  deletePost,
  fetchUserPostLikes,
  togglePostLike,
} from "../../src/lib/community";
import PostCard from "../../src/components/community/PostCard";

export default function ThreadScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts = [] } = useCommunityQuery(isSupabaseConfigured);
  const post = posts.find((p) => String(p.id) === String(id)) || null;

  const { data: replies = [], isLoading: repliesLoading, refetch: refetchReplies } =
    useRepliesQuery(id, isSupabaseConfigured);

  const [liked, setLiked] = useState({});
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserPostLikes(user.id).then((map) => setLiked(map));
  }, [user?.id]);

  const likeMutation = useMutation({
    mutationFn: ({ postId }) => togglePostLike(postId, user?.id),
    onMutate: ({ postId }) => {
      const wasLiked = Boolean(liked[postId]);
      setLiked((prev) => ({ ...prev, [postId]: !wasLiked }));
    },
    onSuccess: ({ liked: nowLiked, likesCount }, { postId }) => {
      setLiked((prev) => ({ ...prev, [postId]: nowLiked }));
      queryClient.setQueryData(["community"], (prev = []) =>
        prev.map((p) => (String(p.id) === String(postId) ? { ...p, likesCount } : p))
      );
      queryClient.setQueryData(["community-replies", id], (prev = []) =>
        prev.map((p) => (String(p.id) === String(postId) ? { ...p, likesCount } : p))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: (_, postId) => {
      if (String(postId) === String(id)) {
        queryClient.setQueryData(["community"], (prev = []) =>
          prev.filter((p) => String(p.id) !== String(postId))
        );
        router.back();
      } else {
        queryClient.setQueryData(["community-replies", id], (prev = []) =>
          prev.filter((p) => String(p.id) !== String(postId))
        );
      }
    },
  });

  const handleLike = useCallback((postId) => {
    if (!user) { router.push("/login"); return; }
    likeMutation.mutate({ postId });
  }, [user, likeMutation, router]);

  const handleDelete = useCallback((postId) => {
    Alert.alert("Удалить?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      { text: "Удалить", style: "destructive", onPress: () => deleteMutation.mutate(postId) },
    ]);
  }, [deleteMutation]);

  const handleReply = async () => {
    const text = replyText.trim();
    if (!text || !user) return;
    setSubmitting(true);
    try {
      await createPost({
        text,
        author: user.name || user.email?.split("@")[0] || "Аноним",
        avatar_url: user.avatarUrl || null,
        user_id: user.id,
        parent_id: id,
      });
      setReplyText("");
      refetchReplies();
      queryClient.setQueryData(["community"], (prev = []) =>
        prev.map((p) =>
          String(p.id) === String(id) ? { ...p, repliesCount: p.repliesCount + 1 } : p
        )
      );
    } catch (e) {
      Alert.alert("Ошибка", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const data = post ? [{ type: "post", item: post }, ...replies.map((r) => ({ type: "reply", item: r }))] : [];

  const renderItem = useCallback(({ item: row, index }) => (
    <PostCard
      post={row.item}
      liked={Boolean(liked[row.item.id])}
      onLike={() => handleLike(row.item.id)}
      onReply={row.type === "post" ? undefined : undefined}
      onOpen={undefined}
      onDelete={handleDelete}
      isOwner={Boolean(user && row.item.userId === user.id)}
      showThreadLine={index < data.length - 1}
    />
  ), [liked, handleLike, handleDelete, user, data.length]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView edges={["top"]} style={styles.safeTop}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backTxt}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Тред</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      {repliesLoading && !post ? (
        <View style={styles.center}>
          <ActivityIndicator color="#636366" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(row) => String(row.item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Reply input */}
      <SafeAreaView edges={["bottom"]} style={styles.replyBar}>
        <View style={styles.replyRow}>
          <TextInput
            style={styles.replyInput}
            placeholder="Написать ответ..."
            placeholderTextColor="#48484A"
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={500}
            editable={!submitting}
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />
          <Pressable
            style={[styles.sendBtn, (!replyText.trim() || submitting) && styles.sendBtnDisabled]}
            onPress={handleReply}
            disabled={!replyText.trim() || submitting}
          >
            <Send size={18} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </View>
      </SafeAreaView>
      <KeyboardDoneBar />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#141416" },
  safeTop: { backgroundColor: "#141416" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  backTxt: { fontSize: 24, lineHeight: 24, color: "#fff" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerRight: { width: 36 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  replyBar: {
    backgroundColor: "#141416",
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
  },
  replyRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  replyInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#FFFFFF",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F47B20",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#2C2C2E",
  },
});
