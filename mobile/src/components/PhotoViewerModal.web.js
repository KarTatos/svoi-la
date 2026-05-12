import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export default function PhotoViewerModal({ visible, onRequestClose }) {
  return (
    <Modal visible={Boolean(visible)} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Просмотр фото доступен в Expo Go</Text>
          <Text style={styles.text}>В web-preview полноэкранный нативный viewer отключён.</Text>
          <Pressable style={styles.btn} onPress={onRequestClose}>
            <Text style={styles.btnText}>Закрыть</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  text: { marginTop: 6, color: "#6B7280", fontSize: 13, lineHeight: 18 },
  btn: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
