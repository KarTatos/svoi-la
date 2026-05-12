import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar, Clock, MapPin } from "lucide-react-native";

const ACCENT = "#F47B20";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function AvatarStack({ attendees = [], total = 0 }) {
  const visible = attendees.slice(0, 3);
  const extra = total > 3 ? total - 3 : 0;
  if (total === 0) return null;
  return (
    <View style={av.row}>
      {visible.map((a, i) => (
        <View key={a.id ?? i} style={[av.bubble, { marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }]}>
          {a.avatar_url ? (
            <Image source={{ uri: a.avatar_url }} style={av.img} />
          ) : (
            <View style={[av.img, av.letter]}>
              <Text style={av.letterText}>{(a.name || "?")[0].toUpperCase()}</Text>
            </View>
          )}
        </View>
      ))}
      {extra > 0 && (
        <View style={[av.bubble, av.more, { marginLeft: -8 }]}>
          <Text style={av.moreText}>{extra}+</Text>
        </View>
      )}
    </View>
  );
}

export default function EventCard({ event, attendees = [], onPress, featured = false }) {
  const time = formatTime(event.date);
  const dateLabel = formatDateLabel(event.date);

  if (featured) {
    return (
      <Pressable style={[styles.card, styles.featured]} onPress={onPress}>
        {event.cover_url ? (
          <Image source={{ uri: event.cover_url }} style={styles.featuredCover} resizeMode="cover" />
        ) : (
          <View style={[styles.featuredCover, styles.coverPlaceholder]}>
            <Text style={styles.placeholderIcon}>🎉</Text>
          </View>
        )}
        <View style={styles.featuredBody}>
          <View style={styles.featuredMeta}>
            <View style={styles.metaRow}>
              <Clock size={12} color={ACCENT} strokeWidth={2.5} />
              <Text style={styles.featuredMetaText}>{time}</Text>
              {event.location ? (
                <>
                  <Text style={styles.metaDot}>·</Text>
                  <MapPin size={12} color={ACCENT} strokeWidth={2.5} />
                  <Text style={styles.featuredMetaText} numberOfLines={1}>{event.location}</Text>
                </>
              ) : null}
            </View>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.featuredFooter}>
            <AvatarStack attendees={attendees} total={attendees.length} />
            {event.price ? (
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>{event.price}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {event.cover_url ? (
        <Image source={{ uri: event.cover_url }} style={styles.cover} resizeMode="cover" />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.placeholderIcon}>🎉</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Clock size={12} color="#9CA3AF" strokeWidth={2.5} />
          <Text style={styles.metaText}>{time}</Text>
          {event.location ? (
            <>
              <Text style={styles.metaDot}>·</Text>
              <MapPin size={12} color="#9CA3AF" strokeWidth={2.5} />
              <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
            </>
          ) : null}
        </View>
        <View style={styles.footer}>
          <AvatarStack attendees={attendees} total={attendees.length} />
          {event.price ? (
            <View style={styles.priceBadgeSmall}>
              <Text style={styles.priceTextSmall}>{event.price}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.bookmarkWrap}>
        <Text style={styles.bookmarkIcon}>↗</Text>
      </View>
    </Pressable>
  );
}

const av = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  bubble: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: "#fff", overflow: "hidden" },
  img: { width: 22, height: 22, borderRadius: 11 },
  letter: { backgroundColor: ACCENT, alignItems: "center", justifyContent: "center" },
  letterText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  more: { backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  moreText: { fontSize: 9, fontWeight: "700", color: "#374151" },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0EDE8",
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // Featured (first event of day) — full-width, accent top
  featured: {
    flexDirection: "column",
    borderColor: "transparent",
    shadowOpacity: 0.10,
    shadowRadius: 16,
  },
  featuredCover: {
    width: "100%",
    height: 180,
    backgroundColor: "#F3F0EA",
  },
  featuredBody: {
    padding: 16,
  },
  featuredMeta: {
    marginBottom: 6,
  },
  featuredMetaText: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: "600",
    marginLeft: 4,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 24,
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // Regular card
  cover: {
    width: 80,
    height: 80,
    margin: 12,
    borderRadius: 12,
    backgroundColor: "#F3F0EA",
    flexShrink: 0,
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: { fontSize: 28 },
  body: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 4,
    justifyContent: "center",
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  metaDot: { color: "#D1D5DB", fontSize: 12 },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    flexShrink: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  priceBadge: {
    backgroundColor: "#FFF3E8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceText: { fontSize: 12, fontWeight: "700", color: ACCENT },
  priceBadgeSmall: {
    backgroundColor: "#F3F0EA",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priceTextSmall: { fontSize: 11, fontWeight: "600", color: "#6B7280" },
  bookmarkWrap: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkIcon: { fontSize: 16, color: "#D1D5DB", fontWeight: "700" },
});
