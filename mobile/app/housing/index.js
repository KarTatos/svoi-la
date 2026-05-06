import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SafeAreaView, StyleSheet } from "react-native";
import HousingScreen from "../../src/components/housing/HousingScreen";
import { useAuth } from "../../src/hooks/useAuth";
import { useHousingFavorites } from "../../src/hooks/useHousingFavorites";
import { useHousingForm } from "../../src/hooks/useHousingForm";
import { useHousingQuery } from "../../src/hooks/useHousingQuery";
import { isSupabaseConfigured } from "../../src/lib/supabase";

function matchBeds(item, filter) {
  if (filter === "all") return true;
  if (filter === "studio") return String(item.type || "").toLowerCase() === "studio";
  if (filter === "room") return String(item.type || "").toLowerCase() === "room";
  if (filter === "1") return Number(item.beds || 0) >= 1;
  if (filter === "2") return Number(item.beds || 0) >= 2;
  return true;
}

export default function HousingRoute() {
  const { edit } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading, authBusy } = useAuth();
  const { favorites, toggleFavorite } = useHousingFavorites();
  const { data: housing = [], isLoading, isError, error } = useHousingQuery(isSupabaseConfigured);

  const [bedsFilter, setBedsFilter] = useState("all");
  const [sortFavorites, setSortFavorites] = useState(false);

  const housingForm = useHousingForm({
    user,
    onRequireAuth: () => router.push("/login"),
    onSaved: () => {
      queryClient.invalidateQueries({ queryKey: ["housing"] });
    },
  });

  useEffect(() => {
    const editId = String(edit || "");
    if (!editId) return;
    const found = (housing || []).find((h) => String(h.id) === editId);
    if (!found) return;
    housingForm.openEdit(found);
    router.replace("/housing");
  }, [edit, housing, housingForm, router]);

  const sorted = useMemo(() => {
    const list = (housing || []).filter((item) => matchBeds(item, bedsFilter));
    if (sortFavorites) {
      list.sort((a, b) => Number(Boolean(favorites[`housing-${b.id}`])) - Number(Boolean(favorites[`housing-${a.id}`])));
    }
    return list;
  }, [housing, bedsFilter, sortFavorites, favorites]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <HousingScreen
        user={user}
        authLoading={loading}
        authBusy={authBusy}
        items={sorted}
        loading={isLoading}
        error={isError ? error?.message || "Не удалось загрузить жильё" : ""}
        favorites={favorites}
        bedsFilter={bedsFilter}
        setBedsFilter={setBedsFilter}
        sortFavorites={sortFavorites}
        setSortFavorites={setSortFavorites}
        onGoHome={() => router.push("/")}
        onRequireAuth={() => router.push("/login")}
        onOpenItem={(item) => router.push(`/housing/${item.id}`)}
        onToggleFavorite={toggleFavorite}
        housingForm={housingForm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6", paddingHorizontal: 16, paddingTop: 8 },
});
