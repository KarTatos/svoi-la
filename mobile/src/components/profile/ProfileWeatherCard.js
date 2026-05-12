import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileWeatherCard({ profileLocation, profileWeather, loading, onRequestPermission }) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.kicker}>Локация профиля</Text>
        <Text style={styles.location} numberOfLines={1}>{profileLocation || "Локация не задана"}</Text>
      </View>
      <View style={styles.weatherWrap}>
        <Text style={styles.temp}>{profileWeather?.temp || "--°"}</Text>
        <Text style={styles.text}>{profileWeather?.text || "Погода недоступна"}</Text>
      </View>
      {loading ? <Text style={styles.loading}>Обновляем погоду...</Text> : null}
      <Pressable onPress={onRequestPermission} style={styles.refreshBtn}>
        <Text style={styles.refreshText}>Обновить локацию и погоду</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 14,
    gap: 8,
  },
  kicker: { color: "#8A8680", fontSize: 12, fontWeight: "700" },
  location: { color: "#0E0E0E", fontSize: 16, fontWeight: "700", marginTop: 4 },
  weatherWrap: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  temp: { color: "#0E0E0E", fontSize: 24, fontWeight: "800" },
  text: { color: "#6B6B6B", fontSize: 13 },
  loading: { color: "#8A8680", fontSize: 12 },
  refreshBtn: {
    marginTop: 2,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshText: { color: "#0E0E0E", fontSize: 12, fontWeight: "700" },
});
