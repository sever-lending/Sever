import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetMyProfile } from "@workspace/api-client-react";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}`;

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function LoginGate({ colors, topPad }: { colors: any; topPad: number }) {
  const router = useRouter();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Wallet</Text>
      </View>
      <View style={styles.centered}>
        <View style={[styles.gateIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="wallet-outline" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.gateTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Your wallet awaits
        </Text>
        <Text style={[styles.gateText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Sign in to deposit funds and start earning on the Sever marketplace.
        </Text>
        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/login")}
        >
          <Text style={[styles.loginBtnText, { color: colors.primaryForeground, fontFamily: "Inter_700Bold" }]}>
            SIGN IN
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token } = useAuth();

  const { data: profile, isLoading, refetch, isRefetching } = useGetMyProfile();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleDeposit = async () => {
    if (!token) { router.push("/login"); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/stripe/checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: 100 }),
      });
      const data = await res.json();
      if (data.url) Linking.openURL(data.url);
    } catch {}
  };

  if (!user) return <LoginGate colors={colors} topPad={topPad} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Wallet</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 100 : 110 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {isLoading ? (
          <View style={[styles.centered, { paddingTop: 80 }]}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(400).delay(60)} style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.balanceLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                AVAILABLE BALANCE
              </Text>
              <Text style={[styles.balanceVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {fmt(profile?.walletBalance ?? 0)}
              </Text>
              <View style={[styles.balanceDivider, { backgroundColor: colors.border }]} />
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.actionChip, { backgroundColor: colors.primary }]}
                  onPress={handleDeposit}
                  activeOpacity={0.8}
                >
                  <Feather name="arrow-down-circle" size={15} color={colors.primaryForeground} />
                  <Text style={[styles.actionChipText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                    Deposit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionChip, { backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }]}
                  onPress={() => router.push("/(tabs)")}
                  activeOpacity={0.8}
                >
                  <Feather name="trending-up" size={15} color={colors.foreground} />
                  <Text style={[styles.actionChipText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    Lend
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionChip, { backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }]}
                  onPress={() => router.push("/(tabs)/borrow")}
                  activeOpacity={0.8}
                >
                  <Feather name="credit-card" size={15} color={colors.foreground} />
                  <Text style={[styles.actionChipText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    Borrow
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <View style={[styles.infoBox, { backgroundColor: colors.accent, borderColor: colors.primary + "30" }]}>
              <Feather name="shield" size={15} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Deposits open Stripe's secure checkout in your browser. Funds appear in your wallet within seconds.
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              ACCOUNT STATS
            </Text>

            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Row label="Trust Score" value={String(profile?.trustScore ?? 0)} colors={colors} />
              <Row label="Tier" value={(profile?.tier ?? "unverified").toUpperCase()} accent colors={colors} />
              <Row label="Loans Funded" value={String(profile?.loansFunded ?? 0)} colors={colors} />
              <Row label="Loans Borrowed" value={String(profile?.loansBorrowed ?? 0)} colors={colors} />
              <Row label="On-Time Payments" value={String(profile?.onTimePayments ?? 0)} accent colors={colors} />
              <Row label="Late Payments" value={String(profile?.latePayments ?? 0)} colors={colors} last />
            </View>

            <TouchableOpacity
              style={[styles.premiumBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}
              onPress={() => router.push("/premium")}
              activeOpacity={0.8}
            >
              <Feather name="star" size={16} color={colors.primary} />
              <Text style={[styles.premiumBannerText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                Unlock Premium — lower fees & higher limits
              </Text>
              <Feather name="chevron-right" size={14} color={colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Row({ label, value, accent, last, colors }: { label: string; value: string; accent?: boolean; last?: boolean; colors: any }) {
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
      <Text style={[styles.rowVal, { color: accent ? colors.primary : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
        {value}
      </Text>
    </View>
  );
}

const R = 14;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  heading: { fontSize: 24, letterSpacing: -0.3 },
  scroll: { padding: 16, gap: 12 },
  balanceCard: { padding: 22, borderRadius: R, borderWidth: 1, alignItems: "center" },
  balanceLabel: { fontSize: 10, letterSpacing: 1.5, marginBottom: 8 },
  balanceVal: { fontSize: 52, letterSpacing: -2 },
  balanceDivider: { height: 1, width: "100%", marginVertical: 18 },
  quickActions: { flexDirection: "row", gap: 10, width: "100%" },
  actionChip: {
    flex: 1,
    flexDirection: "row",
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderRadius: R,
  },
  actionChipText: { fontSize: 13 },
  infoBox: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: R,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  infoText: { fontSize: 12, flex: 1, lineHeight: 18 },
  sectionTitle: { fontSize: 10, letterSpacing: 1.5, marginTop: 4, marginBottom: 2 },
  statsCard: { borderRadius: R, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", padding: 15 },
  rowLabel: { fontSize: 13 },
  rowVal: { fontSize: 13 },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: R,
    borderWidth: 1,
  },
  premiumBannerText: { flex: 1, fontSize: 13 },
  centered: { justifyContent: "center", alignItems: "center", gap: 14, paddingHorizontal: 32 },
  gateIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  gateTitle: { fontSize: 20, letterSpacing: -0.2 },
  gateText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: R, marginTop: 4 },
  loginBtnText: { fontSize: 13, letterSpacing: 0.5 },
});
