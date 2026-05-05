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
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statVal, { color: accent ? colors.primary : colors.foreground, fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
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

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Portfolio</Text>
        </View>
        <View style={styles.centered}>
          <Feather name="lock" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Log in to view your portfolio
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

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
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
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Portfolio</Text>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 84 : 100 }]}
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
                <StatCard label="Active Lending" value={String(overview.activeLending)} colors={colors} />
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
                <Feather name="trending-up" size={36} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  No activity yet. Browse markets to start lending.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heading: { fontSize: 22, letterSpacing: 0.5 },
  scroll: { padding: 16, gap: 8 },
  balanceCard: { padding: 20, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  balanceLabel: { fontSize: 10, letterSpacing: 1.5, marginBottom: 4 },
  balanceVal: { fontSize: 42, letterSpacing: -1 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { flex: 1, minWidth: "42%", padding: 12, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth },
  statVal: { fontSize: 18 },
  statLabel: { fontSize: 10, marginTop: 2 },
  sectionTitle: { fontSize: 10, letterSpacing: 1.5, marginTop: 12, marginBottom: 4 },
  loanRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 6,
  },
  loanInfo: { flex: 1, gap: 3 },
  loanTitle: { fontSize: 14 },
  loanSub: { fontSize: 11 },
  loanRight: { alignItems: "flex-end", gap: 2 },
  loanRate: { fontSize: 16 },
  loanStatus: { fontSize: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  emptyText: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  emptyPortfolio: { alignItems: "center", gap: 12, paddingTop: 48 },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 4, marginTop: 4 },
  loginBtnText: { fontSize: 13, letterSpacing: 1 },
});
