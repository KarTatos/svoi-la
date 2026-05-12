import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../src/components/AppHeader";
import SectionIcon from "../../src/components/SectionIcon";
import WeatherCard from "../../src/components/WeatherCard";
import { sections } from "../../src/config/sections";
import { useProfileWeather } from "../../src/hooks/useProfileWeather";

const D = {
  card: "#FFFFFF",
  ink: "#0E0E0E",
  sub: "#8A8680",
  lime: "#D4F84A",
  coral: "#FF6B4A",
  cream: "#F5EFE0",
  sh: {
    shadowColor: "#0E0E0E",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

function SectionEmoji({ id }) {
  const map = {
    uscis: "📋",
    places: "📍",
    tips: "💡",
    events: "🎉",
    jobs: "💼",
    housing: "🏠",
    sell: "🏷️",
    "community-chat": "💬",
  };
  return <Text style={styles.emoji}>{map[id] || "✨"}</Text>;
}

export default function HomeScreen() {
  const router = useRouter();
  const { profileLocation, profileWeather, loading, permissionGranted, requestPermission } =
    useProfileWeather();
  const { width } = useWindowDimensions();
  const columns = width >= 360 ? 3 : 2;
  const gap = 10;
  const horizontalPadding = 16;
  const gridSections = sections.filter((item) => item.id !== "chat-sec");
  const aiSection = sections.find((item) => item.id === "chat-sec");
  const cardWidth = (width - horizontalPadding * 2 - gap * (columns - 1)) / columns;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <WeatherCard
          profileLocation={profileLocation}
          profileWeather={profileWeather}
          loading={loading}
          permissionGranted={permissionGranted}
          onRequestPermission={requestPermission}
        />

        <View style={styles.grid}>
          {gridSections.map((section, idx) => {
            const col = idx % columns;
            return (
              <Pressable
                key={section.id}
                onPress={() => router.push(section.href)}
                style={[
                  styles.card,
                  section.soon && styles.cardSoon,
                  {
                    width: cardWidth,
                    marginLeft: col === 0 ? 0 : gap,
                    marginTop: idx < columns ? 0 : gap,
                  },
                ]}
              >
                <SectionIcon id={section.id} size={34} />
                <View>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {section.title}
                  </Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {section.desc}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {aiSection && (
          <Pressable onPress={() => router.push(aiSection.href)} style={styles.aiCard}>
            <View style={styles.aiIconBox}>
              <Text style={styles.aiIcon}>✦</Text>
            </View>
            <View style={styles.aiTextWrap}>
              <View style={styles.aiTitleRow}>
                <Text style={styles.aiTitle}>AI</Text>
                <View style={styles.aiDot} />
              </View>
              <Text style={styles.aiDesc}>{aiSection.desc}</Text>
            </View>
            <View style={styles.aiArrowBox}>
              <Text style={styles.aiArrow}>→</Text>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    minHeight: 120,
    borderRadius: 24,
    backgroundColor: D.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "space-between",
    ...D.sh,
  },
  cardSoon: {
    backgroundColor: D.cream,
  },
  emoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  cardTitle: {
    color: D.ink,
    fontSize: 22,
    lineHeight: 25,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  cardDesc: {
    marginTop: 3,
    color: D.sub,
    fontSize: 10.5,
    lineHeight: 13,
  },
  aiCard: {
    marginTop: 10,
    width: "100%",
    borderRadius: 24,
    backgroundColor: D.ink,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    ...D.sh,
  },
  aiIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: D.coral,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  aiIcon: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  aiTextWrap: { flex: 1 },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 10,
    backgroundColor: D.lime,
    marginLeft: 7,
  },
  aiDesc: {
    marginTop: 3,
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "500",
  },
  aiArrowBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  aiArrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    fontWeight: "700",
  },
});
