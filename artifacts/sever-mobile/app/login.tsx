import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
  useColorScheme,
} from "react-native";
import * as ExpoLinking from "expo-linking";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}`;

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setToken } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doAuthFlow = async (setL: (v: boolean) => void) => {
    setL(true);
    setError(null);
    try {
      // createURL produces exp://… in Expo Go and sever-mobile://… in
      // production — the OS can intercept these without Associated Domains.
      const redirectUri = ExpoLinking.createURL("mobile-auth/callback");
      const returnTo = `/api/mobile-auth/token?redirectUri=${encodeURIComponent(redirectUri)}`;
      const res = await WebBrowser.openAuthSessionAsync(
        `${BASE}/api/login?returnTo=${encodeURIComponent(returnTo)}`,
        redirectUri,
        { showInRecents: true }
      );

      if (res.type === "success" && res.url) {
        const url = new URL(res.url);
        const code = url.searchParams.get("code");
        if (code) {
          const exchangeRes = await fetch(`${BASE}/api/mobile-auth/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          if (!exchangeRes.ok) {
            setError("Authentication failed. Please try again.");
            return;
          }
          const { token } = await exchangeRes.json();
          if (token) {
            setToken(token);
            await queryClient.invalidateQueries();
            router.replace("/(tabs)");
          } else {
            setError("Authentication failed. Please try again.");
          }
        } else {
          setError("Authentication failed. Please try again.");
        }
      }
    } catch (e: any) {
      setError(e.message ?? "Login failed. Please try again.");
    } finally {
      setL(false);
    }
  };

  const handleLogin = () => doAuthFlow(setLoading);
  const handleEmailLogin = () => doAuthFlow(setEmailLoading);
  const handleForgotPassword = () =>
    Linking.openURL("https://replit.com/account#account-email");

  const gradientColors = isDark
    ? (["#09090b", "#0d1f17", "#09090b"] as const)
    : (["#f4f4f5", "#e8fdf6", "#f4f4f5"] as const);

  return (
    <LinearGradient colors={gradientColors} style={styles.root}>
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.closeBtn,
          {
            top: insets.top + 16,
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 72, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500).delay(50)} style={styles.hero}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary + "25" }]}>
            <Text style={[styles.logoLetter, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              S
            </Text>
          </View>
          <Text style={[styles.wordmark, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            SEVER.
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Your money. Your terms. No banks.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(150)}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Welcome back
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Sign in to lend, borrow, and manage your portfolio.
          </Text>

          {error && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={[styles.errorBox, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40" }]}
            >
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                {error}
              </Text>
            </Animated.View>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.75 : 1 }]}
            onPress={handleLogin}
            disabled={loading || emailLoading}
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

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              or
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              { backgroundColor: colors.secondary, borderColor: colors.border, opacity: emailLoading ? 0.75 : 1 },
            ]}
            onPress={handleEmailLogin}
            disabled={loading || emailLoading}
            activeOpacity={0.8}
          >
            {emailLoading ? (
              <ActivityIndicator color={colors.foreground} size="small" />
            ) : (
              <>
                <Feather name="mail" size={18} color={colors.foreground} />
                <Text style={[styles.secondaryBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Sign in with Email
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleForgotPassword}
            activeOpacity={0.7}
            style={styles.forgotBtn}
          >
            <Text style={[styles.forgotText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
              Forgot password or need account recovery?
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(250)} style={styles.benefitsRow}>
          {[
            { icon: "shield" as const, label: "Secure OIDC" },
            { icon: "trending-up" as const, label: "Real Yields" },
            { icon: "zap" as const, label: "Instant Funding" },
          ].map((b) => (
            <View
              key={b.label}
              style={[styles.benefit, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name={b.icon} size={20} color={colors.primary} />
              <Text style={[styles.benefitText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                {b.label}
              </Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(300)}>
          <Text style={[styles.disclaimer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            By continuing, you agree to Sever's{" "}
            <Text
              style={{ color: colors.primary }}
              onPress={() => Linking.openURL(`${BASE}/terms`)}
            >
              Terms of Service
            </Text>
            {" "}and{" "}
            <Text
              style={{ color: colors.primary }}
              onPress={() => Linking.openURL(`${BASE}/privacy`)}
            >
              Privacy Policy
            </Text>
            . P2P lending involves risk of capital loss. Not FDIC insured.
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
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
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  logoLetter: { fontSize: 40, lineHeight: 46 },
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
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: R - 2,
    borderWidth: 1,
  },
  benefitText: { fontSize: 10, textAlign: "center", letterSpacing: 0.2 },
  disclaimer: { fontSize: 11, textAlign: "center", lineHeight: 17, paddingHorizontal: 4 },
});
