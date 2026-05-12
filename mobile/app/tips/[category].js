import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useTipsQuery } from "../../src/hooks/useTipsQuery";
import { useLikes } from "../../src/hooks/useLikes";
import { TIPS_CATS } from "../../src/config/tips";
import TipCard from "../../src/components/tips/TipCard";
import PhotoViewerModal from "../../src/components/PhotoViewerModal";
import {
  addTipComment,
  deleteTipComment,
  recordTipView,
  updateTipComment,
} from "../../src/lib/tipsEngagement";
import { deleteTip } from "../../src/lib/tips";

export default function TipsCategoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { category } = useLocalSearchParams();
  const categoryId = String(category || "").toLowerCase();
  const selCat = TIPS_CATS.find((c) => c.id === categoryId) || null;

  const { user, isAdmin } = useAuth();
  const { data: allTips = [], isLoading, isError, error, refetch } = useTipsQuery();
  const { isLiked, toggle: toggleLike } = useLikes("tip", user?.id, ["tips"], "likes");

  const [expandedTip, setExpandedTip] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerPhotos, setViewerPhotos] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const tips = useMemo(
    () => (allTips || []).filter((t) => t.cat === categoryId),
    [allTips, categoryId]
  );

  const canManageTip = useMemo(
    () => (tip) => {
      if (!user || !tip) return false;
      if (isAdmin) return true;
      return Boolean(tip.userId && tip.userId === user.id);
    },
    [user, isAdmin]
  );

  const viewMutation = useMutation({
    mutationFn: ({ tipId }) => recordTipView(tipId, user?.id || null),
    onSuccess: (_, vars) => {
      queryClient.setQueryData(["tips"], (prev = []) =>
        prev.map((t) =>
          String(t.id) === String(vars.tipId) ? { ...t, views: (t.views || 0) + 1 } : t
        )
      );
    },
  });

  const commentAddMutation = useMutation({
    mutationFn: ({ tipId, text }) => addTipComment(tipId, user, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tips"] }),
  });

  const commentUpdateMutation = useMutation({
    mutationFn: ({ commentId, text }) => updateTipComment(commentId, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tips"] }),
  });

  const commentDeleteMutation = useMutation({
    mutationFn: (commentId) => deleteTipComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tips"] }),
  });

  const deleteTipMutation = useMutation({
    mutationFn: (tipId) => deleteTip(tipId),
    onSuccess: (_, tipId) => {
      queryClient.invalidateQueries({ queryKey: ["tips"] });
      setExpandedTip((prev) => (String(prev) === String(tipId) ? null : prev));
    },
  });

  const openPhoto = (photos, index) => {
    setViewerPhotos(Array.isArray(photos) ? photos : []);
    setViewerIndex(Number(index || 0));
    setViewerOpen(true);
  };

  const renderItem = ({ item: tip }) => {
    const tipKey = `tip-${tip.id}`;
    return (
      <TipCard
        tip={tip}
        isExpanded={expandedTip === tip.id}
        isFavorited={isLiked(tip.id)}
        canEdit={canManageTip(tip)}
        showComments={commentsOpen === tipKey}
        user={user}
        isAdmin={isAdmin}
        onToggleExpand={(open) => {
          setExpandedTip(open ? tip.id : null);
          if (!open) setCommentsOpen("");
          if (open) viewMutation.mutate({ tipId: tip.id });
        }}
        onOpenPhoto={openPhoto}
        onToggleFavorite={() => {
          if (!user) { router.push("/login"); return; }
          toggleLike(tip.id);
        }}
        onOpenComments={() => {
          const alreadyOpen = commentsOpen === tipKey;
          if (alreadyOpen) {
            setCommentsOpen("");
          } else {
            setExpandedTip(tip.id);
            setCommentsOpen(tipKey);
            viewMutation.mutate({ tipId: tip.id });
          }
        }}
        onAddComment={(text) => commentAddMutation.mutate({ tipId: tip.id, text })}
        onUpdateComment={(commentId, text) =>
          commentUpdateMutation.mutate({ commentId, text })
        }
        onDeleteComment={(commentId) => commentDeleteMutation.mutate(commentId)}
        onEdit={() =>
          router.push({
            pathname: "/tips/add",
            params: { category: categoryId, editId: String(tip.id) },
          })
        }
        onDelete={() => deleteTipMutation.mutate(tip.id)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          {selCat ? <Text style={styles.headerIcon}>{selCat.icon}</Text> : null}
          <Text style={styles.headerTitle}>{selCat?.title || "Советы"}</Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            if (!user) { router.push("/login"); return; }
            router.push({ pathname: "/tips/add", params: { category: categoryId } });
          }}
        >
          <Plus size={20} color="#F47B20" strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Загрузка...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errText}>Ошибка: {error?.message}</Text>
          <Pressable onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryTxt}>Повторить</Text>
          </Pressable>
        </View>
      ) : tips.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>Советов пока нет.</Text>
          <Text style={styles.mutedSub}>Будьте первым — нажмите +</Text>
        </View>
      ) : (
        <FlatList
          data={tips}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <PhotoViewerModal
        visible={viewerOpen}
        photos={viewerPhotos}
        index={viewerIndex}
        onRequestClose={() => setViewerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFECE6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  headerIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF3E8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#F47B2055",
  },
  list: { paddingTop: 8, paddingBottom: 120 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  muted: { fontSize: 15, color: "#6B7280", textAlign: "center" },
  mutedSub: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
  errText: { fontSize: 14, color: "#B91C1C", textAlign: "center" },
  retryBtn: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryTxt: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});
