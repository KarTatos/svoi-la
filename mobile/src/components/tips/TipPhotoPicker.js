import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function TipPhotoPicker({ photos, onChange, max = 3, disabled = false }) {
  const pick = async () => {
    if (disabled) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const rest = Math.max(0, max - photos.length);
    if (!rest) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: rest,
    });

    if (result.canceled) return;
    onChange([...(photos || []), ...result.assets].slice(0, max));
  };

  const removeAt = (idx) => {
    onChange((photos || []).filter((_, i) => i !== idx));
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {(photos || []).map((p, i) => (
          <View key={`${p.uri}-${i}`} style={styles.thumbWrap}>
            <Image source={{ uri: p.uri }} style={styles.thumb} />
            <Pressable onPress={() => removeAt(i)} style={styles.removeBtn}>
              <Text style={styles.removeText}>✕</Text>
            </Pressable>
          </View>
        ))}
        {(photos || []).length < max ? (
          <Pressable style={styles.addBtn} onPress={pick}>
            <Text style={styles.addText}>+ Фото</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.caption}>До {max} фото</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  thumbWrap: { width: 70, height: 70, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB" },
  thumb: { width: "100%", height: "100%" },
  removeBtn: { position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  removeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  addBtn: { width: 92, height: 70, borderRadius: 10, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  addText: { color: "#111827", fontSize: 13, fontWeight: "700" },
  caption: { color: "#8A8680", fontSize: 12 },
});
