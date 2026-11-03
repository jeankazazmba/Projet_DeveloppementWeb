import React, { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, Icon } from "./ui";

const SIZE = 62;
const MARGIN = 12;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function FloatingCart({ count, hasTabs, hidden, onOpen }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bounds = {
    minX: MARGIN,
    maxX: Math.max(MARGIN, width - SIZE - MARGIN),
    minY: insets.top + MARGIN,
    maxY: Math.max(
      insets.top + MARGIN,
      height - insets.bottom - SIZE - (hasTabs ? 92 : 20),
    ),
  };
  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;
  const initial = useRef({ x: bounds.maxX, y: bounds.maxY });
  const positionRef = useRef(initial.current);
  const startRef = useRef(initial.current);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const position = useRef(new Animated.ValueXY(initial.current)).current;

  useEffect(() => {
    const next = {
      x: clamp(
        positionRef.current.x,
        boundsRef.current.minX,
        boundsRef.current.maxX,
      ),
      y: clamp(
        positionRef.current.y,
        boundsRef.current.minY,
        boundsRef.current.maxY,
      ),
    };
    positionRef.current = next;
    position.setValue(next);
  }, [width, height, insets.top, insets.bottom, hasTabs, position]);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = positionRef.current;
      },
      onPanResponderMove: (_, gesture) => {
        const next = {
          x: clamp(
            startRef.current.x + gesture.dx,
            boundsRef.current.minX,
            boundsRef.current.maxX,
          ),
          y: clamp(
            startRef.current.y + gesture.dy,
            boundsRef.current.minY,
            boundsRef.current.maxY,
          ),
        };
        positionRef.current = next;
        position.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.hypot(gesture.dx, gesture.dy) < 7) onOpenRef.current();
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  if (hidden) return null;

  return (
    <Animated.View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}
      accessibilityHint="Touchez pour ouvrir le panier ou glissez pour déplacer le bouton"
      onAccessibilityTap={() => onOpenRef.current()}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 30,
        width: SIZE,
        height: SIZE,
        transform: position.getTranslateTransform(),
      }}
    >
      <LinearGradient
        colors={["#F0DBAE", "#BC9F6F"]}
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#F5E4BD",
          shadowColor: colors.gold,
          shadowOpacity: 0.28,
          shadowRadius: 14,
          elevation: 8,
        }}
      >
        <Icon name="cart-outline" size={28} color="#251E14" />
        <View
          style={{
            position: "absolute",
            bottom: 5,
            width: 15,
            height: 2,
            borderRadius: 1,
            backgroundColor: "rgba(37,30,20,0.38)",
          }}
        />
      </LinearGradient>
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            top: -7,
            right: -7,
            minWidth: 23,
            height: 23,
            paddingHorizontal: 5,
            borderRadius: 12,
            backgroundColor: "#24201A",
            borderWidth: 1,
            borderColor: colors.gold,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.goldBright,
              fontSize: 11,
              fontWeight: "900",
            }}
          >
            {count}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
