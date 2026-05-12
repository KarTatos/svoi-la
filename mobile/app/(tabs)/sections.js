import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SectionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Разделы</Text>
        <Text style={styles.text}>Временная страница разделов.</Text>
        <Link href="/places" style={styles.link}>Перейти в Места</Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f8fa" },
  container: { padding: 16, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  text: { marginTop: 8, fontSize: 16, color: "#4b5563" },
  link: { marginTop: 14, fontSize: 16, color: "#0f766e", fontWeight: "700" },
});

