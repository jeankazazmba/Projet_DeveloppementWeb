import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const colors = {
  bg: "#0B0C0D",
  panel: "#171818",
  gold: "#DCC79C",
  goldBright: "#F0DBAE",
  text: "#F6F3EB",
  muted: "#A7A6A1",
  green: "#89C9A2",
  red: "#E4A5A0",
};

export function Icon({ name, size = 21, color = colors.gold }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function Glass({ children, style, onPress }) {
  const content = <View style={[styles.glass, style]}>{children}</View>;
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  disabled,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === "primary" ? styles.primary : styles.secondary,
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={18}
          color={variant === "primary" ? "#242016" : colors.gold}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          { color: variant === "primary" ? "#242016" : colors.gold },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  multiline,
  autoCapitalize,
  autoFocus,
  right,
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.fieldRow}>
        <TextInput
          style={[
            styles.input,
            multiline && { minHeight: 90, textAlignVertical: "top" },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#777974"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
        />
        {right}
      </View>
    </View>
  );
}

export function Pill({ title, active, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(active) }}
      style={[styles.pill, active && styles.pillActive]}
    >
      {icon && (
        <Icon name={icon} size={15} color={active ? "#252118" : colors.muted} />
      )}
      <Text
        style={{
          color: active ? "#252118" : colors.muted,
          fontSize: 13,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={styles.link}>{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}

export function Page({
  title,
  subtitle,
  children,
  onBack,
  right,
  noHeader = false,
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#151816", "#0B0C0D", "#12100E"]}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.page,
            {
              paddingTop: noHeader
                ? Math.max(insets.top + 16, 28)
                : insets.top + 92,
              paddingBottom: 120 + insets.bottom,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!noHeader && (
            <View style={styles.header}>
              {onBack && (
                <Pressable onPress={onBack} style={styles.back}>
                  <Icon name="arrow-back" color={colors.text} />
                </Pressable>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>MON MIAM MIAM · ÉTUDIANT</Text>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
              {right}
            </View>
          )}
          {children}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

export function FoodCard({ dish, onPress, onAdd, compact = false }) {
  const unavailable = dish.available === false;
  return (
    <Glass style={[styles.foodCard, compact && styles.foodCardCompact]}>
      <View style={!compact && styles.foodCardRow}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Voir ${dish.name}`}
          style={compact ? styles.foodPhotoCompact : styles.foodPhotoRow}
        >
          <Image
            source={dish.image}
            style={[styles.foodImage, compact && styles.foodImageCompact, unavailable && { opacity: 0.42 }]}
            resizeMode="cover"
          />
          {dish.rating && (
            <View style={styles.foodRating}>
              <Icon name="star" size={11} color={colors.goldBright} />
              <Text style={styles.foodRatingText}>{dish.rating}</Text>
            </View>
          )}
          {unavailable && (
            <View style={styles.foodUnavailable}>
              <Text style={styles.foodUnavailableText}>ÉPUISÉ</Text>
            </View>
          )}
        </Pressable>
        <View style={[styles.foodBody, compact && styles.foodBodyCompact]}>
          <Pressable
            onPress={onPress}
            style={{ flex: 1 }}
            accessibilityRole="button"
            accessibilityLabel={`Détails de ${dish.name}`}
          >
            <Text style={styles.foodCategory}>{dish.category.toUpperCase()}</Text>
            <Text style={styles.foodName} numberOfLines={2}>{dish.name}</Text>
            {!compact && (
              <Text style={styles.foodDescription} numberOfLines={2}>
                {dish.description}
              </Text>
            )}
          </Pressable>
          <View style={styles.foodFooter}>
            <Text style={styles.foodPrice}>
              {dish.price.toLocaleString("fr-FR")} FCFA
            </Text>
            <Pressable
              onPress={onAdd}
              disabled={unavailable}
              accessibilityRole="button"
              accessibilityLabel={unavailable
                ? `${dish.name} indisponible`
                : `Ajouter ${dish.name} au panier`}
              style={[styles.add, unavailable && styles.addDisabled]}
            >
              <Icon name={unavailable ? "close" : "add"} size={21} color="#211B11" />
            </Pressable>
          </View>
        </View>
      </View>
    </Glass>
  );
}

export const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 120,
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 25,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#3B3931",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 35,
  },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
  glass: {
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: "rgba(236,217,177,0.20)",
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  button: {
    minHeight: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: colors.gold },
  secondary: {
    borderWidth: 1,
    borderColor: "#6C604A",
    backgroundColor: "rgba(220,199,156,0.06)",
  },
  buttonText: { fontSize: 15, fontWeight: "800" },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  fieldRow: {
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "#34332E",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 14,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  pill: {
    paddingHorizontal: 14,
    height: 35,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#49453B",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginRight: 7,
    marginBottom: 7,
  },
  pillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
    marginTop: 22,
  },
  sectionTitle: { color: colors.text, fontWeight: "800", fontSize: 18 },
  link: { color: colors.gold, fontSize: 13, fontWeight: "700" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodCard: { marginBottom: 12, borderRadius: 20 },
  foodCardCompact: { width: 220, marginRight: 12 },
  foodCardRow: { flexDirection: "row", minHeight: 156 },
  foodPhotoRow: { width: 112, height: 156 },
  foodPhotoCompact: { height: 142 },
  foodImage: { width: "100%", height: 156 },
  foodImageCompact: { height: 142 },
  foodRating: {
    position: "absolute", bottom: 8, left: 8, flexDirection: "row",
    alignItems: "center", gap: 3, backgroundColor: "rgba(10,10,10,0.85)",
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4,
  },
  foodRatingText: { color: colors.goldBright, fontSize: 11, fontWeight: "800" },
  foodUnavailable: {
    position: "absolute", top: 8, left: 7, backgroundColor: "rgba(16,16,16,0.88)",
    borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4,
  },
  foodUnavailableText: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  foodBody: { flex: 1, minWidth: 0, padding: 12, justifyContent: "space-between" },
  foodBodyCompact: { flex: 0, minHeight: 116 },
  foodCategory: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  foodName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 5,
  },
  foodDescription: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  foodFooter: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 4, marginTop: 8 },
  foodPrice: {
    color: colors.goldBright,
    fontSize: 14,
    fontWeight: "800",
    flexShrink: 1,
  },
  add: {
    width: 34,
    height: 34,
    backgroundColor: colors.gold,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  addDisabled: { opacity: 0.4 },
});
