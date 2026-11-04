import React, { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { Button, colors, Glass, Icon, Page, Pill, SectionTitle } from "./ui";
import { getRestaurant } from './restaurants';
import { getRemoteContent } from './remoteCatalog';

// Informational content adapted from the public website's Figma export.
// Publishing dates and availability will come from the backend later.
const promotions = [
  { id: "weekend", title: "Double plaisir du week-end", badge: "−20 %", description: "Plats à partager, planches dégustation et cocktails du rooftop.", terms: "Offre mise en avant sur le site public. Dates, billard et double points à confirmer auprès du restaurant.", image: require("../assets/images/20-Promotions-layer-00024.jpg") },
  { id: "duo", title: "Offre Duo Grillades", badge: "−15 %", description: "Un assortiment de grillades à partager, accompagné de bobolo et de deux bissaps.", terms: "Offre présentée sur le site. Disponibilité et conditions à confirmer auprès du restaurant.", image: require("../assets/images/20-Promotions-layer-00074.jpg") },
  { id: "happy", title: "Happy Hour Rooftop", badge: "1 acheté = 1 offert", description: "Cocktails artisanaux et jus pressés maison au coucher du soleil.", terms: "Sélection de boissons et horaires à confirmer auprès du restaurant.", image: require("../assets/images/20-Promotions-layer-00103.jpg") },
  { id: "ndole", title: "Menu Spécial Ndolé Royal", badge: "−20 %", description: "Ndolé aux crevettes fraîches et plantains mûrs dorés.", terms: "Offre ponctuelle présentée sur le site ; date et tarif à confirmer.", image: require("../assets/images/20-Promotions-layer-00132.jpg") },
  { id: "etudiant", title: "Formule Étudiant Recharger", badge: "2 800 CDF", description: "Plat du jour Poulet DG et boisson fraîche.", terms: "Sous réserve de présentation d’une carte étudiante valide et de confirmation du tarif.", image: require("../assets/images/20-Promotions-layer-00161.jpg") },
  { id: "billard", title: "Plateau Apéro Billard", badge: "−25 %", description: "Beignets, brochettes et trio de sauces pour les soirées matchs.", terms: "Offre liée aux soirées matchs, sous réserve de réservation et de confirmation.", image: require("../assets/images/20-Promotions-layer-00190.jpg") },
  { id: "anniversaire", title: "Pack Anniversaire & Chill", badge: "Gâteau offert", description: "Un moment sur le rooftop avec un gâteau pour votre groupe.", terms: "Réservation de dix personnes minimum, sous réserve de confirmation.", image: require("../assets/images/20-Promotions-layer-00219.jpg") },
].map(offer => ({ ...offer, restaurantId: 'zeduc' }));

const events = [
  { id: "match", title: "Soirée Ligue des Champions Canal+", place: "Terrasse Rooftop Kinshasa", description: "Diffusion grand écran et planches tapas en continu.", price: "Entrée gratuite · consommation requise", icon: "football-outline" },
  { id: "cup", title: "Tournoi de billard ZeDuc Cup", place: "Espace Billard & Lounge", description: "Compétition amicale à 8-ball, trophée et crédits repas.", price: "Inscription indicative : 1 500 CDF", icon: "trophy-outline" },
  { id: "quiz", title: "Quiz musique & Afro-Beats Night", place: "Rooftop panoramique", description: "Blind test musical, DJ invité et cocktails signature.", price: "Accès libre selon programmation", icon: "musical-notes-outline" },
].map(event => ({ ...event, restaurantId: 'zeduc' }));

const tabs = [
  { id: "promotions", label: "Promotions" },
  { id: "events", label: "Événements" },
  { id: "games", label: "Jeux MIAM" },
];

export default function Discover({ back, go, initialTab = "promotions", restaurantFilter }) {
  const [tab, setTab] = useState(tabs.some(item => item.id === initialTab) ? initialTab : "promotions");
  const remotePromotions = getRemoteContent(restaurantFilter, 'promotion');
  const remoteEvents = getRemoteContent(restaurantFilter, 'event');
  const remoteGames = getRemoteContent(restaurantFilter, 'game');
  const visiblePromotions = remotePromotions === null ? promotions.filter(item => item.restaurantId === restaurantFilter) : remotePromotions.map(item => ({ id: item.id, title: item.title, badge: item.details?.badge || 'Offre', description: item.description, terms: item.details?.terms || 'Conditions à confirmer auprès du restaurant.', image: item.image_url ? { uri: item.image_url } : require('../assets/images/20-Promotions-layer-00024.jpg'), restaurantId: item.restaurant_id }));
  const visibleEvents = remoteEvents === null ? events.filter(item => item.restaurantId === restaurantFilter) : remoteEvents.map(item => ({ id: item.id, title: item.title, place: item.details?.place || getRestaurant(restaurantFilter).location, description: item.description, price: item.details?.price || '', icon: 'calendar-outline', restaurantId: item.restaurant_id }));
  return (
    <Page title="À découvrir" subtitle={`Offres et rendez-vous de ${getRestaurant(restaurantFilter).name}.`} onBack={back}>
      <Text style={{ color: colors.gold, fontWeight: '800', marginBottom: 9 }}>Restaurant : {getRestaurant(restaurantFilter).name}</Text>
      <Glass style={{ padding: 14, marginBottom: 15 }}>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Icon name="information-circle-outline" color={colors.gold} />
          <Text style={{ color: colors.muted, flex: 1, lineHeight: 19 }}>
            Contenu informatif issu du site. Offres, dates et réservations à confirmer auprès du restaurant.
          </Text>
        </View>
      </Glass>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
        {tabs.map(item => <Pill key={item.id} title={item.label} active={tab === item.id} onPress={() => setTab(item.id)} />)}
      </View>
      {tab === "promotions" && <>
        <SectionTitle title="Les offres du site" />
        {visiblePromotions.map(offer => <Glass key={offer.id} style={{ marginBottom: 13, overflow: "hidden" }}>
          <Image source={offer.image} style={{ width: "100%", height: 150 }} resizeMode="cover" />
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 12 }}>{getRestaurant(offer.restaurantId).name}</Text>
            <Text style={{ color: colors.gold, fontWeight: "800", fontSize: 12 }}>{offer.badge}</Text>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: "800", marginTop: 5 }}>{offer.title}</Text>
            <Text style={{ color: colors.muted, lineHeight: 20, marginTop: 6 }}>{offer.description}</Text>
            <Pressable accessibilityRole="button" onPress={() => Alert.alert(offer.title, offer.terms)} style={{ marginTop: 12 }}>
              <Text style={{ color: colors.gold, fontWeight: "700" }}>Voir les conditions →</Text>
            </Pressable>
          </View>
        </Glass>)}
        {!visiblePromotions.length && <Text style={{ color: colors.muted }}>Aucune promotion publiée pour ce restaurant.</Text>}
      </>}
      {tab === "events" && <>
        <SectionTitle title={`Agenda de ${getRestaurant(restaurantFilter).name}`} />
        {visibleEvents.map(event => <Glass key={event.id} style={{ padding: 17, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: "#332B1F", alignItems: "center", justifyContent: "center" }}><Icon name={event.icon} /></View>
            <View style={{ flex: 1 }}><Text style={{ color: colors.gold, fontSize: 12, fontWeight: '800' }}>{getRestaurant(event.restaurantId).name}</Text><Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>{event.title}</Text><Text style={{ color: colors.gold, marginTop: 3 }}>{event.place}</Text></View>
          </View>
          <Text style={{ color: colors.muted, lineHeight: 20, marginTop: 13 }}>{event.description}</Text>
          <Text style={{ color: colors.text, fontWeight: "700", marginTop: 11 }}>{event.price}</Text>
          <Text style={{ color: colors.muted, marginTop: 5, fontSize: 12 }}>Date et disponibilité à confirmer</Text>
        </Glass>)}
        {!visibleEvents.length && <Text style={{ color: colors.muted }}>Aucun événement publié pour ce restaurant.</Text>}
      </>}
      {tab === "games" && <>
        {remoteGames !== null ? (remoteGames.length ? remoteGames.map(game => <Glass key={game.id} style={{ padding: 18, marginBottom: 12 }}><Icon name="gift-outline" size={32} /><Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 9 }}>{game.title}</Text><Text style={{ color: colors.muted, marginTop: 7 }}>{game.description}</Text></Glass>) : <Text style={{ color: colors.muted }}>Aucun jeu publié pour ce restaurant.</Text>) : restaurantFilter !== 'zeduc' ? <Text style={{ color: colors.muted }}>Aucun jeu publié pour ce restaurant.</Text> : <>
        <SectionTitle title="Jouez pour des points MIAM" />
        <Glass style={{ padding: 18, marginBottom: 12 }}>
          <Icon name="gift-outline" size={32} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 11 }}>La roue gourmande</Text>
          <Text style={{ color: colors.muted, lineHeight: 20, marginVertical: 10 }}>Une tentative quotidienne dans la démonstration mobile pour gagner des points locaux.</Text>
          <Button title="Accéder à la roue" onPress={() => go("games")} />
        </Glass>
        <Glass style={{ padding: 18 }}>
          <Icon name="help-circle-outline" size={31} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 11 }}>Quiz hebdomadaire</Text>
          <Text style={{ color: colors.muted, lineHeight: 20, marginTop: 9 }}>Présenté sur le site public. Les questions et récompenses seront affichées après publication par le restaurant.</Text>
        </Glass>
        </>}
      </>}
    </Page>
  );
}
