import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetMyProfile } from "@workspace/api-client-react";

const TIER_COLORS: Record<string, string> = {
  platinum: "#E5E4E2",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  unverified: "#71717a",
};

function LoginGate({ colors, topPad }: { colors: any; topPad: number }) {
  const router = useRouter();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Profile</Text>
      </View>
      <View style={styles.centered}>
        <View style={[styles.gateIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="user" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.gateTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Your profile awaits
        </Text>
        <Text style={[styles.gateText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Sign in to manage your account, view your trust score, and track your activity.
        </Text>
        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/login")}
        >
          <Feather name="log-in" size={16} color={colors.primaryForeground} />
          <Text style={[styles.loginBtnText, { color: colors.primaryForeground, fontFamily: "Inter_700Bold" }]}>
            SIGN IN
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: profile, isLoading } = useGetMyProfile();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) return <LoginGate colors={colors} topPad={topPad} />;

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Profile</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  const tier = profile?.tier ?? "unverified";
  const tierColor = TIER_COLORS[tier] ?? "#71717a";
  const initials = (profile?.displayName ?? user.firstName ?? "?")[0].toUpperCase();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {Platform.OS === "web" ? (
        <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Profile</Text>
        </View>
      ) : (
        <LinearGradient colors={["#0d1f17", colors.background]} style={[styles.headerGrad, { paddingTop: topPad + 14 }]}>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Profile</Text>
          <View style={[styles.headerBorder, { backgroundColor: colors.border }]} />
        </LinearGradient>
      )}

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 100 : 110 }]}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(60)} style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + "25" }]}>
              <Text style={[styles.avatarInitial, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                {initials}
              </Text>
            </View>
          )}
          <Text style={[styles.displayName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {profile?.displayName ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
          </Text>
          <Text style={[styles.email, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {user.email}
          </Text>
          <View style={[styles.tierBadge, { backgroundColor: tierColor + "20", borderColor: tierColor + "50" }]}>
            <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
            <Text style={[styles.tierText, { color: tierColor, fontFamily: "Inter_600SemiBold" }]}>
              {tier.toUpperCase()}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(130)} style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            TRUST SCORE
          </Text>
          <Text style={[styles.scoreVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
            {profile?.trustScore ?? 0}
          </Text>
          <View style={[styles.scoreBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.scoreBarFill,
                { backgroundColor: colors.primary, width: `${((profile?.trustScore ?? 0) / 1000) * 100}%` as any },
              ]}
            />
          </View>
          <Text style={[styles.scoreSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            out of 1000
          </Text>
        </Animated.View>

        <TouchableOpacity
          style={[styles.premiumBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "50" }]}
          onPress={() => router.push("/premium")}
          activeOpacity={0.8}
        >
          <View style={[styles.premiumIcon, { backgroundColor: colors.primary }]}>
            <Feather name="star" size={14} color={colors.primaryForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.premiumTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              Upgrade to Premium
            </Text>
            <Text style={[styles.premiumSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Lower fees, higher limits, advanced analytics — $9.99/mo
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>

        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="shield" label="KYC Verification" onPress={() => {}} colors={colors} />
          <MenuItem icon="trending-up" label="My Loans" onPress={() => router.push("/(tabs)/portfolio")} colors={colors} />
          <MenuItem icon="bell" label="Notifications" onPress={() => {}} colors={colors} last />
        </View>

        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="file-text" label="Terms of Service" onPress={() => {}} colors={colors} />
          <MenuItem icon="lock" label="Privacy Policy" onPress={() => {}} colors={colors} />
          <MenuItem icon="alert-triangle" label="Risk Disclaimer" onPress={() => {}} colors={colors} last />
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Sever v1.0.0 · Your money. Your terms. No banks.
        </Text>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label, onPress, colors, last }: {
  icon: any; label: string; onPress: () => void; colors: any; last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: colors.background }]}>
        <Feather name={icon} size={15} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
      <Feather name="chevron-right" size={14} color={colors.mutedForeground} style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );
}

const R = 14;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerGrad: { paddingHorizontal: 20, paddingBottom: 14 },
  headerBorder: { height: StyleSheet.hairlineWidth, marginTop: 14 },
  heading: { fontSize: 24, letterSpacing: -0.3 },
  scroll: { padding: 16, gap: 12 },
  profileCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: R,
    borderWidth: 1,
    gap: 6,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarInitial: { fontSize: 32 },
  displayName: { fontSize: 22, letterSpacing: -0.2 },
  email: { fontSize: 13 },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  tierDot: { width: 7, height: 7, borderRadius: 4 },
  tierText: { fontSize: 10, letterSpacing: 1 },
  scoreCard: {
    padding: 22,
    borderRadius: R,
    borderWidth: 1,
    alignItems: "center",
    gap: 7,
  },
  scoreLabel: { fontSize: 10, letterSpacing: 1.5 },
  scoreVal: { fontSize: 52, letterSpacing: -2 },
  scoreBar: { height: 6, width: "100%", borderRadius: 4, overflow: "hidden" },
  scoreBarFill: { height: 6, borderRadius: 4 },
  scoreSubtitle: { fontSize: 11 },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: R,
    borderWidth: 1,
  },
  premiumIcon: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  premiumTitle: { fontSize: 14 },
  premiumSub: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  menuCard: { borderRadius: R, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15 },
  menuIconWrap: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  menuLabel: { fontSize: 14 },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    height: 52,
    borderRadius: R,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutText: { fontSize: 14 },
  version: { fontSize: 11, textAlign: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 14, paddingHorizontal: 32 },
  gateIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  gateTitle: { fontSize: 20, letterSpacing: -0.2 },
  gateText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  loginBtn: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: R,
    marginTop: 4,
    alignItems: "center",
  },
  loginBtnText: { fontSize: 13, letterSpacing: 0.5 },
});
