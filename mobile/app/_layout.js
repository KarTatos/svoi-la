import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import BottomNav from "../src/components/BottomNav";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ActionSheetProvider>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <BottomNav />
        </View>
      </QueryClientProvider>
    </ActionSheetProvider>
  );
}
