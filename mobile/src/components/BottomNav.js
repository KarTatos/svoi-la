import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassContainer, GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Home, List, MapPin, Sparkles, User } from "lucide-react-native";

const BAR_HEIGHT = 56;
const FAB_SIZE = 52;

function getActiveTab(pathname) {
  if (!pathname || pathname === "/") return "home";
  if (pathname.startsWith("/places")) return "places";
  if (pathname.startsWith("/profile")) return "profile";
  if (
    pathname.startsWith("/uscis") ||
    pathname.startsWith("/tips") ||
    pathname.startsWith("/housing") ||
    pathname.startsWith("/market") ||
    pathname.startsWith("/sections")
  ) return "uscis";
  return "home";
}

const tabs = [
  { id: "home", label: "Главная", href: "/", icon: Home },
  { id: "places", label: "Места", href: "/places", icon: MapPin },
  { id: "uscis", label: "USCIS", href: "/uscis", icon: List },
  { id: "profile", label: "Профиль", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const active = getActiveTab(pathname);
  const show = useMemo(
    () =>
      pathname === "/" ||
      pathname.startsWith("/places") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/sections") ||
      pathname.startsWith("/uscis") ||
      pathname.startsWith("/tips") ||
      pathname.startsWith("/chat") ||
      pathname.startsWith("/housing") ||
      pathname.startsWith("/market"),
    [pathname]
  );

  if (!show) return null;

  const liquidGlass = isLiquidGlassAvailable();

  return (
    <SafeAreaView pointerEvents="box-none" edges={["bottom"]} style={styles.root}>
      <View style={styles.row} pointerEvents="box-none">
        {liquidGlass ? (
          <GlassContainer style={styles.pillWrap}>
            <GlassView glassEffectStyle="regular" style={styles.pill}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === active;
                return (
                  <Pressable key={tab.id} onPress={() => router.push(tab.href)} style={[styles.tab, isActive && styles.tabActive]}>
                    <Icon size={19} color={isActive ? "#0E0E0E" : "rgba(255,255,255,0.62)"} strokeWidth={2.1} />
                    {isActive ? <Text style={styles.tabLabelActive}>{tab.label}</Text> : null}
                  </Pressable>
                );
              })}
            </GlassView>
          </GlassContainer>
        ) : (
          <View style={styles.pillFallback}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === active;
              return (
                <Pressable key={tab.id} onPress={() => router.push(tab.href)} style={[styles.tab, isActive && styles.tabActiveFallback]}>
                  <Icon size={19} color={isActive ? "#0E0E0E" : "rgba(255,255,255,0.55)"} strokeWidth={2.1} />
                  {isActive ? <Text style={styles.tabLabelActive}>{tab.label}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable onPress={() => router.push("/chat")} style={styles.fab}>
          <Sparkles size={22} color="#FFFFFF" strokeWidth={2.2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pillWrap: {
    flex: 1,
  },
  pill: {
    height: BAR_HEIGHT,
    borderRadius: 100,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(14,14,14,0.80)",
  },
  pillFallback: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: 100,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1C1C1E",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  tab: {
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
    gap: 6,
    paddingHorizontal: 14,
  },
  tabActiveFallback: {
    backgroundColor: "#FFFFFF",
    gap: 6,
    paddingHorizontal: 14,
  },
  tabLabelActive: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0E0E0E",
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: "#F47B20",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F47B20",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
});
