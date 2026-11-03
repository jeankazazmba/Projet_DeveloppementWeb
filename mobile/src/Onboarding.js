import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, colors, Glass, Icon } from "./ui";

const slides = [
  {
    eyebrow: "BIENVENUE CHEZ MON MIAM MIAM",
    title: "Le meilleur du campus, à portée de main.",
    description:
      "Découvrez des plats préparés avec soin et trouvez votre prochain coup de cœur en quelques instants.",
    badge: "Des saveurs qui rassemblent",
    icon: "restaurant-outline",
    image: require("../assets/images/05-Menu-layer-00155-0.jpg"),
    action: "Découvrir",
  },
  {
    eyebrow: "COMMANDEZ À VOTRE RYTHME",
    title: "Votre repas, au bon moment.",
    description:
      "Choisissez vos plats, composez votre panier et indiquez l’heure souhaitée pour le retrait ou la livraison.",
    badge: "Sur place ou en livraison",
    icon: "cart-outline",
    image: require("../assets/images/05-Menu-layer-00137-0.jpg"),
    action: "Continuer",
  },
  {
    eyebrow: "DES AVANTAGES POUR VOUS",
    title: "Savourez. Cumulez. Recommencez.",
    description:
      "Retrouvez vos points de fidélité, partagez votre code de parrainage et tentez votre chance aux jeux.",
    badge: "Points, parrainage et surprises",
    icon: "gift-outline",
    image: require("../assets/images/05-Menu-layer-00265-0.jpg"),
    action: "Continuer",
  },
  {
    eyebrow: "TOUT AU MÊME ENDROIT",
    title: "Restez informé, à chaque étape.",
    description:
      "Retrouvez vos commandes, consultez leurs détails et signalez facilement un problème depuis votre espace.",
    badge: "Commandes et assistance",
    icon: "receipt-outline",
    image: require("../assets/images/05-Menu-layer-00248-0.jpg"),
    action: "Entrer dans l’app",
  },
];

export default function Onboarding({ onComplete, allowSkip = false }) {
  const [index, setIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const slide = slides[index];
  const next = () => {
    if (index === slides.length - 1) onComplete();
    else setIndex((current) => current + 1);
  };

  return (
    <LinearGradient
      colors={["#191B19", colors.bg, "#17130F"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 22,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 22,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image
              source={require("../assets/splash-logo.png")}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
            <Text
              style={{
                color: colors.goldBright,
                fontSize: 13,
                fontWeight: "900",
                letterSpacing: 1.2,
              }}
            >
              MON MIAM MIAM
            </Text>
          </View>
          {allowSkip && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Passer la présentation"
              onPress={onComplete}
              hitSlop={12}
            >
              <Text style={{ color: colors.muted, fontSize: 14 }}>Passer</Text>
            </Pressable>
          )}
          {!allowSkip && (
            <Text style={{ color: colors.gold, fontSize: 13, fontWeight: "800" }}>
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </Text>
          )}
        </View>

        <View
          style={{
            height: Math.max(245, Math.min(height * 0.39, 365)),
            borderRadius: 29,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(236,217,177,0.35)",
            backgroundColor: colors.panel,
          }}
        >
          <Image
            source={slide.image}
            resizeMode="cover"
            style={{ width: "100%", height: "100%" }}
          />
          <LinearGradient
            colors={["transparent", "rgba(11,12,13,0.15)", "#0B0C0D"]}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
          <Glass
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 16,
              paddingHorizontal: 15,
              paddingVertical: 13,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: "rgba(25,25,23,0.68)",
            }}
          >
            <Icon name={slide.icon} size={23} color={colors.goldBright} />
            <Text
              style={{ color: colors.text, fontWeight: "800", fontSize: 14 }}
            >
              {slide.badge}
            </Text>
          </Glass>
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end", paddingTop: 25 }}>
          <Text
            style={{
              color: colors.gold,
              fontSize: 11,
              fontWeight: "900",
              letterSpacing: 1.8,
            }}
          >
            {slide.eyebrow}
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 31,
              fontWeight: "900",
              lineHeight: 36,
              marginTop: 11,
            }}
          >
            {slide.title}
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: 15,
              lineHeight: 22,
              marginTop: 12,
            }}
          >
            {slide.description}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 7,
              marginTop: 23,
              marginBottom: 20,
            }}
          >
            {slides.map((item, dot) => (
              <View
                key={item.eyebrow}
                style={{
                  width: dot === index ? 29 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    dot === index ? colors.gold : "rgba(220,199,156,0.30)",
                }}
              />
            ))}
          </View>
          <Button
            title={slide.action}
            icon={index === slides.length - 1 ? "checkmark" : "arrow-forward"}
            onPress={next}
          />
          {index > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setIndex((current) => current - 1)}
              style={{ paddingTop: 17, alignSelf: "center" }}
            >
              <Text style={{ color: colors.muted, fontSize: 14 }}>
                Écran précédent
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
