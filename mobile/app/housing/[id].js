import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Linking, SafeAreaView, Share, StyleSheet } from "react-native";
import HousingDetailScreen from "../../src/components/housing/HousingDetailScreen";
import { useAuth } from "../../src/hooks/useAuth";
import { useHousingFavorites } from "../../src/hooks/useHousingFavorites";
import { useHousingQuery } from "../../src/hooks/useHousingQuery";
import { recordHousingView } from "../../src/lib/housing";
import { isSupabaseConfigured } from "../../src/lib/supabase";

export default function HousingDetailRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useHousingFavorites();
  const { data: items = [] } = useHousingQuery(isSupabaseConfigured);

  const item = useMemo(() => items.find((x) => String(x.id) === String(id)) || null, [items, id]);

  const viewMutation = useMutation({
    mutationFn: () => recordHousingView(id, user?.id || null),
    onSuccess: (viewsCount) => {
      queryClient.setQueryData(["housing"], (prev = []) =>
        prev.map((h) => (String(h.id) === String(id) ? { ...h, views: viewsCount } : h))
      );
    },
  });

  useEffect(() => {
    if (!id) return;
    viewMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!item) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  const canManage = Boolean(user && (isAdmin || (item.userId && item.userId === user.id)));

  return (
    <SafeAreaView style={styles.safeArea}>
      <HousingDetailScreen
        item={item}
        isFavorite={isFavorite(item.id)}
        isLiked={false}
        onBack={() => router.back()}
        onToggleFavorite={() => toggleFavorite(item.id)}
        onToggleLike={() => {}}
        onShare={() => Share.share({ title: item.title || "SVOI LA", message: `${item.address} · $${item.minPrice || ""}` })}
        onOpenAddress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address || "Los Angeles")}`)}
        onOpenTelegram={() => Linking.openURL(`https://t.me/${String(item.telegram || "").replace(/^@/, "")}`)}
        onOpenMessage={() => Linking.openURL(`sms:${item.messageContact || ""}`)}
        onEdit={() => router.push({ pathname: "/housing", params: { edit: String(item.id) } })}
        canManage={canManage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: "#EFECE6" } });
