import React from "react";
import { Text, View } from "react-native";
import { colors, Glass, Icon } from "./ui";

export default function DeliveryTracking() {
  return <Glass style={{ padding: 16 }}>
    <View style={{ flexDirection: "row", gap: 9, alignItems: "center", marginBottom: 10 }}><Icon name="bicycle-outline" /><Text style={{ color: colors.text, fontWeight: "800", fontSize: 17 }}>Suivi du livreur</Text></View>
    <Text style={{ color: colors.gold, lineHeight: 19, marginBottom: 10 }}>Aperçu démo · aucune position réelle de livreur.</Text>
    <View style={{ height: 260, overflow: "hidden", borderRadius: 17 }}>
      <iframe
        title="Carte indicative de Kinshasa"
        src="https://www.openstreetmap.org/export/embed.html?bbox=15.310%2C-4.335%2C15.335%2C-4.315&layer=mapnik&marker=-4.3221%2C15.3187"
        style={{ width: "100%", height: "100%", border: 0 }}
        loading="lazy"
      />
    </View>
    <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 }}>Le point visible est fictif. Le suivi réel nécessite une position transmise par un livreur et l’API.</Text>
  </Glass>;
}
