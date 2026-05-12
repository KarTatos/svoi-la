import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, View } from "react-native";

export const KEYBOARD_DONE_ID = "kb-done-bar";

export default function KeyboardDoneBar({ label = "Готово" }) {
  if (Platform.OS !== "ios") return null;

  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ID}>
      <View style={styles.bar}>
        <Pressable onPress={() => Keyboard.dismiss()} style={styles.btn} hitSlop={10}>
          <Text style={styles.label}>{label}</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#1C1C1E",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  label: {
    color: "#F47B20",
    fontSize: 16,
    fontWeight: "600",
  },
});
