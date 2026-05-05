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
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetMyProfile } from "@workspace/api-client-react";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}`;

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Wallet</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="wallet-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Log in to view your wallet
          </Text>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/login")}
          >
            <Text style={[styles.loginBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
              LOG IN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Wallet</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 84 : 100 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <>
            <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.balanceLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                AVAILABLE BALANCE
              </Text>
              <Text style={[styles.balanceVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {fmt(profile?.walletBalance ?? 0)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={handleDeposit}
              activeOpacity={0.8}
            >
              <Feather name="arrow-down-circle" size={18} color={colors.primaryForeground} />
              <Text style={[styles.actionText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                DEPOSIT VIA STRIPE
              </Text>
            </TouchableOpacity>

            <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="info" size={14} color={colors.mutedForeground} />
              <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Deposits open Stripe's secure checkout in your browser. Return to the app after payment.
              </Text>
            </View>

            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Row label="Trust Score" value={String(profile?.trustScore ?? 0)} colors={colors} />
              <Row label="Tier" value={(profile?.tier ?? "unverified").toUpperCase()} accent colors={colors} />
              <Row label="Loans Funded" value={String(profile?.loansFunded ?? 0)} colors={colors} />
              <Row label="Loans Borrowed" value={String(profile?.loansBorrowed ?? 0)} colors={colors} />
              <Row label="On-Time Payments" value={String(profile?.onTimePayments ?? 0)} accent colors={colors} />
              <Row label="Late Payments" value={String(profile?.latePayments ?? 0)} colors={colors} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Row({ label, value, accent, colors }: { label: string; value: string; accent?: boolean; colors: any }) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
      <Text style={[styles.rowVal, { color: accent ? colors.primary : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  heading: { fontSize: 22, letterSpacing: 0.5 },
  scroll: { padding: 16, gap: 12 },
  balanceCard: { padding: 24, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, alignItems: "center" },
  balanceLabel: { fontSize: 10, letterSpacing: 1.5, marginBottom: 8 },
  balanceVal: { fontSize: 48, letterSpacing: -2 },
  actionBtn: {
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    gap: 8,
  },
  actionText: { fontSize: 13, letterSpacing: 1 },
  infoBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
  },
  infoText: { fontSize: 12, flex: 1, lineHeight: 17 },
  statsCard: { borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel: { fontSize: 13 },
  rowVal: { fontSize: 13 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, paddingTop: 80 },
  emptyText: { fontSize: 14, textAlign: "center" },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 4 },
  loginBtnText: { fontSize: 13, letterSpacing: 1 },
});
