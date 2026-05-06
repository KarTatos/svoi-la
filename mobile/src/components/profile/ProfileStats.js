import { StyleSheet, Text, View } from "react-native";

function Cell({ value, label }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export default function ProfileStats({ myPlacesCount, myTipsCount, myLikesCount }) {
  return (
    <View style={styles.card}>
      <Cell value={myPlacesCount} label="Мест" />
      <Cell value={myTipsCount} label="Советов" />
      <Cell value={myLikesCount} label="Лайков" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    flexDirection: "row",
    overflow: "hidden",
  },
  cell: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  value: { color: "#0E0E0E", fontSize: 30, fontWeight: "700", lineHeight: 34 },
  label: { color: "#8A8680", fontSize: 12, marginTop: 4 },
});
