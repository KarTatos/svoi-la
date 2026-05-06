import { useRouter } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";
import AppHeader from "../src/components/AppHeader";
import ChatScreen from "../src/components/chat/ChatScreen";
import { useAuth } from "../src/hooks/useAuth";
import { useAiChat } from "../src/hooks/useAiChat";

export default function ChatRoute() {
  const router = useRouter();
  const { user, loading, authBusy } = useAuth();
  const { messages, input, setInput, typing, error, sendMessage } = useAiChat();

  return (
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
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
});