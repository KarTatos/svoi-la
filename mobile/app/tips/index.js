import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TIPS_CATS } from "../../src/config/tips";
import TipsScreen from "../../src/components/tips/TipsScreen";
import { useAuth } from "../../src/hooks/useAuth";
import { useTipForm } from "../../src/hooks/useTipForm";
import { useTipFavorites } from "../../src/hooks/useTipFavorites";
import { useTipsQuery } from "../../src/hooks/useTipsQuery";
import {
  addTipComment,
  deleteTipComment,
  recordTipView,
  updateTipComment,
} from "../../src/lib/tipsEngagement";

export default function TipsRoute() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { data: tips = [], isLoading, isError, error, refetch } = useTipsQuery();
  const { favorites, toggleFavorite } = useTipFavorites();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedTip, setExpandedTip] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState("");

  useEffect(() => {
    const categoryId = String(category || "").toLowerCase();
    if (!categoryId) return;
    const cat = TIPS_CATS.find((c) => c.id === categoryId) || null;
    if (cat) setSelectedCategory(cat);
  }, [category]);

  const tipForm = useTipForm({
    user,
    selectedCategory,
    onRequireAuth: () => router.push("/login"),
    onSaved: (savedTip, meta) => {
      queryClient.invalidateQueries({ queryKey: ["tips"] });
      if (meta?.mode === "create" && savedTip?.id) setExpandedTip(savedTip.id);
      if (meta?.mode === "delete") setExpandedTip((prev) => (prev === meta?.source?.id ? null : prev));
    },
  });

  const viewMutation = useMutation({
    mutationFn: ({ tipId }) => recordTipView(tipId, user?.id || null),
    onSuccess: (_, vars) => {
      queryClient.setQueryData(["tips"], (prev = []) =>
        prev.map((t) => (String(t.id) === String(vars.tipId) ? { ...t, views: (t.views || 0) + 1 } : t))
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

  const canManageTip = useMemo(
    () => (tip) => {
      if (!user || !tip) return false;
      if (isAdmin) return true;
      return Boolean(tip.userId && tip.userId === user.id);
    },
    [user, isAdmin]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Загрузка советов...</Text></View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><Text style={styles.err}>Ошибка: {error?.message || "Не удалось загрузить советы"}</Text><Text style={styles.retry} onPress={() => refetch()}>Повторить</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TipsScreen
        tips={tips}
        loading={isLoading}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        expandedTip={expandedTip}
        setExpandedTip={setExpandedTip}
        likesMap={{}}
        favorites={favorites}
        commentsOpen={commentsOpen}
        setCommentsOpen={setCommentsOpen}
        user={user}
        isAdmin={isAdmin}
        onGoHome={() => router.push("/")}
        onRequireAuth={() => router.push("/login")}
        onOpenCreate={tipForm.openCreate}
        tipForm={tipForm}
        onToggleFavorite={(tipId) => toggleFavorite(tipId)}
        onToggleLike={() => {}}
        onRecordView={(tipId) => viewMutation.mutate({ tipId })}
        onAddComment={(tipId, text) => commentAddMutation.mutate({ tipId, text })}
        onUpdateComment={(commentId, text) => commentUpdateMutation.mutate({ commentId, text })}
        onDeleteComment={(commentId) => commentDeleteMutation.mutate(commentId)}
        canManageTip={canManageTip}
        onEditTip={tipForm.openEdit}
        onDeleteTip={tipForm.removeTip}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 16 },
  muted: { color: "#6B6B6B", fontSize: 14 },
  err: { color: "#B91C1C", fontSize: 14, textAlign: "center" },
  retry: { color: "#111827", fontWeight: "700", fontSize: 14 },
});
