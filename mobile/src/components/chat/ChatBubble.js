import { openAppLink } from "../../lib/appLinks";
import { Pressable, StyleSheet, Text, View } from "react-native";

function splitTextWithLinks(text) {
  return String(text || "").split(/(app:\/\/[^\s]+)/g).filter(Boolean);
}

export default function ChatBubble({ message, isUser, router, onUnsupportedLink }) {
  const parts = splitTextWithLinks(message?.text || "");

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {parts.map((part, index) => {
          const isLink = /^app:\/\//i.test(part);
          if (!isLink) {
            return (
              <Text key={`txt-${index}`} style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
                {part}
              </Text>
            );
          }

          return (
            <Pressable
              key={`lnk-${index}`}
              onPress={() => {
                const opened = openAppLink(router, part);
                if (!opened && onUnsupportedLink) onUnsupportedLink(part);
              }}
              style={styles.linkWrap}
            >
              <Text style={[styles.linkText, isUser ? styles.linkTextUser : styles.linkTextAssistant]}>{part}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  rowUser: { alignItems: "flex-end" },
  rowAssistant: { alignItems: "flex-start" },
  bubble: {
    maxWidth: "86%",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  bubbleUser: {
    borderRadius: 18,
    borderBottomRightRadius: 6,
    backgroundColor: "#F47B20",
  },
  bubbleAssistant: {
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E4DB",
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
  },
  textUser: { color: "#FFFFFF" },
  textAssistant: { color: "#111827" },
  linkWrap: { marginTop: 2 },
  linkText: {
    fontSize: 14,
    lineHeight: 21,
    textDecorationLine: "underline",
  },
  linkTextUser: { color: "#FFF7ED" },
  linkTextAssistant: { color: "#0F766E" },
});