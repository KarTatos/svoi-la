import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassContainer, GlassView, isLiquidGlassAvailable } from "expo-glass-effect";

const SHOW_PATHS = ["/", "/places", "/profile", "/sections", "/uscis", "/tips", "/chat", "/housing", "/market"];

const BG = "#EFECE6";

// Fake gradient via stacked layers (fallback when no native blur)
function GradientFade({ height }) {
  const layers = [0, 0.04, 0.10, 0.20, 0.35, 0.55, 0.75, 0.92, 1.0];
  const layerH = height / layers.length;
  return (
    <View style={[StyleSheet.absoluteFillObject, { flexDirection: "column-reverse" }]}>
      {layers.map((opacity, i) => (
        <View
          key={i}
          style={{ height: layerH, backgroundColor: BG, opacity }}
        />
      ))}
    </View>
  );
}

export default function BottomBlur() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const liquidGlass = isLiquidGlassAvailable();

  const show = useMemo(
    () =>
      SHOW_PATHS.some((p) => p === "/" ? pathname === "/" : pathname.startsWith(p)),
    [pathname]
  );

  if (!show) return null;

  // Height: covers from content bottom up through nav bar area
  const height = insets.bottom + 110;

  if (liquidGlass) {
    return (
      <GlassContainer
        pointerEvents="none"
        style={[styles.wrap, { height }]}
      >
        <GlassView
          glassEffectStyle="thin"
          style={StyleSheet.absoluteFillObject}
        />
        {/* Gradient on top of blur so it fades in smoothly from top */}
        <GradientFade height={height} />
      </GlassContainer>
    );
  }

  // Fallback: pure gradient fade
  return (
    <View pointerEvents="none" style={[styles.wrap, { height }]}>
      <GradientFade height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100, // above content, below BottomNav (200)
    overflow: "hidden",
  },
});
