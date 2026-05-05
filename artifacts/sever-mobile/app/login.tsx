import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
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
          await queryClient.invalidateQueries();
          router.replace("/(tabs)");
        } else {
          setError("Authentication failed. Please try again.");
        }
      } else if (res.type === "cancel") {
        setError(null);
      }
    } catch (e: any) {
      setError(e.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = () => {
    Linking.openURL(`${BASE}/login`);
  };

  const handleForgotPassword = () => {
    Linking.openURL("https://replit.com/account#account-email");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 16, backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Feather name="x" size={18} color={colors.foreground} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 72, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.logoLetter, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>S</Text>
          </View>
          <Text style={[styles.wordmark, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>SEVER.</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Your money. Your terms. No banks.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Welcome back
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Sign in to lend, borrow, and manage your portfolio.
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
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.75 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} size="small" />
            ) : (
              <>
                <Feather name="log-in" size={18} color={colors.primaryForeground} />
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground, fontFamily: "Inter_700Bold" }]}>
                  CONTINUE WITH REPLIT
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={[styles.dividerRow, { borderColor: colors.border }]}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={handleEmailLogin}
            activeOpacity={0.8}
          >
            <Feather name="mail" size={18} color={colors.foreground} />
            <Text style={[styles.secondaryBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Sign in with Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7} style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
              Forgot password or need to recover your account?
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.benefitsRow]}>
          {[
            { icon: "shield" as const, label: "Secure OIDC" },
            { icon: "trending-up" as const, label: "Real Yields" },
            { icon: "zap" as const, label: "Instant Funding" },
          ].map((b) => (
            <View key={b.label} style={[styles.benefit, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={b.icon} size={18} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                {b.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          By continuing, you agree to Sever's{" "}
          <Text style={{ color: colors.primary }} onPress={() => Linking.openURL(`${BASE}/terms`)}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text style={{ color: colors.primary }} onPress={() => Linking.openURL(`${BASE}/privacy`)}>
            Privacy Policy
          </Text>
          . P2P lending involves risk of capital loss.
        </Text>
      </ScrollView>
    </View>
  );
}

const R = 14;

const styles = StyleSheet.create({
  root: { flex: 1 },
  closeBtn: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { paddingHorizontal: 24, gap: 20 },
  hero: { alignItems: "center", gap: 10, paddingTop: 8 },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  logoLetter: { fontSize: 34, lineHeight: 40 },
  wordmark: { fontSize: 32, letterSpacing: 5 },
  tagline: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  card: {
    padding: 24,
    borderRadius: R,
    borderWidth: 1,
    gap: 14,
  },
  cardTitle: { fontSize: 22, letterSpacing: -0.3 },
  cardSub: { fontSize: 13, lineHeight: 19 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: R - 4,
    borderWidth: 1,
  },
  errorText: { fontSize: 12, flex: 1, lineHeight: 17 },
  primaryBtn: {
    flexDirection: "row",
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderRadius: R,
  },
  primaryBtnText: { fontSize: 14, letterSpacing: 0.5 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  secondaryBtn: {
    flexDirection: "row",
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderRadius: R,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 14 },
  forgotBtn: { alignItems: "center", paddingVertical: 2 },
  forgotText: { fontSize: 13, textDecorationLine: "underline", textAlign: "center" },
  benefitsRow: { flexDirection: "row", gap: 8 },
  benefit: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderRadius: R - 2,
    borderWidth: 1,
  },
  benefitText: { fontSize: 10, textAlign: "center" },
  disclaimer: { fontSize: 11, textAlign: "center", lineHeight: 17, paddingHorizontal: 4 },
});
