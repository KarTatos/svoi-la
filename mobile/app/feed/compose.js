import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import KeyboardDoneBar, { KEYBOARD_DONE_ID } from "../../src/components/KeyboardDoneBar";
import { useAuth } from "../../src/hooks/useAuth";
import { createPost } from "../../src/lib/community";

const MAX = 500;

export default function ComposeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = text.trim().length > 0 && text.length <= MAX && !loading;

  const handlePublish = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);
    try {
      const post = await createPost({
        text: text.trim(),
        author: user.name || user.email?.split("@")[0] || "Аноним",
        avatar_url: user.avatarUrl || null,
        user_id: user.id,
        parent_id: null,
      });
      queryClient.setQueryData(["community"], (prev = []) => [post, ...prev]);
      router.back();
    } catch (e) {
      Alert.alert("Ошибка", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView edges={["top"]} style={styles.safeTop}>
        <View style={styles.header}>
          <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelTxt}>Отмена</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Новый пост</Text>
          <Pressable
            style={[styles.publishBtn, !canSubmit && styles.publishBtnDisabled]}
            onPress={handlePublish}
            disabled={!canSubmit}
          >
            <Text style={[styles.publishTxt, !canSubmit && styles.publishTxtDisabled]}>
              {loading ? "..." : "Опубл."}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="interactive"
      >
        <View style={styles.authorRow}>
          <View style={styles.authorDot} />
          <Text style={styles.authorName}>
            {user?.name || user?.email?.split("@")[0] || "Аноним"}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Что у вас нового?"
          placeholderTextColor="#48484A"
          value={text}
          onChangeText={setText}
          multiline
          autoFocus
          maxLength={MAX + 10}
          textAlignVertical="top"
          inputAccessoryViewID={KEYBOARD_DONE_ID}
        />
      </ScrollView>

      {/* Char counter */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
        <View style={styles.bottomRow}>
          <View style={styles.charWrap}>
            <Text style={[styles.charCount, text.length > MAX && styles.charCountOver]}>
              {MAX - text.length}
            </Text>
          </View>
        </View>
      </SafeAreaView>
      <KeyboardDoneBar />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D0F" },
  safeTop: { backgroundColor: "#0D0D0F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
  },
  cancelBtn: { padding: 4 },
  cancelTxt: { fontSize: 16, color: "#8E8E93" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  publishBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  publishBtnDisabled: { backgroundColor: "#2C2C2E" },
  publishTxt: { fontSize: 14, fontWeight: "700", color: "#0D0D0F" },
  publishTxtDisabled: { color: "#636366" },

  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  authorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F47B20",
  },
  authorName: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  input: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
    minHeight: 120,
  },

  bottomBar: {
    backgroundColor: "#0D0D0F",
    borderTopWidth: 1,
    borderTopColor: "#1C1C1E",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  charWrap: {},
  charCount: { fontSize: 13, color: "#636366" },
  charCountOver: { color: "#E53935" },
});
