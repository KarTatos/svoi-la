import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function PlacePhotoPicker({ photos, onChange, max = 5, disabled = false }) {
  const pick = async () => {
    if (disabled) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") return;

    const rest = Math.max(0, max - photos.length);
    if (rest === 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: rest,
    });

    if (result.canceled) return;
    const next = [...photos, ...result.assets].slice(0, max);
    onChange(next);
  };

  const removeAt = (idx) => {
    const next = photos.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <View>
      <View style={styles.row}>
        {photos.map((p, i) => (
          <View key={`${p.uri}-${i}`} style={styles.thumbWrap}>
            <Image source={{ uri: p.uri }} style={styles.thumb} />
            <Pressable onPress={() => removeAt(i)} style={styles.removeBtn}>
              <Text style={styles.removeTxt}>✕</Text>
            </Pressable>
          </View>
        ))}
        {photos.length < max ? (
          <Pressable style={styles.addBtn} onPress={pick}>
            <Text style={styles.addBtnTxt}>＋ Фото</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.hint}>До {max} фото</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumbWrap: { width: 64, height: 64, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB" },
  thumb: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  removeTxt: { color: "#fff", fontSize: 10, fontWeight: "700" },
  addBtn: {
    minWidth: 84,
    height: 64,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 10,
  },
  addBtnTxt: { color: "#1F2937", fontSize: 12, fontWeight: "600" },
  hint: { marginTop: 6, fontSize: 11, color: "#8A8680" },
});
