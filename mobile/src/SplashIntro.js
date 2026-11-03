import React from "react";
import { Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "./ui";

export default function SplashIntro({ onLayout }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={["#1E1C17", "#080909", "#211A11"]}
      onLayout={onLayout}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          width: 210,
          height: 210,
          borderRadius: 105,
          alignItems: "center",
          justifyContent: "center",
          borderColor: "rgba(220,199,156,0.16)",
          borderWidth: 1,
          backgroundColor: "rgba(255,255,255,0.035)",
        }}
      >
        <View
          style={{
            width: 168,
            height: 168,
            borderRadius: 84,
            alignItems: "center",
            justifyContent: "center",
            borderColor: "rgba(220,199,156,0.42)",
            borderWidth: 1,
          }}
        >
          <Image
            source={require("../assets/splash-logo.png")}
            style={{ width: 132, height: 123 }}
            resizeMode="contain"
          />
        </View>
      </View>
      <Text
        style={{
          color: colors.goldBright,
          fontSize: 22,
          fontWeight: "900",
          letterSpacing: 2.5,
          marginTop: 30,
        }}
      >
        MON MIAM MIAM
      </Text>
      <Text
        style={{
          color: colors.muted,
          fontSize: 14,
          marginTop: 9,
          letterSpacing: 0.3,
        }}
      >
        Le climat du goût et de la détente
      </Text>
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 25,
          width: 56,
          height: 3,
          borderRadius: 2,
          backgroundColor: colors.gold,
        }}
      />
    </LinearGradient>
  );
}
