import * as ImagePicker from "expo-image-picker";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";

const MAX_PHOTOS = 5;

export default function MarketPhotoPicker({ photos, onChange }) {
  const safePhotos = Array.isArray(photos) ? photos : [];

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX_PHOTOS - safePhotos.length),
      quality: 0.85,
    });

    if (result.canceled) return;
    const next = [...safePhotos, ...(result.assets || [])].slice(0, MAX_PHOTOS);
    onChange?.(next);
  };

  const remove = (index) => {
    onChange?.(safePhotos.filter((_, i) => i !== index));
  };

  return (
    <View>
      <Text style={styles.label}>Фото (до 5)</Text>
      <View style={styles.row}>
        {safePhotos.map((p, i) => (
          <View key={`${p.uri || "photo"}-${i}`} style={styles.thumbWrap}>
            <Image source={{ uri: p.uri }} style={styles.thumb} />
            <Pressable onPress={() => remove(i)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>×</Text>
            </Pressable>
          </View>
        ))}

        {safePhotos.length < MAX_PHOTOS ? (
          <Pressable onPress={pickPhotos} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Фото</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, color: "#6B6B6B", marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumbWrap: { width: 72, height: 72, borderRadius: 10, overflow: "hidden", position: "relative" },
  thumb: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    right: 4,
    top: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { color: "#fff", fontSize: 13, lineHeight: 13 },
  addBtn: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#E1DDD4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F5EE",
  },
  addBtnText: { color: "#6B6B6B", fontSize: 12, fontWeight: "600", textAlign: "center" },
});
