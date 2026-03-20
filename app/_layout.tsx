import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../src/store/authStore";
import React, { useMemo } from "react";

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);
  const hydrated = useAuthStore((state) => state.hydrated);

  console.log('App Hydrated:', hydrated);

  if (!hydrated) {
    return null; // This will now resolve even if AsyncStorage is broken
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(lecturer)" />
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
