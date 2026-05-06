import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SafeAreaView, StyleSheet } from "react-native";
import MarketScreen from "../../src/components/market/MarketScreen";
import { useAuth } from "../../src/hooks/useAuth";
import { useMarketForm } from "../../src/hooks/useMarketForm";
import { useMarketQuery } from "../../src/hooks/useMarketQuery";
import { recordMarketView } from "../../src/lib/market";
import { isSupabaseConfigured } from "../../src/lib/supabase";

export default function MarketRoute() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAdmin, loading, authBusy } = useAuth();
  const { data: items = [], isLoading, isError, error, refetch } = useMarketQuery(isSupabaseConfigured);

  const marketForm = useMarketForm({
    user,
    onRequireAuth: () => router.push("/login"),
    onSaved: () => {
      queryClient.invalidateQueries({ queryKey: ["market"] });
      queryClient.invalidateQueries({ queryKey: ["likes", user?.id, "market"] });
    },
  });

  const canManage = useMemo(
    () => (item) => {
      if (!user || !item) return false;
      if (isAdmin) return true;
      return Boolean(item.userId && item.userId === user.id);
    },
    [user, isAdmin]
  );

  const viewMutation = useMutation({
    mutationFn: ({ itemId }) => recordMarketView(itemId, user?.id || null),
    onSuccess: (viewsCount, vars) => {
      queryClient.setQueryData(["market"], (prev = []) =>
        prev.map((it) => (String(it.id) === String(vars.itemId) ? { ...it, views: viewsCount } : it))
      );
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <MarketScreen
        user={user}
        authLoading={loading}
        authBusy={authBusy}
        items={items}
        loading={isLoading}
        error={isError ? error?.message || "Не удалось загрузить объявления" : ""}
        likedMap={{}}
        onRetry={() => refetch()}
        onGoHome={() => router.push("/")}
        onRequireAuth={() => router.push("/login")}
        onToggleLike={() => {}}
        onRecordView={(id) => viewMutation.mutate({ itemId: id })}
        marketForm={marketForm}
        canManage={canManage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6", paddingHorizontal: 16, paddingTop: 8 },
});
