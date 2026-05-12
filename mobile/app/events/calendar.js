import { useCallback, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, X } from "lucide-react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useEventsQuery } from "../../src/hooks/useEventsQuery";
import EventCard from "../../src/components/events/EventCard";

const ACCENT = "#F47B20";
const DAYS_RU = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTHS_RU = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];
const CATEGORY_LABELS = {
  community: "🤝 Сообщество",
  culture: "🎭 Культура",
  education: "📚 Обучение",
  sport: "⚽ Спорт",
  food: "🍕 Еда",
  music: "🎵 Музыка",
  networking: "💼 Нетворкинг",
  outdoor: "🏕️ Активный отдых",
  other: "✨ Другое",
};

function buildCalendarDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = -7; i <= 52; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function eventDate(iso) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d;
}

const DAY_W = 52; // item width + gap for getItemLayout
const DAY_PAD = 12; // paddingHorizontal of calContent

export default function EventsCalendarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { category: paramCategory } = useLocalSearchParams();
  const { data: events = [], isLoading, isError, refetch } = useEventsQuery();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDay, setSelectedDay] = useState(today);
  const calendarDays = useMemo(buildCalendarDays, []);
  const calRef = useRef(null);
  const TODAY_INDEX = 7;

  // Events filtered by selected category (from params)
  const categoryEvents = useMemo(() => {
    if (!paramCategory) return events;
    return events.filter(e => e.category === paramCategory);
  }, [events, paramCategory]);

  // Events filtered by selected day + category
  const filteredEvents = useMemo(
    () => categoryEvents.filter(e => isSameDay(eventDate(e.date), selectedDay)),
    [categoryEvents, selectedDay]
  );

  const monthLabel = useMemo(
    () => `${MONTHS_RU[selectedDay.getMonth()]} ${selectedDay.getFullYear()}`,
    [selectedDay]
  );

  const handleDayPress = useCallback((day) => setSelectedDay(day), []);

  const renderDay = useCallback(({ item: day }) => {
    const isSelected = isSameDay(day, selectedDay);
    const hasEvents = categoryEvents.some(e => isSameDay(eventDate(e.date), day));
    return (
      <Pressable
        onPress={() => handleDayPress(day)}
        style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
      >
        <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>
          {DAYS_RU[day.getDay()]}
        </Text>
        <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>
          {day.getDate()}
        </Text>
        {hasEvents && !isSelected ? (
          <View style={styles.dot} />
        ) : isSelected ? (
          <View style={[styles.dot, styles.dotActive]} />
        ) : (
          <View style={styles.dotEmpty} />
        )}
      </Pressable>
    );
  }, [selectedDay, categoryEvents, handleDayPress]);

  const renderEvent = useCallback(({ item: event, index }) => (
    <EventCard
      event={event}
      attendees={[]}
      featured={index === 0}
      onPress={() => router.push(`/events/${event.id}`)}
    />
  ), [router]);

  const eventCount = filteredEvents.length;
  const sectionCountLabel =
    eventCount === 1 ? "1 событие" :
    eventCount >= 2 && eventCount <= 4 ? `${eventCount} события` :
    `${eventCount} событий`;

  const sectionDayLabel = isSameDay(selectedDay, today)
    ? "Сегодня"
    : selectedDay.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  const catLabel = paramCategory ? CATEGORY_LABELS[paramCategory] : null;

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {catLabel ? catLabel.split(" ").slice(1).join(" ") : "Все события"}
        </Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            if (!user) { router.push("/login"); return; }
            router.push("/events/add");
          }}
        >
          <Plus size={20} color={ACCENT} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Active category pill */}
      {catLabel && (
        <View style={styles.catFilterRow}>
          <View style={styles.catFilterPill}>
            <Text style={styles.catFilterText}>{catLabel}</Text>
            <Pressable onPress={() => router.replace("/events/calendar")} style={styles.catFilterX}>
              <X size={13} color={ACCENT} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Calendar */}
      <Text style={styles.monthLabel}>{monthLabel}</Text>
      <FlatList
        ref={calRef}
        data={calendarDays}
        horizontal
        keyExtractor={(d) => d.toISOString()}
        renderItem={renderDay}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calContent}
        style={styles.calStrip}
        initialScrollIndex={TODAY_INDEX}
        getItemLayout={(_, index) => ({
          length: 48,
          offset: DAY_PAD + DAY_W * index,
          index,
        })}
      />

      {/* Section header */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>{sectionDayLabel}</Text>
        <Text style={styles.sectionCount}>{sectionCountLabel}</Text>
      </View>

      {/* Events list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={ACCENT} />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Ошибка загрузки</Text>
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Повторить</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(e) => String(e.id)}
          renderItem={renderEvent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>Событий нет</Text>
              <Text style={styles.emptySub}>В этот день пока ничего не запланировано</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAF8" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
  },
  backTxt: { fontSize: 26, lineHeight: 26, color: "#8E8E93" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#FFF3E8", borderWidth: 1.5, borderColor: "#F47B2055",
    alignItems: "center", justifyContent: "center",
  },

  // Category filter
  catFilterRow: { paddingHorizontal: 16, paddingBottom: 8 },
  catFilterPill: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    backgroundColor: "#FFF3E8", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: "#FDE3C8", gap: 6,
  },
  catFilterText: { fontSize: 13, fontWeight: "700", color: ACCENT },
  catFilterX: { padding: 2 },

  // Calendar
  monthLabel: {
    fontSize: 20, fontWeight: "800", color: "#111827",
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12,
  },
  calStrip: { flexGrow: 0 },
  calContent: { paddingHorizontal: DAY_PAD, gap: 4 },
  dayBtn: {
    width: 48, paddingVertical: 10, borderRadius: 14,
    alignItems: "center", gap: 4, backgroundColor: "transparent",
  },
  dayBtnActive: { backgroundColor: "#111827" },
  dayName: { fontSize: 11, fontWeight: "600", color: "#9CA3AF" },
  dayNameActive: { color: "rgba(255,255,255,0.7)" },
  dayNum: { fontSize: 17, fontWeight: "700", color: "#1F2937" },
  dayNumActive: { color: "#FFFFFF" },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: ACCENT },
  dotActive: { backgroundColor: "rgba(255,255,255,0.8)" },
  dotEmpty: { width: 5, height: 5 },

  // Section
  sectionRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  sectionCount: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

  listContent: { paddingBottom: 120 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingTop: 60 },
  loadingText: { fontSize: 14, color: "#6B7280" },
  errorText: { fontSize: 15, color: "#B91C1C", fontWeight: "600" },
  retryBtn: { backgroundColor: "#111827", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9 },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyWrap: { alignItems: "center", paddingTop: 48, paddingHorizontal: 32, gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#374151" },
  emptySub: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 20 },
});
