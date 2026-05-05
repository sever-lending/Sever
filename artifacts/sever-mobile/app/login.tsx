import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}`;

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setToken } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectUri = `${BASE}/api/mobile-auth/callback`;
      const res = await WebBrowser.openAuthSessionAsync(
        `${BASE}/api/login?returnTo=${encodeURIComponent("/api/mobile-auth/token")}`,
        redirectUri,
        { showInRecents: true }
      );

      if (res.type === "success" && res.url) {
        const url = new URL(res.url);
        const token = url.searchParams.get("token");
        if (token) {
          setToken(token);
          queryClient.invalidateQueries();
          router.back();
        } else {
          setError("Authentication failed. Please try again.");
        }
      }
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: botPad + 20 }]}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="x" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.wordmark, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>SEVER.</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Your money. Your terms. No banks.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Sign in to Sever
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Lend, borrow, and manage your portfolio.
          </Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40" }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                {error}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} size="small" />
            ) : (
              <>
                <Feather name="user" size={16} color={colors.primaryForeground} />
                <Text style={[styles.loginBtnText, { color: colors.primaryForeground, fontFamily: "Inter_700Bold" }]}>
                  CONTINUE WITH REPLIT
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          By continuing, you agree to Sever's Terms of Service and Privacy Policy. P2P lending involves risk of capital loss.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  closeBtn: { position: "absolute", top: 60, right: 20, zIndex: 10 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 20 },
  wordmark: { fontSize: 36, letterSpacing: 4, textAlign: "center" },
  tagline: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  card: {
    padding: 24,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  cardTitle: { fontSize: 18 },
  cardSub: { fontSize: 13, lineHeight: 18 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  errorText: { fontSize: 12, flex: 1 },
  loginBtn: {
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderRadius: 4,
  },
  loginBtnText: { fontSize: 13, letterSpacing: 1 },
  disclaimer: { fontSize: 11, textAlign: "center", lineHeight: 16, paddingHorizontal: 8 },
});
