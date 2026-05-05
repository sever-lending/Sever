import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useListLoans, useGetPlatformStats } from "@workspace/api-client-react";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function PurposeBadge({ purpose, colors }: { purpose: string; colors: any }) {
  const label = purpose.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <View style={[styles.badge, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
      <Text style={[styles.badgeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{label}</Text>
    </View>
  );
}

function TierDot({ tier, colors }: { tier: string; colors: any }) {
  const colorMap: Record<string, string> = {
    platinum: "#E5E4E2",
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    unverified: "#666",
  };
  return <View style={[styles.tierDot, { backgroundColor: colorMap[tier] ?? "#666" }]} />;
}

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: loans, isLoading, refetch, isRefetching } = useListLoans({ status: "open" } as any);
  const { data: stats } = useGetPlatformStats();

  const renderLoan = useCallback(({ item }: { item: any }) => {
    const pct = item.principal > 0 ? (item.fundedAmount / item.principal) * 100 : 0;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/loan/${item.id}`)}
        activeOpacity={0.75}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <View style={styles.borrowerRow}>
              <TierDot tier={item.borrowerTier} colors={colors} />
              <Text style={[styles.borrowerName, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                {item.borrowerName}
              </Text>
              <Text style={[styles.score, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                · {item.borrowerTrustScore}
              </Text>
            </View>
            <Text style={[styles.loanTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={[styles.rate, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {item.interestRate}%
            </Text>
            <Text style={[styles.rateLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              APR
            </Text>
          </View>
        </View>

        <View style={styles.cardMid}>
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {fmt(item.principal)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Principal
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {item.termMonths}mo
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Term
            </Text>
          </View>
          <PurposeBadge purpose={item.purpose} colors={colors} />
        </View>

        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${Math.min(pct, 100)}%` as any }]} />
          </View>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {pct.toFixed(0)}% funded
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [colors, router]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.wordmark, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>SEVER.</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Peer-to-peer lending</Text>
        </View>
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <Text style={[styles.miniVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(stats.totalVolume)}</Text>
              <Text style={[styles.miniLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Volume</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={[styles.miniVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{stats.openLoans}</Text>
              <Text style={[styles.miniLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Open</Text>
            </View>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={loans ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderLoan}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 84 : 100 }]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>No open loans</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordmark: { fontSize: 22, letterSpacing: 2 },
  subtitle: { fontSize: 11, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 16 },
  miniStat: { alignItems: "flex-end" },
  miniVal: { fontSize: 16 },
  miniLabel: { fontSize: 10, marginTop: 1 },
  list: { padding: 16, gap: 12 },
  card: {
    padding: 16,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLeft: { flex: 1, gap: 4 },
  cardRight: { alignItems: "flex-end" },
  borrowerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  tierDot: { width: 6, height: 6, borderRadius: 3 },
  borrowerName: { fontSize: 12 },
  score: { fontSize: 12 },
  loanTitle: { fontSize: 15 },
  rate: { fontSize: 22 },
  rateLabel: { fontSize: 10 },
  cardMid: { flexDirection: "row", alignItems: "center", gap: 16 },
  stat: { gap: 1 },
  statVal: { fontSize: 14 },
  statLabel: { fontSize: 10 },
  badge: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: "auto",
  },
  badgeText: { fontSize: 10 },
  progressRow: { gap: 4 },
  progressTrack: { height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, borderRadius: 2 },
  progressLabel: { fontSize: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 14 },
});
