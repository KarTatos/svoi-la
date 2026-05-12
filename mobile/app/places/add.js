import { useRouter, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { usePlaceForm } from "../../src/hooks/usePlaceForm";
import PlaceForm from "../../src/components/places/PlaceForm";
import { getDistrictById, getPlaceCatById } from "../../src/config/places";
import { fetchPlaces } from "../../src/lib/places";
import { isSupabaseConfigured } from "../../src/lib/supabase";

export default function AddPlaceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { district, category, editId } = useLocalSearchParams();
  const districtId = String(district || "").toLowerCase();
  const categoryId = String(category || "").toLowerCase();
  const placeIdToEdit = String(editId || "");
  const isEditMode = Boolean(placeIdToEdit);

  const { user, loading: authLoading } = useAuth();

  // Fetch places to find the one being edited
  const { data: places = [] } = useQuery({
    queryKey: ["places"],
    queryFn: fetchPlaces,
    enabled: isSupabaseConfigured && isEditMode,
  });

  const initialData = useMemo(() => {
    if (!isEditMode) return null;
    return places.find((p) => String(p.id) === placeIdToEdit) || null;
  }, [places, placeIdToEdit, isEditMode]);

  const districtItem = useMemo(
    () => getDistrictById(initialData?.district || districtId),
    [districtId, initialData]
  );
  const categoryItem = useMemo(
    () => getPlaceCatById(initialData?.cat || categoryId),
    [categoryId, initialData]
  );

  const form = usePlaceForm({
    user,
    initialDistrict: districtId,
    initialCategory: categoryId,
    initialData: isEditMode ? initialData : null,
    onSaved: async (savedPlace) => {
      await queryClient.invalidateQueries({ queryKey: ["places"] });
      const nextDistrict = String(savedPlace?.district || districtId || "").toLowerCase();
      const nextCategory = String(savedPlace?.cat || categoryId || "").toLowerCase();
      if (nextDistrict && nextCategory) {
        if (isEditMode) {
          router.replace({
            pathname: "/places/detail/[id]",
            params: { id: placeIdToEdit, district: nextDistrict, category: nextCategory },
          });
        } else {
          router.replace({
            pathname: "/places/[district]/[category]",
            params: { district: nextDistrict, category: nextCategory },
          });
        }
        return;
      }
      router.replace("/places");
    },
  });

  if (authLoading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}><Text style={styles.mid}>Проверяем аккаунт...</Text></View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.title}>Добавление места</Text>
          <Text style={styles.mid}>Нужно войти в аккаунт</Text>
          <Pressable style={styles.loginBtn} onPress={() => router.replace("/login")}>
            <Text style={styles.loginTxt}>Войти</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Wait for the place data to load in edit mode
  if (isEditMode && !initialData) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}><Text style={styles.mid}>Загрузка...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{isEditMode ? "Редактировать место" : "Новое место"}</Text>
          <Text style={styles.mid}>
            {categoryItem?.title || "Категория"} · {districtItem?.name || "Район"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PlaceForm
          form={form.form}
          loading={form.state.loading}
          error={form.state.error}
          editMode={form.editMode}
          actions={{
            ...form.actions,
            onCancel: () => router.back(),
            onSubmit: form.actions.submit,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EFECE6" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  mid: { color: "#8A8680", fontSize: 13, fontWeight: "600" },
  content: { padding: 16, paddingBottom: 40 },
  loginBtn: { marginTop: 8, backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  loginTxt: { color: "#fff", fontWeight: "700" },
});
