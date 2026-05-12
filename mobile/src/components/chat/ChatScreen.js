import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";

export default function ChatScreen({
  router,
  user,
  loading,
  authBusy,
  messages,
  input,
  setInput,
  typing,
  error,
  onSend,
  onLogin,
}) {
  const scrollRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages, typing]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.sub}>Загрузка...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.lock}>🔒</Text>
        <Text style={styles.title}>Войдите для AI-чата</Text>
        <Text style={styles.sub}>AI-чат доступен только после входа.</Text>
        <Text onPress={onLogin} style={styles.loginBtn}>Войти</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { paddingBottom: keyboardVisible ? 8 : 98 }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isUser={message.role === "user"}
            router={router}
            onUnsupportedLink={() =>
              Alert.alert("Раздел ещё переносится", "Эта ссылка будет доступна после переноса раздела.")
            }
          />
        ))}

        {typing ? (
          <View style={styles.typingRow}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#F47B20" />
              <Text style={styles.typingText}>Печатает...</Text>
            </View>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={onSend}
        disabled={typing || authBusy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 12 },
  typingRow: { alignItems: "flex-start", marginBottom: 10 },
  typingBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E4DB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typingText: { color: "#6B7280", fontSize: 13, fontWeight: "600" },
  error: { color: "#B91C1C", marginBottom: 8, fontSize: 13 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 98,
  },
  lock: { fontSize: 42 },
  title: { fontSize: 20, fontWeight: "800", color: "#0E0E0E" },
  sub: { fontSize: 14, color: "#6B6B6B", textAlign: "center" },
  loginBtn: {
    marginTop: 8,
    backgroundColor: "#0E0E0E",
    color: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "700",
  },
});
