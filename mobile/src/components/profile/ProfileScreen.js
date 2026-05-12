import { ScrollView, StyleSheet, Text, View } from "react-native";
import ProfileActions from "./ProfileActions";
import ProfileCard from "./ProfileCard";
import ProfileStats from "./ProfileStats";

export default function ProfileScreen({
  user,
  initials,
  loading,
  error,
  authBusy,
  myPlacesCount,
  myTipsCount,
  myLikesCount,
  onLogin,
  onLogout,
  onOpenMyPlaces,
  onSaveName,
  onPickAvatar,
}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Профиль</Text>

      {loading ? (
        <View style={styles.card}><Text style={styles.muted}>Загрузка...</Text></View>
      ) : (
        <>
          {user ? (
            <ProfileCard
              user={user}
              initials={initials}
              authBusy={authBusy}
              onSaveName={onSaveName}
              onPickAvatar={onPickAvatar}
            />
          ) : null}

          {user ? (
            <ProfileStats
              myPlacesCount={myPlacesCount}
              myTipsCount={myTipsCount}
              myLikesCount={myLikesCount}
            />
          ) : null}

          <ProfileActions
            user={user}
            authBusy={authBusy}
            onLogin={onLogin}
            onLogout={onLogout}
            onOpenMyPlaces={onOpenMyPlaces}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 120, gap: 12 },
  title: { fontSize: 30, fontWeight: "800", color: "#0E0E0E" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 16,
  },
  muted: { fontSize: 14, color: "#6B6B6B" },
  error: { marginTop: 2, fontSize: 13, color: "#B91C1C" },
});
