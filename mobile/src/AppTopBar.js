import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, Icon } from "./ui";

export default function AppTopBar({
  unreadCount,
  onHome,
  onSearch,
  onNotifications,
  blurTarget,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: insets.top + 10,
        left: 16,
        right: 16,
        zIndex: 20,
        borderRadius: 24,
        shadowColor: "#000000",
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 12,
      }}
    >
      <BlurView
        intensity={82}
        tint="dark"
        blurMethod="dimezisBlurViewSdk31Plus"
        blurTarget={blurTarget}
        style={{
          height: 62,
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(240,219,174,0.38)",
          backgroundColor: "rgba(26,27,26,0.42)",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 9,
          gap: 9,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 1,
            left: 20,
            right: 20,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.24)",
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Accueil Mon Miam Miam"
          onPress={onHome}
          style={{
            width: 46,
            height: 46,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/splash-logo.png")}
            style={{ width: 44, height: 42 }}
            resizeMode="contain"
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rechercher un plat"
          onPress={onSearch}
          style={{
            flex: 1,
            minWidth: 0,
            height: 39,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "rgba(240,219,174,0.24)",
            backgroundColor: "rgba(255,255,255,0.09)",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 11,
          }}
        >
          <Icon name="search-outline" size={18} color={colors.gold} />
          <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 13 }}>
            Rechercher un plat
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Notifications, ${unreadCount} non lues`}
          onPress={onNotifications}
          style={{
            width: 43,
            height: 43,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="notifications-outline"
            size={23}
            color={colors.goldBright}
          />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 2,
                right: 0,
                minWidth: 18,
                height: 18,
                paddingHorizontal: 3,
                borderRadius: 9,
                backgroundColor: colors.gold,
                borderWidth: 1,
                borderColor: colors.bg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: "#211B12", fontSize: 10, fontWeight: "900" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </BlurView>
    </View>
  );
}
