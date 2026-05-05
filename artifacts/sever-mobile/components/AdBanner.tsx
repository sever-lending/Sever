import React, { useEffect, useRef } from "react";
import { Platform, View, StyleSheet } from "react-native";
import { useGetMyProfile } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

const PUB = "ca-pub-2000477545504161";
const PREMIUM_TIERS = new Set(["gold", "platinum"]);

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdBanner() {
  const { user } = useAuth();
  const { data: profile } = useGetMyProfile();
  const didInject = useRef(false);

  const isPremium = !!profile?.tier && PREMIUM_TIERS.has(profile.tier as string);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (isPremium || didInject.current) return;
    didInject.current = true;

    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }

    requestAnimationFrame(() => {
      const el = document.getElementById("sever-mobile-ad");
      if (!el || el.querySelector("ins")) return;

      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.cssText = "display:block;width:100%;height:50px;";
      ins.setAttribute("data-ad-client", PUB);
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      el.appendChild(ins);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    });
  }, [isPremium]);

  if (Platform.OS !== "web") return null;
  if (isPremium) return null;

  return <View nativeID="sever-mobile-ad" style={styles.wrap} />;
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 84,
    left: 0,
    right: 0,
    height: 50,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
});
