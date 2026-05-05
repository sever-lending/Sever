import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetLoan, useFundLoan } from "@workspace/api-client-react";

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const { data: loan, isLoading, refetch } = useGetLoan(id!);
  const [fundAmount, setFundAmount] = useState("");

  const mutation = useFundLoan({
    mutation: {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Funded!", "Your contribution has been recorded.");
        setFundAmount("");
        refetch();
      },
      onError: (e: any) => {
        Alert.alert("Error", e?.error ?? "Failed to fund loan.");
      },
    },
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading || !loan) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.navBar, { paddingTop: topPad + 4, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  const pct = loan.principal > 0 ? (loan.fundedAmount / loan.principal) * 100 : 0;
  const isOpen = loan.status === "open";
  const canFund = user && isOpen && parseFloat(fundAmount) >= 25;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.navBar, { paddingTop: topPad + 4, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
          Loan Details
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 }]}
      >
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {loan.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {loan.borrowerName}
          </Text>
          <View style={[styles.statusBadge, {
            backgroundColor: isOpen ? colors.primary + "20" : colors.muted,
            borderColor: isOpen ? colors.primary + "40" : colors.border,
          }]}>
            <Text style={[styles.statusText, {
              color: isOpen ? colors.primary : colors.mutedForeground,
              fontFamily: "Inter_500Medium",
            }]}>
              {loan.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.statsGrid, { borderColor: colors.border }]}>
          <StatBox label="Principal" value={fmt(loan.principal)} colors={colors} accent />
          <StatBox label="APR" value={`${loan.interestRate}%`} colors={colors} accent />
          <StatBox label="Term" value={`${loan.termMonths}mo`} colors={colors} />
          <StatBox label="Monthly" value={fmt(loan.monthlyPayment)} colors={colors} />
          <StatBox label="Origination" value={fmt(loan.originationFee)} colors={colors} />
          <StatBox label="Total Repay" value={fmt(loan.totalRepayment)} colors={colors} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              FUNDING PROGRESS
            </Text>
            <Text style={[styles.progressPct, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {pct.toFixed(0)}%
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${Math.min(pct, 100)}%` as any }]} />
          </View>
          <Text style={[styles.progressSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {fmt(loan.fundedAmount)} of {fmt(loan.principal)} raised
          </Text>
        </View>

        {loan.description && (
          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.descLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              DESCRIPTION
            </Text>
            <Text style={[styles.descText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
              {loan.description}
            </Text>
          </View>
        )}

        {isOpen && (
          <View style={[styles.fundCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.fundLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              FUND THIS LOAN
            </Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Text style={[styles.dollar, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>$</Text>
              <TextInput
                value={fundAmount}
                onChangeText={setFundAmount}
                keyboardType="decimal-pad"
                placeholder="Min $25"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.fundInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              />
            </View>
            <TouchableOpacity
              style={[styles.fundBtn, { backgroundColor: canFund ? colors.primary : colors.muted }]}
              onPress={() => {
                if (!user) { router.push("/login"); return; }
                mutation.mutate({ id: loan.id, data: { amount: parseFloat(fundAmount) } });
              }}
              disabled={!canFund || mutation.isPending}
              activeOpacity={0.8}
            >
              <Text style={[styles.fundBtnText, {
                color: canFund ? colors.primaryForeground : colors.mutedForeground,
                fontFamily: "Inter_700Bold",
              }]}>
                {mutation.isPending ? "PROCESSING..." : user ? "FUND NOW" : "LOG IN TO FUND"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loan.fundings.length > 0 && (
          <View style={[styles.fundersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.fundLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              FUNDERS ({loan.fundings.length})
            </Text>
            {loan.fundings.map((f) => (
              <View key={f.id} style={[styles.funderRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.funderName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {f.lenderName}
                </Text>
                <Text style={[styles.funderAmt, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  {fmt(f.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value, accent, colors }: { label: string; value: string; accent?: boolean; colors: any }) {
  return (
    <View style={[styles.statBox, { borderColor: colors.border }]}>
      <Text style={[styles.statVal, { color: accent ? colors.primary : colors.foreground, fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navTitle: { fontSize: 15, flex: 1, textAlign: "center", marginHorizontal: 12 },
  scroll: { padding: 16, gap: 16 },
  title: { fontSize: 22, lineHeight: 28 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaText: { fontSize: 13 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusText: { fontSize: 10, letterSpacing: 0.5 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    overflow: "hidden",
  },
  statBox: { width: "33.33%", padding: 14, borderRightWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  statVal: { fontSize: 15 },
  statLabel: { fontSize: 10, marginTop: 2 },
  progressSection: { gap: 6 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 10, letterSpacing: 1 },
  progressPct: { fontSize: 14 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressSub: { fontSize: 11 },
  descCard: { padding: 16, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, gap: 8 },
  descLabel: { fontSize: 10, letterSpacing: 1 },
  descText: { fontSize: 14, lineHeight: 20 },
  fundCard: { padding: 16, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, gap: 12 },
  fundLabel: { fontSize: 10, letterSpacing: 1 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 44,
  },
  dollar: { fontSize: 16, marginRight: 4 },
  fundInput: { flex: 1, fontSize: 16, height: 44 },
  fundBtn: { height: 48, justifyContent: "center", alignItems: "center", borderRadius: 4 },
  fundBtnText: { fontSize: 13, letterSpacing: 1 },
  fundersCard: { padding: 16, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, gap: 8 },
  funderRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  funderName: { fontSize: 13 },
  funderAmt: { fontSize: 13 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
