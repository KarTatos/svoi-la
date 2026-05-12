import { useMemo, useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CIVICS_RAW, shuffleTest } from "../../src/config/civics";

export default function CivicsScreen() {
  const [questions, setQuestions] = useState(() => shuffleTest(CIVICS_RAW));
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const q = questions[idx];
  const selected = Object.prototype.hasOwnProperty.call(answers, idx) ? answers[idx] : null;
  const canPrev = idx > 0;
  const canNext = idx < questions.length - 1 && selected !== null;

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    questions.forEach((item, i) => {
      if (!Object.prototype.hasOwnProperty.call(answers, i)) return;
      if (answers[i] === item.correctIdx) correct += 1;
      else wrong += 1;
    });
    return { correct, wrong, answered: Object.keys(answers).length };
  }, [answers, questions]);

  function restart() {
    setQuestions(shuffleTest(CIVICS_RAW));
    setAnswers({});
    setIdx(0);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Link href="/uscis" asChild>
          <Pressable><Text style={styles.back}>← Exit</Text></Pressable>
        </Link>

        <View style={styles.headRow}>
          <Text style={styles.title}>🇺🇸 Civics Test</Text>
          <Text style={styles.counter}>{idx + 1}/{questions.length}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((idx + 1) / questions.length) * 100}%` }]} />
        </View>

        <View style={styles.card}>
          <Text style={styles.question}>{q.q}</Text>
          <View style={styles.options}>
            {q.opts.map((opt, optIdx) => {
              const isCorrect = optIdx === q.correctIdx;
              const isSelected = optIdx === selected;
              const showCorrect = selected !== null && isCorrect;
              const showWrong = selected !== null && isSelected && !isCorrect;
              return (
                <Pressable
                  key={optIdx}
                  onPress={() => setAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                  style={[styles.option, showCorrect && styles.optionCorrect, showWrong && styles.optionWrong]}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.navRow}>
            <Pressable onPress={() => setIdx((v) => Math.max(0, v - 1))} disabled={!canPrev} style={[styles.btnGhost, !canPrev && styles.btnDisabled]}>
              <Text style={styles.btnGhostText}>← Prev</Text>
            </Pressable>
            <Pressable onPress={() => setIdx((v) => Math.min(questions.length - 1, v + 1))} disabled={!canNext} style={[styles.btnPrimary, !canNext && styles.btnDisabled]}>
              <Text style={styles.btnPrimaryText}>Next →</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.stats}>✅ {stats.correct} · ❌ {stats.wrong} · Ответов: {stats.answered}/{questions.length}</Text>

        <View style={styles.bottomRow}>
          <Pressable onPress={restart} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>🔄 Retry</Text></Pressable>
          <Link href="/uscis" asChild>
            <Pressable style={styles.btnGhost}><Text style={styles.btnGhostText}>← Home</Text></Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
  content: { padding: 16, paddingBottom: 120 },
  back: { fontSize: 13, color: "#6B6B6B", marginBottom: 10, fontWeight: "600" },
  headRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800", color: "#0E0E0E" },
  counter: { fontSize: 13, color: "#8A8680", fontWeight: "600" },
  progressTrack: { width: "100%", height: 4, borderRadius: 3, backgroundColor: "#ECE8E0", marginBottom: 14 },
  progressFill: { height: 4, borderRadius: 3, backgroundColor: "#F47B20" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#F0F0F0", padding: 14 },
  question: { fontSize: 16, fontWeight: "700", color: "#0E0E0E", lineHeight: 23, marginBottom: 12 },
  options: { gap: 8 },
  option: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1.5, borderColor: "#E5E5E5", padding: 12 },
  optionCorrect: { borderColor: "#27AE60", backgroundColor: "#ECF9F1" },
  optionWrong: { borderColor: "#E74C3C", backgroundColor: "#FFF1F1" },
  optionText: { fontSize: 14, color: "#0E0E0E" },
  navRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  btnPrimary: { flex: 1, backgroundColor: "#F47B20", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  btnGhost: { flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1.5, borderColor: "#E5E5E5", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  btnGhostText: { color: "#6B6B6B", fontWeight: "700", fontSize: 13 },
  btnDisabled: { opacity: 0.45 },
  stats: { marginTop: 10, textAlign: "center", fontSize: 12, color: "#8A8680" },
  bottomRow: { flexDirection: "row", gap: 10, marginTop: 10 },
});
