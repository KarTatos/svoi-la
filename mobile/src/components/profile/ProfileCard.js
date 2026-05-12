import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function ProfileCard({ user, initials, authBusy, onSaveName, onPickAvatar }) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");

  const handleSave = async () => {
    const clean = String(nameInput || "").trim();
    if (!clean) return;
    await onSaveName(clean);
    setEditingName(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.accent} />

      <View>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}><Text style={styles.avatarText}>{initials}</Text></View>
        )}
        <Pressable style={styles.avatarBtn} onPress={onPickAvatar} disabled={authBusy}>
          <Text style={styles.avatarBtnText}>{authBusy ? "..." : "Фото"}</Text>
        </Pressable>
      </View>

      <View style={styles.info}>
        {!editingName ? (
          <>
            <Text style={styles.name} numberOfLines={1}>{user?.name || "Пользователь"}</Text>
            <Pressable onPress={() => { setNameInput(user?.name || ""); setEditingName(true); }}>
              <Text style={styles.editLink}>Изменить имя</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.editWrap}>
            <TextInput
              value={nameInput}
              onChangeText={(v) => setNameInput(v.slice(0, 40))}
              placeholder="Имя в приложении"
              style={styles.input}
              autoCapitalize="words"
            />
            <View style={styles.editActions}>
              <Pressable style={styles.saveBtn} onPress={handleSave} disabled={authBusy || !nameInput.trim()}>
                <Text style={styles.saveBtnText}>Сохранить</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={() => setEditingName(false)} disabled={authBusy}>
                <Text style={styles.cancelBtnText}>Отмена</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={styles.email} numberOfLines={1}>{user?.email || "Email не указан"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  accent: {
    position: "absolute",
    right: -26,
    top: -26,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FDE6CB",
    opacity: 0.8,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#F4F4F5" },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F47B20",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },
  avatarBtn: {
    marginTop: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  avatarBtnText: { color: "#0E0E0E", fontSize: 11, fontWeight: "700" },
  info: { flex: 1, minWidth: 0 },
  name: { color: "#0E0E0E", fontSize: 19, fontWeight: "800" },
  editLink: { marginTop: 4, color: "#F47B20", fontSize: 12, fontWeight: "700" },
  email: { color: "#6B6B6B", fontSize: 13, marginTop: 6 },
  editWrap: { gap: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E8E4DB",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#111827",
    fontSize: 14,
  },
  editActions: { flexDirection: "row", gap: 8 },
  saveBtn: {
    borderRadius: 999,
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  cancelBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E8E4DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cancelBtnText: { color: "#6B6B6B", fontSize: 12, fontWeight: "700" },
});
