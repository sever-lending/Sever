import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useCreateLoanRequest } from "@workspace/api-client-react";

const PURPOSES = [
  "debt-consolidation", "home-improvement", "medical",
  "education", "business", "vehicle", "wedding", "vacation", "emergency", "other",
] as const;

type Purpose = typeof PURPOSES[number];

function purposeLabel(p: string) {
  return p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BorrowScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("other");
  const [description, setDescription] = useState("");

  const mutation = useCreateLoanRequest({
    mutation: {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Loan Posted!", "Your loan request is live and open for funding.", [
          { text: "View Markets", onPress: () => router.push("/") },
        ]);
        setTitle(""); setPrincipal(""); setRate(""); setTerm(""); setDescription("");
      },
      onError: (e: any) => {
        Alert.alert("Error", e?.error ?? "Failed to submit loan request.");
      },
    },
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const canSubmit =
    title.length >= 4 &&
    parseFloat(principal) >= 100 &&
    parseFloat(rate) >= 1 &&
    parseInt(term) >= 3 &&
    description.length >= 10;

  const handleSubmit = () => {
    if (!user) { router.push("/login"); return; }
    mutation.mutate({
      data: {
        title,
        principal: parseFloat(principal),
        interestRate: parseFloat(rate),
        termMonths: parseInt(term),
        purpose,
        description,
      },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {Platform.OS === "web" ? (
        <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Borrow</Text>
            <Text style={[styles.subheading, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Post a loan request to the marketplace
            </Text>
          </View>
        </View>
      ) : (
        <LinearGradient colors={["#0d1f17", colors.background]} style={[styles.headerGrad, { paddingTop: topPad + 14 }]}>
          <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Borrow</Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Post a loan request to the marketplace
          </Text>
          <View style={[styles.headerBorder, { backgroundColor: colors.border }]} />
        </LinearGradient>
      )}

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 130 : 150 }]}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(60)}>
        <Field label="LOAN TITLE" colors={colors}>
          <StyledInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Small business expansion"
            colors={colors}
          />
        </Field>
        </Animated.View>

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Field label="AMOUNT ($)" colors={colors}>
              <StyledInput
                value={principal}
                onChangeText={setPrincipal}
                placeholder="Min $100"
                keyboardType="decimal-pad"
                colors={colors}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="APR (%)" colors={colors}>
              <StyledInput
                value={rate}
                onChangeText={setRate}
                placeholder="e.g. 8.5"
                keyboardType="decimal-pad"
                colors={colors}
              />
            </Field>
          </View>
        </View>

        <Field label="TERM (MONTHS)" colors={colors}>
          <StyledInput
            value={term}
            onChangeText={setTerm}
            placeholder="e.g. 12"
            keyboardType="number-pad"
            colors={colors}
          />
        </Field>

        <Field label="PURPOSE" colors={colors}>
          <View style={styles.purposeGrid}>
            {PURPOSES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.purposeChip,
                  {
                    backgroundColor: purpose === p ? colors.primary + "20" : colors.card,
                    borderColor: purpose === p ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPurpose(p)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.purposeText,
                    {
                      color: purpose === p ? colors.primary : colors.mutedForeground,
                      fontFamily: purpose === p ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {purposeLabel(p)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="DESCRIPTION" colors={colors}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Explain how you'll use these funds and your repayment plan..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
            style={[
              styles.textarea,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          />
        </Field>

        <View style={[styles.feeNote, { backgroundColor: colors.accent, borderColor: colors.primary + "30" }]}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.feeText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Sever charges a{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>1.5% origination fee</Text>
            {" "}deducted from the disbursement upon full funding.{" "}
            <Text style={{ color: colors.primary }} onPress={() => router.push("/premium")}>
              Premium members pay only 1%.
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: canSubmit ? colors.primary : colors.muted,
              opacity: mutation.isPending ? 0.75 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || mutation.isPending}
          activeOpacity={0.8}
        >
          <Text style={[styles.submitText, {
            color: canSubmit ? colors.primaryForeground : colors.mutedForeground,
            fontFamily: "Inter_700Bold",
          }]}>
            {mutation.isPending ? "POSTING..." : user ? "POST LOAN REQUEST" : "SIGN IN TO BORROW"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const R = 14;

function Field({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
      {children}
    </View>
  );
}

function StyledInput({ colors, ...props }: any) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.mutedForeground}
      style={[styles.input, {
        backgroundColor: colors.card,
        borderColor: colors.border,
        color: colors.foreground,
        fontFamily: "Inter_400Regular",
      }]}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  headerGrad: { paddingHorizontal: 20, paddingBottom: 14 },
  headerBorder: { height: StyleSheet.hairlineWidth, marginTop: 14 },
  heading: { fontSize: 24, letterSpacing: -0.3 },
  subheading: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  scroll: { padding: 20, gap: 18 },
  twoCol: { flexDirection: "row", gap: 12 },
  field: { gap: 7 },
  fieldLabel: { fontSize: 10, letterSpacing: 1.2 },
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: R,
    borderWidth: 1,
    fontSize: 14,
  },
  textarea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: R,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
  },
  purposeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  purposeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: R,
    borderWidth: 1,
  },
  purposeText: { fontSize: 12 },
  feeNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: R,
    borderWidth: 1,
  },
  feeText: { fontSize: 13, flex: 1, lineHeight: 19 },
  submitBtn: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: R,
  },
  submitText: { fontSize: 14, letterSpacing: 0.5 },
});
