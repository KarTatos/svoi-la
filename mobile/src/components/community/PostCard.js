import { ActionSheetIOS, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react-native";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}с`;
  if (diff < 3600) return `${Math.floor(diff / 60)}м`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ч`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}д`;
  return `${Math.floor(diff / 604800)}н`;
}

function Avatar({ url, name, size = 40 }) {
  const letter = String(name || "?")[0].toUpperCase();
  const colors = ["#E53935", "#F47B20", "#43A047", "#1E88E5", "#8E24AA", "#00897B"];
  const color = colors[letter.charCodeAt(0) % colors.length];

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  return (
    <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.avatarLetter, { fontSize: size * 0.42 }]}>{letter}</Text>
    </View>
  );
}

export default function PostCard({
  post,
  liked = false,
  onLike,
  onReply,
  onOpen,
  onDelete,
  isOwner = false,
  showThreadLine = false,
}) {
  const handleMore = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: isOwner ? ["Удалить", "Отмена"] : ["Пожаловаться", "Отмена"],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (idx) => {
          if (idx === 0 && isOwner && onDelete) onDelete(post.id);
        }
      );
    }
  };

  return (
    <Pressable onPress={onOpen} style={styles.card}>
      {/* Thread connector line — absolute, runs from below avatar to card bottom */}
      {showThreadLine && <View style={styles.threadLine} />}

      <View style={styles.row}>

        {/* Avatar */}
        <View style={styles.avatarCol}>
          <Avatar url={post.avatarUrl} name={post.author} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.author} numberOfLines={1}>{post.author}</Text>
            <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
            <Pressable onPress={handleMore} hitSlop={8} style={styles.moreBtn}>
              <MoreHorizontal size={18} color="#636366" strokeWidth={2} />
            </Pressable>
          </View>

          {/* Post text */}
          <Text style={styles.text}>{post.text}</Text>

          {/* Action row */}
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={onLike}>
              <Heart
                size={19}
                color={liked ? "#E53935" : "#636366"}
                fill={liked ? "#E53935" : "none"}
                strokeWidth={2}
              />
              {post.likesCount > 0 ? (
                <Text style={[styles.actionCount, liked && styles.actionCountLiked]}>
                  {post.likesCount}
                </Text>
              ) : null}
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={onReply}>
              <MessageCircle size={19} color="#636366" strokeWidth={2} />
              {post.repliesCount > 0 ? (
                <Text style={styles.actionCount}>{post.repliesCount}</Text>
              ) : null}
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.separator} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },

  avatarCol: {
    width: 40,
    alignItems: "center",
  },
  avatar: {
    marginTop: 1,
  },
  avatarFallback: {
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#fff",
    fontWeight: "700",
  },

  // Thread connector line — absolute, from below avatar to card bottom
  // left = paddingHorizontal(16) + avatarCenter(20) - lineHalfWidth(1) = 35
  // top  = paddingTop(14) + avatarMargin(1) + avatarHeight(40) + gap(5) = 60
  threadLine: {
    position: "absolute",
    left: 35,
    top: 60,
    bottom: 0,
    width: 2,
    backgroundColor: "#2C2C2E",
    borderRadius: 1,
  },

  content: {
    flex: 1,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  author: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  time: {
    fontSize: 13,
    color: "#636366",
  },
  moreBtn: {
    padding: 2,
  },
  text: {
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    lineHeight: 21,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 18,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    color: "#636366",
  },
  actionCountLiked: {
    color: "#E53935",
  },
  separator: {
    height: 1,
    backgroundColor: "#1C1C1E",
    marginLeft: 52,
    marginTop: 0,
  },
});
