import React, { useEffect, useRef } from "react";
import { Platform, View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useGetMyProfile } from "@workspace/api-client-react";

const ADSENSE_PUB = "ca-pub-2000477545504161";
const ADMOB_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-9740722424629290/7684812262";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

function NativeBanner({ isPremium }: { isPremium: boolean }) {
  if (isPremium) return null;
  return (
    <View style={styles.nativeWrap}>
      <BannerAd
        unitId={ADMOB_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

function WebBanner({ isPremium }: { isPremium: boolean }) {
  const didInject = useRef(false);

  useEffect(() => {
    if (isPremium || didInject.current) return;
    didInject.current = true;

    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }

    requestAnimationFrame(() => {
      const el = document.getElementById("sever-mobile-ad");
      if (!el || el.querySelector("ins")) return;

      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.cssText = "display:block;width:100%;height:50px;";
      ins.setAttribute("data-ad-client", ADSENSE_PUB);
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      el.appendChild(ins);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    });
  }, [isPremium]);

  if (isPremium) return null;
  return <View nativeID="sever-mobile-ad" style={styles.webWrap} />;
}

export function AdBanner() {
  const { data: profile } = useGetMyProfile();
  const isPremium = !!(profile as any)?.isPremium;

  if (Platform.OS === "web") return <WebBanner isPremium={isPremium} />;
  return <NativeBanner isPremium={isPremium} />;
}

const styles = StyleSheet.create({
  nativeWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  webWrap: {
    position: "absolute",
    bottom: 84,
    left: 0,
    right: 0,
    height: 50,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
});
