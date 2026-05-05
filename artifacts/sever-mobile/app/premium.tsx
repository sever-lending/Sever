import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const BENEFITS = [
  {
    icon: "percent" as const,
    title: "Lower Origination Fee",
    desc: "1% fee instead of 1.5% — save more on every loan you fund or take.",
  },
  {
    icon: "zap" as const,
    title: "Priority Loan Access",
    desc: "See high-yield opportunities before standard members and fund first.",
  },
  {
    icon: "bar-chart-2" as const,
    title: "Advanced Analytics",
    desc: "Portfolio performance graphs, yield curves, and risk breakdowns.",
  },
  {
    icon: "arrow-up-circle" as const,
    title: "Higher Funding Limits",
    desc: "Fund up to $50,000 per loan vs $10,000 on the standard plan.",
  },
  {
    icon: "star" as const,
    title: "Premium Badge",
    desc: "Stand out as a verified premium member — builds trust with borrowers.",
  },
  {
    icon: "eye-off" as const,
    title: "Ad-Free Experience",
    desc: "Zero ads across the entire app, on every screen.",
  },
];

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}`;

export default function PremiumScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 32 : insets.bottom + 24;

  const handleSubscribe = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/stripe/subscription-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: "premium_monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        Linking.openURL(data.url);
      } else {
        Linking.openURL(`${BASE_URL}/premium`);
      }
    } catch {
      Linking.openURL(`${BASE_URL}/premium`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Sever Premium</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
          <View style={[styles.crownBadge, { backgroundColor: colors.primary }]}>
            <Feather name="star" size={22} color={colors.primaryForeground} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Unlock Premium
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Everything you need to maximize returns and minimize fees.
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>$9.99</Text>
            <Text style={[styles.pricePer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}> / month</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          WHAT YOU GET
        </Text>

        {BENEFITS.map((b, i) => (
          <View
            key={i}
            style={[styles.benefitCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + "20" }]}>
              <Feather name={b.icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {b.title}
              </Text>
              <Text style={[styles.benefitDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {b.desc}
              </Text>
            </View>
          </View>
        ))}

        <View style={[styles.compareCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.compareHeader}>
            <Text style={[styles.compareCol, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Feature</Text>
            <Text style={[styles.compareCol, { color: colors.mutedForeground, fontFamily: "Inter_500Medium", textAlign: "center" }]}>Free</Text>
            <Text style={[styles.compareCol, { color: colors.primary, fontFamily: "Inter_700Bold", textAlign: "center" }]}>Premium</Text>
          </View>
          {[
            ["Origination Fee", "1.5%", "1.0%"],
            ["Max per Loan", "$10K", "$50K"],
            ["Priority Access", "✗", "✓"],
            ["Analytics", "Basic", "Advanced"],
            ["Ads", "Yes", "No"],
          ].map(([feat, free, prem]) => (
            <View key={feat} style={[styles.compareRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.compareCol, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{feat}</Text>
              <Text style={[styles.compareCol, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }]}>{free}</Text>
              <Text style={[styles.compareCol, { color: colors.primary, fontFamily: "Inter_600SemiBold", textAlign: "center" }]}>{prem}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.subscribeBtn, { backgroundColor: colors.primary, opacity: loading ? 0.75 : 1 }]}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Feather name="star" size={18} color={colors.primaryForeground} />
          <Text style={[styles.subscribeBtnText, { color: colors.primaryForeground, fontFamily: "Inter_700Bold" }]}>
            {loading ? "LOADING..." : "START PREMIUM — $9.99/mo"}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.fine, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Cancel anytime. No hidden fees. Billed monthly via Stripe.
        </Text>
      </ScrollView>
    </View>
  );
}

const R = 14;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heading: { fontSize: 18, letterSpacing: 0.3 },
  scroll: { padding: 16, gap: 12 },
  heroCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: R,
    borderWidth: 1,
    gap: 8,
    marginBottom: 4,
  },
  crownBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  heroTitle: { fontSize: 26, letterSpacing: -0.3 },
  heroSub: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 6 },
  price: { fontSize: 42, letterSpacing: -1 },
  pricePer: { fontSize: 16 },
  sectionTitle: { fontSize: 11, letterSpacing: 1.5, marginTop: 4, marginBottom: 2 },
  benefitCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: R,
    borderWidth: 1,
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  benefitText: { flex: 1, gap: 3 },
  benefitTitle: { fontSize: 15 },
  benefitDesc: { fontSize: 12, lineHeight: 18 },
  compareCard: { borderRadius: R, borderWidth: 1, overflow: "hidden", marginTop: 4 },
  compareHeader: { flexDirection: "row", padding: 12, gap: 4 },
  compareCol: { flex: 1, fontSize: 12 },
  compareRow: { flexDirection: "row", padding: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  subscribeBtn: {
    flexDirection: "row",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderRadius: R,
    marginTop: 8,
  },
  subscribeBtnText: { fontSize: 14, letterSpacing: 0.5 },
  fine: { fontSize: 11, textAlign: "center", lineHeight: 16 },
});
