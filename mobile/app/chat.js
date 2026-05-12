import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../src/components/AppHeader";
import ChatScreen from "../src/components/chat/ChatScreen";
import { useAuth } from "../src/hooks/useAuth";
import { useAiChat } from "../src/hooks/useAiChat";

export default function ChatRoute() {
  const router = useRouter();
  const { user, loading, authBusy } = useAuth();
  const { messages, input, setInput, typing, error, sendMessage } = useAiChat();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <AppHeader />
        <ChatScreen
          router={router}
          user={user}
          loading={loading}
          authBusy={authBusy}
          messages={messages}
          input={input}
          setInput={setInput}
          typing={typing}
          error={error}
          onSend={sendMessage}
          onLogin={() => router.push("/login")}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
});