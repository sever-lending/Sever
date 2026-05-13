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
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useListLoans, useGetPlatformStats } from "@workspace/api-client-react";
import { AdBanner } from "@/components/AdBanner";

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
    unverified: "#555",
  };
  return <View style={[styles.tierDot, { backgroundColor: colorMap[tier] ?? "#555" }]} />;
}

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: loans, isLoading, refetch, isRefetching } = useListLoans({ status: "open" } as any);
  const { data: stats } = useGetPlatformStats();

  const topPad = Platform.OS === "web" ? 0 : insets.top;

  const renderLoan = useCallback(({ item, index }: { item: any; index: number }) => {
    const pct = item.principal > 0 ? (item.fundedAmount / item.principal) * 100 : 0;
    return (
      <Animated.View entering={FadeInDown.duration(400).delay(Math.min(index * 70, 500))}>
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
              <LinearGradient
                colors={[colors.primary + "cc", colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.min(pct, 100)}%` as any }]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {pct.toFixed(0)}% funded
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [colors, router]);

  const isWeb = Platform.OS === "web";
  const gradientColors = ["#0d1f17", colors.background] as const;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {isWeb ? (
        <View style={[styles.headerWeb, { paddingTop: topPad + 14, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <HeaderContent stats={stats} colors={colors} />
        </View>
      ) : (
        <LinearGradient
          colors={gradientColors}
          style={[styles.headerNative, { paddingTop: topPad + 14 }]}
        >
          <HeaderContent stats={stats} colors={colors} />
          <View style={[styles.headerBorder, { backgroundColor: colors.border }]} />
        </LinearGradient>
      )}

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
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 150 : 110 }]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          ListFooterComponent={<AdBanner />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>No open loans yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function HeaderContent({ stats, colors }: { stats: any; colors: any }) {
  return (
    <View style={styles.headerInner}>
      <View>
        <Text style={[styles.wordmark, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          SEVER<Text style={{ color: colors.primary }}>.</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Peer-to-peer lending</Text>
      </View>
      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <Text style={[styles.miniVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(stats.totalVolume)}</Text>
            <Text style={[styles.miniLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Volume</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.miniStat}>
            <Text style={[styles.miniVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{stats.activeLoans ?? 0}</Text>
            <Text style={[styles.miniLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Open</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const R = 14;

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWeb: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerNative: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerBorder: { height: StyleSheet.hairlineWidth, marginTop: 14 },
  wordmark: { fontSize: 22, letterSpacing: 3 },
  subtitle: { fontSize: 11, marginTop: 2 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statDivider: { width: 1, height: 24 },
  miniStat: { alignItems: "flex-end" },
  miniVal: { fontSize: 17 },
  miniLabel: { fontSize: 10, marginTop: 1 },
  list: { padding: 16, gap: 10 },
  card: {
    padding: 16,
    borderRadius: R,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLeft: { flex: 1, gap: 5 },
  cardRight: { alignItems: "flex-end" },
  borrowerRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  tierDot: { width: 7, height: 7, borderRadius: 4 },
  borrowerName: { fontSize: 12 },
  score: { fontSize: 12 },
  loanTitle: { fontSize: 15, lineHeight: 20 },
  rate: { fontSize: 24 },
  rateLabel: { fontSize: 10 },
  cardMid: { flexDirection: "row", alignItems: "center", gap: 16 },
  stat: { gap: 2 },
  statVal: { fontSize: 14 },
  statLabel: { fontSize: 10 },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: "auto",
  },
  badgeText: { fontSize: 10 },
  progressRow: { gap: 5 },
  progressTrack: { height: 5, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 4 },
  progressLabel: { fontSize: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 14 },
});
