import React from "react";
import { Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { colors, Glass, Icon } from "./ui";

// Approximate Yansoki centre for the preview, never a restaurant or courier GPS fix.
const preview = { latitude: 3.9701, longitude: 9.7922 };
const sampleCourier = { latitude: 3.9732, longitude: 9.7895 };
const validPosition = (value) =>
  value && Number.isFinite(value.latitude) && Number.isFinite(value.longitude) &&
  Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180;

export default function DeliveryTracking({ order }) {
  const tracking = order.deliveryTracking;
  const realCourier = validPosition(tracking?.courier) ? tracking.courier : null;
  const courier = realCourier || sampleCourier;
  const restaurant = validPosition(tracking?.restaurant) ? tracking.restaurant : preview;
  return <Glass style={{ padding: 16 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 12 }}>
      <Icon name="bicycle-outline" />
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: "800", flex: 1 }}>Suivi du livreur</Text>
    </View>
    <Text style={{ color: realCourier ? colors.green : colors.gold, lineHeight: 19, marginBottom: 12 }}>
      {realCourier ? `${tracking.courier.name || "Livreur"} · position transmise par le service de livraison` : "Aperçu démo · aucun livreur réel n’est affecté à cette commande."}
    </Text>
    <View style={{ height: 260, borderRadius: 17, overflow: "hidden", backgroundColor: "#292A26" }}>
      <MapView
        style={{ width: "100%", height: "100%" }}
        initialRegion={{ ...preview, latitudeDelta: 0.015, longitudeDelta: 0.015 }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <Marker coordinate={restaurant} title={realCourier ? "Point de départ" : "Yansoki · repère indicatif"} pinColor="#DCC79C" />
        <Marker coordinate={courier} title={realCourier ? tracking.courier.name || "Livreur" : "Position fictive du livreur"} pinColor="#65BFA0" />
      </MapView>
    </View>
    <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 11 }}>
      {realCourier && tracking.updatedAt
        ? `Dernière position : ${new Date(tracking.updatedAt).toLocaleString("fr-FR")}. Actualisation à connecter à l’API.`
        : "Les points de la carte sont fictifs. La position et l’heure d’arrivée réelles nécessitent l’application livreur et l’API de suivi."}
    </Text>
  </Glass>;
}
