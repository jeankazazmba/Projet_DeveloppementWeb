import React from "react";
import { Pressable, Text, View } from "react-native";
import PaymentBrandLogo from "./PaymentBrandLogo";
import { colors, Glass, Icon } from "./ui";

const onlineMethods = [
  {
    title: "Mobile Money",
    items: [
      { id: "orange", name: "Orange Money", detail: "Paiement depuis votre compte Orange Money" },
      { id: "airtel", name: "Airtel Money", detail: "Paiement depuis votre compte Airtel Money" },
      { id: "mpesa", name: "M-Pesa", detail: "Paiement depuis votre compte Vodacom M-Pesa" },
    ],
  },
  {
    title: "Cartes bancaires",
    items: [
      { id: "visa", name: "Visa", detail: "Carte Visa" },
      { id: "mastercard", name: "Mastercard", detail: "Carte Mastercard" },
    ],
  },
  {
    title: "Cryptomonnaies",
    items: [
      { id: "bitcoin", name: "Bitcoin (BTC)", detail: "Règlement en BTC" },
      { id: "ethereum", name: "Ethereum (ETH)", detail: "Règlement en ETH" },
    ],
  },
];

export const cashPaymentLabel = (mode) =>
  mode === "Livraison" ? "Paiement à la livraison" : "Paiement à la caisse";

export default function PaymentMethods({ mode }) {
  return (
    <View>
      <Glass style={{ padding: 16, borderColor: colors.gold, borderWidth: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#302B20", alignItems: "center", justifyContent: "center" }}>
            <Icon name="cash-outline" size={23} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>
              {cashPaymentLabel(mode)}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 19 }}>
              {mode === "Livraison" ? "Réglez lors de la remise de la commande." : "Réglez au comptoir lors du retrait."}
            </Text>
          </View>
          <Icon name="checkmark-circle" color={colors.green} size={23} />
        </View>
        <Text style={{ color: colors.green, fontSize: 12, fontWeight: "700", marginTop: 13 }}>
          Disponible dans le parcours de commande
        </Text>
      </Glass>
      <Text style={{ color: colors.muted, lineHeight: 19, marginTop: 10, marginHorizontal: 2 }}>
        La commande reste une démonstration locale. Aucun restaurant ne la reçoit pour le moment.
      </Text>
      {onlineMethods.map((group) => (
        <View key={group.title} style={{ marginTop: 21 }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "800", marginBottom: 9 }}>
            {group.title}
          </Text>
          {group.items.map((method) => (
            <Pressable
              key={method.id}
              accessibilityRole="button"
              accessibilityLabel={`${method.name}, bientôt disponible`}
              accessibilityState={{ disabled: true }}
              disabled
              style={{ marginBottom: 9 }}
            >
              <Glass style={{ padding: 13, opacity: 0.75 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 48, height: 42, borderRadius: 11, backgroundColor: "#F6F3EB", alignItems: "center", justifyContent: "center" }}>
                    <PaymentBrandLogo brand={method.id} size={method.id === "visa" || method.id === "mastercard" ? 34 : 29} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
                      {method.name}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                      {method.detail}
                    </Text>
                  </View>
                  <Text style={{ color: colors.gold, fontSize: 11, fontWeight: "800" }}>
                    BIENTÔT
                  </Text>
                </View>
              </Glass>
            </Pressable>
          ))}
        </View>
      ))}
      <Text style={{ color: colors.muted, lineHeight: 19, marginTop: 4 }}>
        Les paiements en ligne seront activés après connexion aux prestataires et confirmation sécurisée côté serveur.
      </Text>
    </View>
  );
}
