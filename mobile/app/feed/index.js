import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useCommunityQuery } from "../../src/hooks/useCommunityQuery";
import { isSupabaseConfigured } from "../../src/lib/supabase";
import {
  deletePost,
  fetchUserPostLikes,
  togglePostLike,
} from "../../src/lib/community";
import PostCard from "../../src/components/community/PostCard";

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading, isError, error, refetch } = useCommunityQuery(isSupabaseConfigured);
  const [liked, setLiked] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserPostLikes(user.id).then((map) => setLiked(map));
  }, [user?.id]);

  const likeMutation = useMutation({
    mutationFn: ({ postId }) => togglePostLike(postId, user?.id),
    onMutate: ({ postId }) => {
      const wasLiked = Boolean(liked[postId]);
      setLiked((prev) => ({ ...prev, [postId]: !wasLiked }));
      queryClient.setQueryData(["community"], (prev = []) =>
        prev.map((p) =>
          String(p.id) === String(postId)
            ? { ...p, likesCount: p.likesCount + (wasLiked ? -1 : 1) }
            : p
        )
      );
    },
    onError: (_err, { postId }) => {
      setLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
    },
    onSuccess: ({ liked: nowLiked, likesCount }, { postId }) => {
      setLiked((prev) => ({ ...prev, [postId]: nowLiked }));
      queryClient.setQueryData(["community"], (prev = []) =>
        prev.map((p) => (String(p.id) === String(postId) ? { ...p, likesCount } : p))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: (_, postId) => {
      queryClient.setQueryData(["community"], (prev = []) =>
        prev.filter((p) => String(p.id) !== String(postId))
      );
    },
  });

  const handleLike = useCallback((postId) => {
    if (!user) { router.push("/login"); return; }
    likeMutation.mutate({ postId });
  }, [user, likeMutation, router]);

  const handleDelete = useCallback((postId) => {
    Alert.alert("Удалить пост?", "Это действие нельзя отменить.", [
      { text: "Отмена", style: "cancel" },
      { text: "Удалить", style: "destructive", onPress: () => deleteMutation.mutate(postId) },
    ]);
  }, [deleteMutation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }) => (
    <PostCard
      post={item}
      liked={Boolean(liked[item.id])}
      onLike={() => handleLike(item.id)}
      onReply={() => router.push("/feed/" + item.id)}
      onOpen={() => router.push("/feed/" + item.id)}
      onDelete={handleDelete}
      isOwner={Boolean(user && item.userId === user.id)}
    />
  ), [liked, handleLike, handleDelete, user, router]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.safeTop}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backTxt}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Лента</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#636366" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errText}>{error?.message || "Ошибка загрузки"}</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryTxt}>Повторить</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#636366" />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>Пока пусто</Text>
              <Text style={styles.emptyHint}>Будь первым — нажми +</Text>
            </View>
          }
          contentContainerStyle={posts.length === 0 ? { flex: 1 } : { paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          if (!user) { router.push("/login"); return; }
          router.push("/feed/compose");
        }}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  errText: { color: "#B91C1C", fontSize: 14, textAlign: "center" },
  retryBtn: { backgroundColor: "#1C1C1E", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  retryTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyTitle: { fontSize: 16, color: "#636366", fontWeight: "600" },
  emptyHint: { fontSize: 13, color: "#48484A" },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.20,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    lineHeight: 32,
    fontWeight: "300",
  },
});
