import { Pressable, StyleSheet, Text, View } from "react-native";

function normalizeWeatherText(rawText = "") {
  const text = String(rawText || "").toLowerCase();
  if (!text) return "погода";
  if (text.includes("thunder") || text.includes("storm")) return "гроза";
  if (text.includes("snow") || text.includes("sleet") || text.includes("blizzard")) return "снег";
  if (text.includes("rain") || text.includes("shower") || text.includes("drizzle")) return "дождь";
  if (text.includes("fog") || text.includes("mist") || text.includes("haze") || text.includes("smoke")) return "туман";
  if (text.includes("cloudy") || text.includes("overcast")) return "облачно";
  if (text.includes("partly")) return "переменная облачность";
  if (text.includes("clear") || text.includes("sunny")) return "ясно";
  if (text.includes("wind")) return "ветрено";
  return "погода";
}

function formatWeatherTemp(raw = "") {
  const value = String(raw || "").trim();
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([CF])?/i);
  if (!match) return "--°";
  const n = Number(match[1]);
  if (!Number.isFinite(n)) return "--°";
  const unit = (match[2] || "F").toUpperCase();
  if (unit === "C") {
    const f = Math.round((n * 9) / 5 + 32);
    return `${f}° (${Math.round(n)}°C)`;
  }
  const c = Math.round(((n - 32) * 5) / 9);
  return `${Math.round(n)}° (${c}°C)`;
}

export default function WeatherCard({
  profileLocation,
  profileWeather,
  loading,
  permissionGranted,
  onRequestPermission,
}) {
  const weatherText = normalizeWeatherText(String(profileWeather?.text || ""));
  const weatherTemp = formatWeatherTemp(profileWeather?.temp || "");
  const locationLabel = profileLocation || "Los Angeles";
  const showPermissionAction = !loading && !permissionGranted;

  return (
    <View style={styles.wrap}>
      <View style={styles.circleGlow} />
      <Text style={styles.location}>{locationLabel}</Text>
      <Text style={styles.weatherText}>{loading ? "загружаем погоду..." : weatherText}</Text>
      <Text style={styles.tip}>
        {showPermissionAction
          ? "Разрешите доступ к геолокации, чтобы показать локальную погоду."
          : "Локальная погода для вашего текущего района."}
      </Text>
      <Text style={styles.temp}>{loading ? "--°" : weatherTemp}</Text>

      {showPermissionAction ? (
        <Pressable onPress={onRequestPermission} style={styles.permissionBtn}>
          <Text style={styles.permissionBtnText}>Разрешить геолокацию</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    backgroundColor: "#FF6B4A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#0E0E0E",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  circleGlow: {
    position: "absolute",
    right: -28,
    top: -28,
    width: 130,
    height: 130,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  location: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  weatherText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 18,
    letterSpacing: -0.2,
    maxWidth: "72%",
  },
  tip: {
    marginTop: 4,
    fontSize: 11,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 14,
    fontStyle: "italic",
    maxWidth: "78%",
  },
  temp: {
    position: "absolute",
    right: 16,
    top: 10,
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 34,
    letterSpacing: -1.5,
    textAlign: "right",
  },
  permissionBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  permissionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});

