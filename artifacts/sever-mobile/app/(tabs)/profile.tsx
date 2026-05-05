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
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetMyProfile } from "@workspace/api-client-react";

const TIER_COLORS: Record<string, string> = {
  platinum: "#E5E4E2",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  unverified: "#666",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: profile, isLoading } = useGetMyProfile();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Profile</Text>
        </View>
        <View style={styles.centered}>
          <Feather name="user" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Log in to view your profile
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
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Profile</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  const tier = profile?.tier ?? "unverified";
  const tierColor = TIER_COLORS[tier] ?? "#666";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Profile</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 84 : 100 }]}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.avatarInitial, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                {(profile?.displayName ?? user.firstName ?? "?")[0].toUpperCase()}
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
        </View>

        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
        </View>

        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="shield" label="KYC Verification" onPress={() => {}} colors={colors} />
          <MenuItem icon="trending-up" label="My Loans" onPress={() => {}} colors={colors} />
          <MenuItem icon="bell" label="Notifications" onPress={() => {}} colors={colors} last />
        </View>

        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem icon="file-text" label="Terms of Service" onPress={() => {}} colors={colors} />
          <MenuItem icon="lock" label="Privacy Policy" onPress={() => {}} colors={colors} />
          <MenuItem icon="alert-triangle" label="Disclaimer" onPress={() => {}} colors={colors} last />
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.destructive + "40" }]}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function MenuItem({ icon, label, onPress, colors, last }: {
  icon: any; label: string; onPress: () => void; colors: any; last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Feather name={icon} size={16} color={colors.mutedForeground} />
      <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
      <Feather name="chevron-right" size={14} color={colors.mutedForeground} style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  heading: { fontSize: 22, letterSpacing: 0.5 },
  scroll: { padding: 16, gap: 12 },
  profileCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: 6 },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  avatarInitial: { fontSize: 28 },
  displayName: { fontSize: 20 },
  email: { fontSize: 13 },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  tierDot: { width: 6, height: 6, borderRadius: 3 },
  tierText: { fontSize: 10, letterSpacing: 1 },
  scoreCard: {
    padding: 20,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    gap: 6,
  },
  scoreLabel: { fontSize: 10, letterSpacing: 1.5 },
  scoreVal: { fontSize: 48, letterSpacing: -2 },
  scoreBar: { height: 4, width: "100%", borderRadius: 2, overflow: "hidden" },
  scoreBarFill: { height: 4, borderRadius: 2 },
  scoreSubtitle: { fontSize: 11 },
  menuCard: { borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  menuLabel: { fontSize: 14 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  emptyText: { fontSize: 14 },
  loginBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 4 },
  loginBtnText: { fontSize: 13, letterSpacing: 1 },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutText: { fontSize: 14 },
});
