import React from "react";
import { Pressable, Text, View } from "react-native";
import PaymentBrandLogo from "./PaymentBrandLogo";
import { paymentMethods, paymentScenarios } from "./paymentSandbox";
import { colors, Glass, Icon } from "./ui";

export const cashPaymentLabel = (mode) =>
  mode === "Livraison" ? "Paiement à la livraison" : "Paiement à la caisse";

const methodDetails = {
  orange: "Orange Money RDC",
  airtel: "Airtel Money RDC",
  mpesa: "Vodacom M-Pesa RDC",
  visa: "Carte Visa · simulation sans numéro de carte",
  mastercard: "Carte Mastercard · simulation sans numéro de carte",
  bitcoin: "BTC · simulation sans portefeuille",
  ethereum: "ETH · simulation sans portefeuille",
};

export default function PaymentMethods({ mode, selectedMethod, onSelect, scenario, onScenarioChange, connected = false }) {
  const cashSelected = selectedMethod === "cash";
  return (
    <View>
      <Pressable accessibilityRole="radio" accessibilityState={{ selected: cashSelected }} accessibilityLabel={cashPaymentLabel(mode)} onPress={() => onSelect("cash")}>
        <Glass style={{ padding: 16, borderColor: cashSelected ? colors.gold : "#484035", borderWidth: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#302B20", alignItems: "center", justifyContent: "center" }}>
              <Icon name="cash-outline" size={23} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>{cashPaymentLabel(mode)}</Text>
              <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 19 }}>{connected ? 'Intention espèces à régler créée par le serveur après la commande.' : "Commande locale · aucun encaissement dans l'application."}</Text>
            </View>
            <Icon name={cashSelected ? "checkmark-circle" : "ellipse-outline"} color={cashSelected ? colors.green : colors.muted} size={23} />
          </View>
        </Glass>
      </Pressable>
      {['Mobile Money', 'Cartes bancaires', 'Cryptomonnaies'].map((group) => (
        <View key={group} style={{ marginTop: 21 }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "800", marginBottom: 9 }}>{group}</Text>
          {paymentMethods.filter((method) => method.group === group).map((method) => {
            const selected = selectedMethod === method.id;
            return (
              <Pressable key={method.id} accessibilityRole="radio" accessibilityState={{ selected, disabled: connected }} accessibilityLabel={`${method.name}, ${connected ? 'indisponible avec le serveur' : 'test local sans débit'}`} disabled={connected} onPress={() => onSelect(method.id)} style={{ marginBottom: 9, opacity: connected ? 0.55 : 1 }}>
                <Glass style={{ padding: 13, borderColor: selected ? colors.gold : "#484035", borderWidth: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ width: 48, height: 42, borderRadius: 11, backgroundColor: "#F6F3EB", alignItems: "center", justifyContent: "center" }}>
                      <PaymentBrandLogo brand={method.id} size={method.id === "visa" || method.id === "mastercard" ? 34 : 29} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>{method.name}</Text>
                      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{methodDetails[method.id]}</Text>
                    </View>
                    <Icon name={selected ? "checkmark-circle" : "ellipse-outline"} color={selected ? colors.green : colors.muted} size={22} />
                  </View>
                </Glass>
              </Pressable>
            );
          })}
        </View>
      ))}
      {!connected && !cashSelected && (
        <Glass style={{ padding: 16, marginTop: 8 }}>
          <Text style={{ color: colors.gold, fontWeight: "800", marginBottom: 5 }}>Simulation locale · aucun débit</Text>
          <Text style={{ color: colors.muted, lineHeight: 19, marginBottom: 12 }}>Choisissez le résultat à tester. Aucun compte, carte ou portefeuille réel n'est demandé.</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {paymentScenarios.map((item) => (
              <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ selected: scenario === item.id }} onPress={() => onScenarioChange(item.id)} style={{ paddingVertical: 9, paddingHorizontal: 13, borderRadius: 16, borderWidth: 1, borderColor: scenario === item.id ? colors.gold : "#575047", backgroundColor: scenario === item.id ? "#393124" : "#292923" }}>
                <Text style={{ color: scenario === item.id ? colors.gold : colors.text, fontWeight: "700" }}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Glass>
      )}
      <Text style={{ color: colors.muted, lineHeight: 19, marginTop: 12, marginHorizontal: 2 }}>
        {connected ? 'Les autres moyens restent indisponibles jusqu’à validation de leurs sandboxes. Aucun paiement électronique n’est confirmé ici.' : "Les commandes et les paiements restent sur cet appareil. La connexion aux sandboxes des prestataires et la vérification côté serveur seront ajoutées séparément."}
      </Text>
    </View>
  );
}
