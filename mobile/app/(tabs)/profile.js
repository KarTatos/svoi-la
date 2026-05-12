import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileScreen from "../../src/components/profile/ProfileScreen";
import { useAuth } from "../../src/hooks/useAuth";
import { useProfileData } from "../../src/hooks/useProfileData";

export default function ProfileRoute() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    authBusy,
    error: authError,
    signOut,
    updateDisplayName,
    updateAvatar,
  } = useAuth();

  const profileData = useProfileData(user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfileScreen
        user={profileData.user}
        initials={profileData.initials}
        loading={authLoading || profileData.loading}
        error={authError || profileData.error}
        authBusy={authBusy}
        myPlacesCount={profileData.myPlacesCount}
        myTipsCount={profileData.myTipsCount}
        myLikesCount={profileData.myLikesCount}
        onLogin={() => router.push("/login")}
        onLogout={() => signOut().catch(() => {})}
        onOpenMyPlaces={() => router.push("/places")}
        onSaveName={(name) => updateDisplayName(name)}
        onPickAvatar={() => updateAvatar()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE6" },
});
