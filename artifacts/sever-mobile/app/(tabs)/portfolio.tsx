import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import {
  useGetDashboardOverview,
  useListMyLendings,
  useListMyBorrowings,
} from "@workspace/api-client-react";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function StatCard({ label, value, accent, colors }: { label: string; value: string; accent?: boolean; colors: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.statVal, { color: accent ? colors.primary : colors.foreground, fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
    </View>
  );
}

function LoginGate({ colors, topPad }: { colors: any; topPad: number }) {
  const router = useRouter();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Portfolio</Text>
      </View>
      <View style={styles.centered}>
        <View style={[styles.gateIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="lock" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.gateTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Sign in to continue
        </Text>
        <Text style={[styles.gateText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          View your lending portfolio, returns, and borrowing history.
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

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const { data: overview, isLoading, refetch, isRefetching } = useGetDashboardOverview();
  const { data: lendings } = useListMyLendings();
  const { data: borrowings } = useListMyBorrowings();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) return <LoginGate colors={colors} topPad={topPad} />;

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Portfolio</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Portfolio</Text>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 100 : 110 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {overview && (
          <>
            <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.balanceLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                WALLET BALANCE
              </Text>
              <Text style={[styles.balanceVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {fmt(overview.walletBalance)}
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statsGrid}>
                <StatCard label="Total Lent" value={fmt(overview.totalLent)} accent colors={colors} />
                <StatCard label="Total Borrowed" value={fmt(overview.totalBorrowed)} colors={colors} />
                <StatCard label="Active Loans" value={String(overview.activeLending)} colors={colors} />
                <StatCard label="Portfolio Yield" value={`${overview.portfolioYield.toFixed(2)}%`} accent colors={colors} />
              </View>
            </View>

            {(lendings?.length ?? 0) > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  LENDING
                </Text>
                {lendings!.map((loan) => (
                  <TouchableOpacity
                    key={loan.id}
                    style={[styles.loanRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => router.push(`/loan/${loan.id}`)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.loanInfo}>
                      <Text style={[styles.loanTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
                        {loan.title}
                      </Text>
                      <Text style={[styles.loanSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {loan.borrowerName} · {loan.termMonths}mo
                      </Text>
                    </View>
                    <View style={styles.loanRight}>
                      <Text style={[styles.loanRate, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                        {loan.interestRate}%
                      </Text>
                      <Text style={[styles.loanStatus, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {loan.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {(borrowings?.length ?? 0) > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  BORROWING
                </Text>
                {borrowings!.map((loan) => (
                  <TouchableOpacity
                    key={loan.id}
                    style={[styles.loanRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => router.push(`/loan/${loan.id}`)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.loanInfo}>
                      <Text style={[styles.loanTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
                        {loan.title}
                      </Text>
                      <Text style={[styles.loanSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {loan.termMonths}mo · {fmt(loan.principal)}
                      </Text>
                    </View>
                    <Text style={[styles.loanStatus, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {loan.status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {!lendings?.length && !borrowings?.length && (
              <View style={styles.emptyPortfolio}>
                <View style={[styles.gateIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="trending-up" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.gateTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  No activity yet
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Browse markets to start lending and building returns.
                </Text>
                <TouchableOpacity
                  style={[styles.loginBtn, { backgroundColor: colors.primary }]}
                  onPress={() => router.push("/(tabs)")}
                >
                  <Text style={[styles.loginBtnText, { color: colors.primaryForeground, fontFamily: "Inter_700Bold" }]}>
                    BROWSE MARKETS
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const R = 14;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  heading: { fontSize: 24, letterSpacing: -0.3 },
  scroll: { padding: 16, gap: 10 },
  balanceCard: { padding: 22, borderRadius: R, borderWidth: 1, marginBottom: 4 },
  balanceLabel: { fontSize: 10, letterSpacing: 1.5, marginBottom: 6 },
  balanceVal: { fontSize: 44, letterSpacing: -1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 18 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { flex: 1, minWidth: "42%", padding: 12, borderRadius: R - 4, borderWidth: 1 },
  statVal: { fontSize: 18 },
  statLabel: { fontSize: 10, marginTop: 3 },
  sectionTitle: { fontSize: 10, letterSpacing: 1.5, marginTop: 10, marginBottom: 2 },
  loanRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: R,
    borderWidth: 1,
  },
  loanInfo: { flex: 1, gap: 4 },
  loanTitle: { fontSize: 14 },
  loanSub: { fontSize: 11 },
  loanRight: { alignItems: "flex-end", gap: 2 },
  loanRate: { fontSize: 16 },
  loanStatus: { fontSize: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 14, paddingHorizontal: 32 },
  gateIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  gateTitle: { fontSize: 20, letterSpacing: -0.2 },
  gateText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyPortfolio: { alignItems: "center", gap: 12, paddingTop: 48 },
  emptyText: { fontSize: 14, textAlign: "center", paddingHorizontal: 16, lineHeight: 20 },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: R, marginTop: 4 },
  loginBtnText: { fontSize: 13, letterSpacing: 0.5 },
});
