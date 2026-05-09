import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

WebBrowser.maybeCompleteAuthSession();

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}`;

export default function MobileAuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { setToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/mobile-auth/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        if (!res.ok) return;
        const { token } = await res.json();
        if (token) {
          setToken(token);
          await queryClient.invalidateQueries();
          router.replace("/(tabs)");
        }
      } catch {
        router.replace("/login");
      }
    })();
  }, [code]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#09090b" }}>
      <ActivityIndicator size="large" color="#2DD4A0" />
      <Text style={{ color: "#6b7280", marginTop: 16, fontSize: 14 }}>Signing you in…</Text>
    </View>
  );
}
