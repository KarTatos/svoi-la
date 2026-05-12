import { openAppLink } from "../../lib/appLinks";
import { Pressable, StyleSheet, Text, View } from "react-native";

// ─── Russian date pattern ────────────────────────────────────────────────────
const DATE_RE =
  /\b\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+\d{4}\b/i;

// ─── Link type → button label ─────────────────────────────────────────────────
const LINK_LABELS = {
  place:   "Открыть место",
  event:   "Открыть событие",
  tip:     "Читать совет",
  housing: "Открыть жильё",
  job:     "Открыть",
};

function getLinkLabel(url) {
  const m = String(url || "").match(/^app:\/\/(\w+)\//i);
  return LINK_LABELS[m?.[1]?.toLowerCase()] || "Открыть";
}

// ─── Message parser ───────────────────────────────────────────────────────────
// Returns array of blocks: { type: 'text'|'item', content, date?, link? }
function parseMessage(raw) {
  const lines = String(raw || "")
    .split("\n")
    .map((l) => l.trimEnd());

  const blocks = [];
  let textBuf = [];

  const flushText = () => {
    const joined = textBuf.join("\n").trim();
    if (joined) blocks.push({ type: "text", content: joined });
    textBuf = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("-")) {
      flushText();

      // Extract link
      const linkMatch = trimmed.match(/app:\/\/[^\s]+/);
      const link = linkMatch ? linkMatch[0] : null;

      // Clean text: remove link + its prefix markers
      let content = trimmed
        .replace(/\|\s*link:\s*app:\/\/[^\s]+/gi, "")
        .replace(/[Сс]сылка:\s*app:\/\/[^\s]+/gi, "")
        .replace(/app:\/\/[^\s]+/gi, "")
        .replace(/^-\s*/, "")
        .replace(/\|\s*$/, "")
        .trim();

      // Extract date
      const dateMatch = content.match(DATE_RE);
      let date = null;
      if (dateMatch) {
        date = dateMatch[0];
        // Remove date and surrounding punctuation/comma from content
        content = content.replace(DATE_RE, "").replace(/,\s*,/g, ",").replace(/—\s*,/g, "—").trim();
        content = content.replace(/,\s*$/, "").trim();
      }

      blocks.push({ type: "item", content, date, link });
    } else {
      // Empty line between text blocks
      if (!trimmed && textBuf.length) {
        textBuf.push("");
      } else if (trimmed) {
        textBuf.push(trimmed);
      }
    }
  }

  flushText();
  return blocks;
}

// ─── Item card ────────────────────────────────────────────────────────────────
function ItemCard({ block, router, onUnsupportedLink }) {
  const label = block.link ? getLinkLabel(block.link) : null;

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemText}>{block.content}</Text>
      {block.date ? (
        <Text style={styles.itemDate}>{block.date}</Text>
      ) : null}
      {label ? (
        <Pressable
          onPress={() => {
            if (!block.link) return;
            const opened = openAppLink(router, block.link);
            if (!opened && onUnsupportedLink) onUnsupportedLink(block.link);
          }}
          style={({ pressed }) => [styles.linkBtn, pressed && styles.linkBtnPressed]}
        >
          <Text style={styles.linkBtnText}>{label} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─── Main bubble ──────────────────────────────────────────────────────────────
export default function ChatBubble({ message, isUser, router, onUnsupportedLink }) {
  const blocks = parseMessage(message?.text || "");

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {blocks.map((block, i) => {
          if (block.type === "text") {
            return (
              <Text
                key={i}
                style={[styles.text, isUser ? styles.textUser : styles.textAssistant, i > 0 && styles.textSpaced]}
              >
                {block.content}
              </Text>
            );
          }
          return (
            <ItemCard
              key={i}
              block={block}
              router={router}
              onUnsupportedLink={onUnsupportedLink}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  row: {
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  rowUser: { alignItems: "flex-end" },
  rowAssistant: { alignItems: "flex-start" },

  bubble: {
    maxWidth: "90%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
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
  textSpaced: { marginTop: 2 },
  textUser: { color: "#FFFFFF" },
  textAssistant: { color: "#111827" },

  // Item card — sits inside the assistant bubble
  itemCard: {
    backgroundColor: "#F9F7F4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#111827",
  },
  itemDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  linkBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
    backgroundColor: "#111827",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  linkBtnPressed: { opacity: 0.7 },
  linkBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
