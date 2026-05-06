import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";
import BottomNav from "../src/components/BottomNav";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="market" />
          <Stack.Screen name="housing" />
          <Stack.Screen name="housing/[id]" />
          <Stack.Screen name="places" />
          <Stack.Screen name="places/[district]/index" />
          <Stack.Screen name="places/[district]/[category]" />
          <Stack.Screen name="places/detail/[id]" />
          <Stack.Screen name="places/map" />
          <Stack.Screen name="uscis" />
          <Stack.Screen name="uscis/[category]" />
          <Stack.Screen name="uscis/civics" />
        </Stack>
        <BottomNav />
      </View>
    </QueryClientProvider>
  );
}
