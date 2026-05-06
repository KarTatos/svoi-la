import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function ChatInput({ value, onChangeText, onSend, disabled }) {
  const canSend = String(value || "").trim().length > 0 && !disabled;

  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Задайте вопрос..."
        placeholderTextColor="#A6A6A6"
        style={styles.input}
        multiline
      />
      <Pressable onPress={onSend} disabled={!canSend} style={[styles.send, !canSend && styles.sendDisabled]}>
        <Text style={styles.sendText}>↑</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#E8E4DB",
    paddingTop: 10,
    backgroundColor: "#EFECE6",
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F47B20",
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    backgroundColor: "#D9D9D9",
  },
  sendText: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "700",
  },
});
