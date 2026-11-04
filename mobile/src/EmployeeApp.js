import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurTargetView, BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppTopBar from "./AppTopBar";
import { categories, categoryLabels, dishes, money } from "./catalog";
import { claimStages, employeeWeeks, initialEmployeeData, orderStages, topEmployeeDishes, sleepyEmployeeData, sleepyEmployeeWeeks, sleepyTopEmployeeDishes } from "./employeeData";
import { Button, colors, Field, Glass, Icon, Page, Pill, SectionTitle, styles } from "./ui";
import { getRestaurant, restaurants } from './restaurants';
import { remoteApiUrl, staffRequest } from './remoteCatalog';
const STORAGE_KEY = "mon-miam-miam-employee-v2";
const EMPLOYEE = "MON MIAM MIAM · EMPLOYÉ";
const tabs = [["orders", "Commandes", "receipt-outline"], ["menu", "Menu", "restaurant-outline"], ["claims", "Réclamations", "chatbubble-ellipses-outline"], ["stats", "Stats", "stats-chart-outline"], ["profile", "Profil", "person-outline"]];
const mainScreens = tabs.map(([name]) => name);
const nextOrder = {
  Reçue: "En préparation",
  "En préparation": "Prête"
};
const nextStatus = order => order.status === "Prête" ? order.service === "Livraison" ? "Remise au livreur" : "Servie" : nextOrder[order.status];
const nextAction = {
  Reçue: "Démarrer la préparation",
  "En préparation": "Marquer prête"
};
const actionLabel = order => order.status === "Prête" ? order.service === "Livraison" ? "Remettre au livreur" : "Marquer servie" : nextAction[order.status];
function Status({
  value
}) {
  const color = value === "Reçue" ? "#90C7F4" : value === "En préparation" || value === "En cours" ? "#F0C06E" : value === "Prête" || value === "Servie" || value === "Remise au livreur" || value === "Résolue" ? colors.green : colors.gold;
  return <View style={{
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: `${color}22`
  }}><View style={{
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: color
    }} /><Text style={{
      color,
      fontSize: 11,
      fontWeight: "800"
    }}>{value}</Text></View>;
}
function Metric({
  icon,
  title,
  value,
  detail
}) {
  return <Glass style={{
    flex: 1,
    minWidth: 138,
    padding: 15,
    minHeight: 114
  }}><Icon name={icon} size={19} /><Text style={{
      color: colors.muted,
      fontSize: 12,
      marginTop: 8
    }}>{title}</Text><Text style={{
      color: colors.text,
      fontSize: 24,
      fontWeight: "900"
    }}>{value}</Text><Text style={{
      color: colors.muted,
      fontSize: 11
    }}>{detail}</Text></Glass>;
}
function TabBar({
  active,
  onSelect,
  blurTarget
}) {
  const insets = useSafeAreaInsets();
  if (!mainScreens.includes(active)) return null;
  return <BlurView intensity={82} tint="dark" blurMethod="dimezisBlurViewSdk31Plus" blurTarget={blurTarget} style={{
    position: "absolute",
    bottom: insets.bottom + 12,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 28,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "rgba(240,219,174,0.4)",
    overflow: "hidden",
    backgroundColor: "rgba(26,27,26,0.42)",
    shadowColor: "#000",
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 12
  }}>
    {tabs.map(([name, label, icon]) => <Pressable key={name} onPress={() => onSelect(name)} accessibilityRole="tab" accessibilityState={{
      selected: active === name
    }} style={{
      flex: 1,
      alignItems: "center",
      gap: 4,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: active === name ? "rgba(220,199,156,0.15)" : "transparent"
    }}><Icon name={icon} size={21} color={active === name ? colors.gold : "#8F918C"} /><Text numberOfLines={1} style={{
        color: active === name ? colors.gold : "#9A9B97",
        fontSize: 10,
        fontWeight: "700"
      }}>{label}</Text></Pressable>)}
  </BlurView>;
}
function OrdersScreen({
  data,
  openOrder,
  advance,
  searchRequested
}) {
  const [status, setStatus] = useState("Toutes");
  const [service, setService] = useState("Tous");
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const visible = data.orders.filter(order => (status === "Toutes" || order.status === status) && (service === "Tous" || order.service === service) && `${order.id} ${order.customer} ${order.items} ${order.location}`.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr")));
  return <Page eyebrow={EMPLOYEE} title="Commandes" subtitle="Faites avancer le service, étape par étape.">
    <View style={{
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9,
      marginBottom: 16
    }}><Metric icon="download-outline" title="Reçues" value={data.orders.filter(item => item.status === "Reçue").length} detail="À prendre en charge" /><Metric icon="time-outline" title="En préparation" value={data.orders.filter(item => item.status === "En préparation").length} detail="En cuisine" /><Metric icon="checkmark-outline" title="Prêtes" value={data.orders.filter(item => item.status === "Prête").length} detail="À remettre" /><Metric icon="bicycle-outline" title="Terminées" value={data.orders.filter(item => item.status === "Servie" || item.status === "Remise au livreur").length} detail="Dans cette démo" /></View>
    <Field value={query} onChangeText={setQuery} placeholder="Commande, client, plat…" autoFocus={searchRequested} right={<Icon name="search-outline" color={colors.muted} />} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{
      marginBottom: 6
    }}>{["Toutes", ...orderStages].map(item => <Pill key={item} title={`${item} (${item === "Toutes" ? data.orders.length : data.orders.filter(order => order.status === item).length})`} active={status === item} onPress={() => setStatus(item)} />)}</ScrollView>
    <View style={{
      flexDirection: "row",
      marginBottom: 10
    }}><Pill title="Tous" active={service === "Tous"} onPress={() => setService("Tous")} /><Pill title="Sur place" active={service === "Sur place"} onPress={() => setService("Sur place")} /><Pill title="Livraison" active={service === "Livraison"} onPress={() => setService("Livraison")} /></View>
    <Text style={{
      color: colors.muted,
      marginBottom: 9
    }}>{visible.length} commande{visible.length > 1 ? "s" : ""}</Text>
    {visible.map(order => <Glass key={order.id} style={{
      padding: 16,
      marginBottom: 11
    }}><View style={styles.rowBetween}><Text style={{
          color: colors.gold,
          fontWeight: "900"
        }}>{order.id}</Text><Text style={{
          color: colors.muted,
          fontSize: 11
        }}>Il y a {Math.max(0, Math.round((now - Date.parse(order.createdAt)) / 60000))} min</Text></View><Pressable onPress={() => openOrder(order.id)} accessibilityRole="button" accessibilityLabel={`Détails de ${order.id}`} style={{
        paddingVertical: 11
      }}><Text style={{
          color: colors.text,
          fontSize: 17,
          fontWeight: "800"
        }}>{order.customer}</Text><Text style={{
          color: colors.muted,
          marginTop: 3
        }}>{order.service} · {order.location}</Text><Text style={{
          color: colors.text,
          marginTop: 11
        }} numberOfLines={2}>{order.items}</Text></Pressable><View style={[styles.rowBetween, {
        marginBottom: 11
      }]}><Text style={{
          color: colors.goldBright,
          fontWeight: "900"
        }}>{money(order.amount)}</Text><Status value={order.status} /></View>{nextStatus(order) && <Button title={actionLabel(order)} onPress={() => advance(order.id)} variant={order.status === "Prête" ? "primary" : "secondary"} />}</Glass>)}
    {!visible.length && <Glass style={{
      padding: 20
    }}><Text style={{
        color: colors.muted
      }}>Aucune commande pour ces filtres.</Text></Glass>}
    <Text style={{
      color: colors.muted,
      fontSize: 12,
      marginTop: 10
    }}>Données de démonstration enregistrées sur cet appareil.</Text>
  </Page>;
}
function OrderDetailScreen({
  order,
  back,
  advance
}) {
  if (!order) return <Page eyebrow={EMPLOYEE} title="Commande introuvable" onBack={back} />;
  return <Page eyebrow={EMPLOYEE} title={order.id} subtitle="Détail de la commande" onBack={back}><Glass style={{
      padding: 19
    }}><Status value={order.status} />{[["Client", order.customer], ["Service", `${order.service} · ${order.location}`], ["Articles", order.items], ["Montant", money(order.amount)]].map(([label, value]) => <View key={label} style={{
        marginTop: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#3A362F",
        paddingBottom: 12
      }}><Text style={{
          color: colors.muted,
          fontSize: 12
        }}>{label}</Text><Text style={{
          color: colors.text,
          fontWeight: "800",
          marginTop: 4
        }}>{value}</Text></View>)}{nextStatus(order) && <Button title={actionLabel(order)} onPress={() => {
        advance(order.id);
        back();
      }} style={{
        marginTop: 22
      }} />}</Glass></Page>;
}
function MenuScreen({
  data,
  save,
  searchRequested,
  restaurantId
}) {
  const [draft, setDraft] = useState(data.menu);
  const [category, setCategory] = useState("Tout");
  const [query, setQuery] = useState("");
  const changed = JSON.stringify(draft) !== JSON.stringify(data.menu);
  const merged = dishes.filter(dish => dish.restaurantId === restaurantId).map(dish => ({
    ...dish,
    ...draft.find(item => item.id === dish.id)
  }));
  const featured = merged.find(dish => dish.featured && dish.available) || merged.find(dish => dish.available);
  const visible = merged.filter(dish => (category === "Tout" || dish.category === category) && `${dish.name} ${dish.description}`.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr")));
  const toggleAvailability = dish => {
    const available = !dish.available;
    setDraft(current => {
      const next = current.map(item => item.id === dish.id ? {
        ...item,
        available,
        featured: available ? item.featured : false
      } : item);
      if (next.some(item => item.featured && item.available)) return next;
      const replacement = next.find(item => item.available);
      return replacement ? next.map(item => ({
        ...item,
        featured: item.id === replacement.id
      })) : next;
    });
  };
  const feature = id => setDraft(current => current.map(item => ({
    ...item,
    featured: item.id === id
  })));
  return <Page eyebrow={EMPLOYEE} title="Menu du service" subtitle="Disponibilités et plat du jour. Prix en lecture seule.">
    {featured && <Glass style={{
      marginBottom: 17,
      overflow: "hidden"
    }}><Image source={featured.image} style={{
        width: "100%",
        height: 155
      }} /><View style={{
        padding: 16
      }}><Text style={{
          color: colors.gold,
          fontWeight: "900",
          fontSize: 12
        }}>★ PLAT DU JOUR</Text><Text style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: "900",
          marginTop: 6
        }}>{featured.name}</Text><Text style={{
          color: colors.goldBright,
          fontWeight: "800",
          marginTop: 4
        }}>{money(featured.price)}</Text></View></Glass>}
    {!featured && <Glass style={{
      padding: 17,
      marginBottom: 14
    }}><Text style={{
        color: colors.muted
      }}>Aucun plat disponible. Réactivez un plat pour définir le plat du jour.</Text></Glass>}
    <Field value={query} onChangeText={setQuery} placeholder="Rechercher un plat…" autoFocus={searchRequested} right={<Icon name="search-outline" color={colors.muted} />} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{
      marginBottom: 12
    }}>{categories.map(item => <Pill key={item} title={categoryLabels[item]} active={category === item} onPress={() => setCategory(item)} />)}</ScrollView>
    {visible.map(dish => <Glass key={dish.id} style={{
      padding: 12,
      marginBottom: 10
    }}><View style={{
        flexDirection: "row",
        gap: 12
      }}><Image source={dish.image} style={{
          width: 83,
          height: 91,
          borderRadius: 12,
          opacity: dish.available ? 1 : 0.45
        }} /><View style={{
          flex: 1,
          minWidth: 0
        }}><Text style={{
            color: colors.text,
            fontWeight: "800"
          }} numberOfLines={2}>{dish.name}</Text><Text style={{
            color: colors.muted,
            fontSize: 11,
            marginTop: 4
          }}>{categoryLabels[dish.category]}</Text><Text style={{
            color: colors.goldBright,
            fontWeight: "800",
            marginTop: 8
          }}>{money(dish.price)}</Text></View></View><View style={[styles.rowBetween, {
        marginTop: 12,
        paddingTop: 11,
        borderTopWidth: 1,
        borderTopColor: "#3A362F"
      }]}><View style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 7
        }}><Switch value={dish.available} onValueChange={() => toggleAvailability(dish)} trackColor={{
            false: "#54514A",
            true: colors.gold
          }} thumbColor={dish.available ? "#201B13" : "#B1ADA4"} accessibilityLabel={`${dish.name} ${dish.available ? "disponible" : "épuisé"}`} /><Text style={{
            color: dish.available ? colors.green : colors.red,
            fontSize: 12
          }}>{dish.available ? "Disponible" : "Épuisé"}</Text></View><Pressable onPress={() => feature(dish.id)} disabled={!dish.available} accessibilityRole="button" accessibilityLabel={`Définir ${dish.name} comme plat du jour`} accessibilityState={{
          selected: dish.featured,
          disabled: !dish.available
        }} style={{
          padding: 7,
          opacity: dish.available ? 1 : 0.4
        }}><Icon name={dish.featured ? "star" : "star-outline"} color={colors.gold} size={24} /></Pressable></View></Glass>)}
    {!visible.length && <Glass style={{
      padding: 18
    }}><Text style={{
        color: colors.muted
      }}>Aucun plat trouvé.</Text></Glass>}
    <Glass style={{
      padding: 14,
      marginTop: 6
    }}><Text style={{
        color: colors.muted,
        fontSize: 12
      }}>{changed ? "Modifications non enregistrées" : "Aucune modification en attente"}</Text><View style={{
        flexDirection: "row",
        gap: 10,
        marginTop: 10
      }}><Button title="Annuler" variant="secondary" disabled={!changed} onPress={() => setDraft(data.menu)} style={{
          flex: 1
        }} /><Button title="Enregistrer" disabled={!changed} onPress={() => save(draft)} style={{
          flex: 1
        }} /></View></Glass>
  </Page>;
}
function ClaimsScreen({
  data,
  openClaim
}) {
  const [status, setStatus] = useState("Toutes");
  const [query, setQuery] = useState("");
  const visible = data.claims.filter(claim => (status === "Toutes" || claim.status === status) && `${claim.id} ${claim.student} ${claim.reason}`.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr")));
  return <Page eyebrow={EMPLOYEE} title="Réclamations" subtitle="Prenez en charge et préparez une réponse pour le gérant."><Field value={query} onChangeText={setQuery} placeholder="Rechercher une réclamation…" right={<Icon name="search-outline" color={colors.muted} />} /><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{
      marginBottom: 15
    }}>{claimStages.map(item => <Pill key={item} title={`${item} (${item === "Toutes" ? data.claims.length : data.claims.filter(claim => claim.status === item).length})`} active={status === item} onPress={() => setStatus(item)} />)}</ScrollView>{visible.map(claim => <Glass key={claim.id} style={{
      padding: 16,
      marginBottom: 11
    }} onPress={() => openClaim(claim.id)}><View style={styles.rowBetween}><Text style={{
          color: colors.gold,
          fontWeight: "900"
        }}>{claim.id}</Text><Status value={claim.status} /></View><Text style={{
        color: colors.text,
        fontWeight: "800",
        fontSize: 17,
        marginTop: 12
      }}>{claim.student}</Text><Text style={{
        color: colors.muted,
        marginTop: 4
      }}>{claim.orderId} · {claim.reason}</Text><Text style={{
        color: colors.muted,
        fontSize: 11,
        marginTop: 8
      }}>{claim.received}</Text></Glass>)}{!visible.length && <Glass style={{
      padding: 19
    }}><Text style={{
        color: colors.muted
      }}>Aucune réclamation pour ces filtres.</Text></Glass>}</Page>;
}
function ClaimDetailScreen({
  claim,
  back,
  update
}) {
  const [response, setResponse] = useState(claim?.response || "");
  const editable = claim?.status === "À traiter" || claim?.status === "En cours";
  if (!claim) return <Page eyebrow={EMPLOYEE} title="Réclamation introuvable" onBack={back} />;
  const send = () => {
    if (claim.status !== "En cours") return Alert.alert("Prise en charge requise", "Prenez d’abord la réclamation en charge.");
    if (!response.trim()) return Alert.alert("Réponse requise", "Rédigez une réponse pour le gérant.");
    update(claim.id, {
      status: "Envoyée au gérant",
      response: response.trim()
    });
    Alert.alert("Réponse enregistrée", "La réponse est conservée localement. La liaison avec l’espace gérant reste à connecter.");
    back();
  };
  return <Page eyebrow={EMPLOYEE} title={claim.id} subtitle="Traitement de la réclamation" onBack={back}><Glass style={{
      padding: 17
    }}><Status value={claim.status} /><Text style={{
        color: colors.text,
        fontSize: 18,
        fontWeight: "900",
        marginTop: 15
      }}>{claim.student}</Text><Text style={{
        color: colors.muted,
        marginTop: 3
      }}>{claim.orderId} · {money(claim.amount)}</Text><SectionTitle title={claim.reason} /><Text style={{
        color: colors.text,
        lineHeight: 22
      }}>{claim.message}</Text><SectionTitle title="Votre réponse" /><TextInput multiline maxLength={500} editable={editable} value={response} onChangeText={setResponse} placeholder="Réponse à soumettre au gérant…" placeholderTextColor="#777974" style={{
        minHeight: 118,
        textAlignVertical: "top",
        color: colors.text,
        backgroundColor: "#252524",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#4A463C",
        padding: 13
      }} /><Text style={{
        color: colors.muted,
        fontSize: 11,
        textAlign: "right",
        marginTop: 5
      }}>{response.length} / 500</Text>{editable && <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{
        marginVertical: 13
      }}>{["Toutes nos excuses pour ce désagrément.", "Nous vérifions avec la cuisine.", "Un geste commercial peut être proposé après validation."].map(template => <Pill key={template} title={template} onPress={() => setResponse(current => `${current}${current ? " " : ""}${template}`.slice(0, 500))} />)}</ScrollView>}{claim.status === "À traiter" && <Button title="Prendre en charge" variant="secondary" onPress={() => update(claim.id, {
        status: "En cours"
      })} style={{
        marginTop: 15
      }} />}{claim.status === "En cours" && <Button title="Envoyer au gérant" onPress={send} style={{
        marginTop: 15
      }} />}<Text style={{
        color: colors.muted,
        fontSize: 12,
        marginTop: 15
      }}>La réponse officielle au client nécessite la validation du gérant.</Text></Glass></Page>;
}
function Bars({
  values,
  labels,
  format = value => String(value)
}) {
  const maximum = Math.max(...values, 1);
  return <View accessibilityRole="image" accessibilityLabel={values.map((value, index) => `${labels[index]} : ${format(value)}`).join(", ")} style={{
    flexDirection: "row",
    alignItems: "flex-end",
    height: 178,
    gap: 5,
    marginTop: 20
  }}>
    {values.map((value, index) => <View key={`${labels[index]}-${index}`} style={{
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      height: "100%"
    }}><View style={{
        width: "80%",
        minHeight: 5,
        height: `${Math.max(5, value / maximum * 82)}%`,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        backgroundColor: value === maximum ? colors.gold : "#726A5A"
      }} /><Text style={{
        color: colors.muted,
        fontSize: labels.length > 7 ? 9 : 11,
        marginTop: 5
      }}>{labels[index]}</Text></View>)}
  </View>;
}
function StatsScreen({ weeks = employeeWeeks, topDishes = topEmployeeDishes }) {
  const [weekIndex, setWeekIndex] = useState(1);
  const week = weeks[weekIndex];
  const revenue = week.sales.reduce((sum, value) => sum + value, 0);
  const onsiteShare = Math.round(week.onsite / week.orders * 100);
  return <Page eyebrow={EMPLOYEE} title="Statistiques" subtitle="Activité hebdomadaire · données de maquette."><Glass style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
      marginBottom: 18
    }}><Pressable disabled={weekIndex === 0} onPress={() => setWeekIndex(current => current - 1)} style={{
        padding: 9,
        opacity: weekIndex === 0 ? 0.3 : 1
      }} accessibilityLabel="Semaine précédente"><Icon name="chevron-back" /></Pressable><Text style={{
        color: colors.goldBright,
        fontWeight: "800"
      }}>{week.label} 2026</Text><Pressable disabled={weekIndex === weeks.length - 1} onPress={() => setWeekIndex(current => current + 1)} style={{
        padding: 9,
        opacity: weekIndex === weeks.length - 1 ? 0.3 : 1
      }} accessibilityLabel="Semaine suivante"><Icon name="chevron-forward" /></Pressable></Glass><View style={{
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9
    }}><Metric icon="cash-outline" title="Ventes" value={money(revenue)} detail="Cette semaine" /><Metric icon="receipt-outline" title="Commandes" value={week.orders} detail="Sur place + livraison" /><Metric icon="basket-outline" title="Panier moyen" value={money(revenue / week.orders)} detail="Par commande" /><Metric icon="bicycle-outline" title="Livraisons" value={`${100 - onsiteShare} %`} detail={`${week.delivery} commandes`} /></View><SectionTitle title="Ventes par jour" /><Glass style={{
      padding: 17
    }}><Text style={{
        color: colors.goldBright,
        fontSize: 20,
        fontWeight: "900"
      }}>{money(revenue)}</Text><Bars values={week.sales} labels={["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]} format={money} /></Glass><SectionTitle title="Sur place / livraison" /><Glass style={{
      padding: 17
    }}><View style={{
        flexDirection: "row",
        height: 16,
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 13
      }}><View style={{
          width: `${onsiteShare}%`,
          backgroundColor: colors.gold
        }} /><View style={{
          flex: 1,
          backgroundColor: "#726A5A"
        }} /></View><Text style={{
        color: colors.text
      }}>Sur place : {week.onsite} · {onsiteShare} %</Text><Text style={{
        color: colors.muted,
        marginTop: 5
      }}>Livraison : {week.delivery} · {100 - onsiteShare} %</Text></Glass><SectionTitle title="Top 5 des plats" /><Glass style={{
      padding: 17
    }}>{topDishes.map((dish, index) => <View key={dish.name} style={{
        marginBottom: 13
      }}><View style={styles.rowBetween}><Text style={{
            color: colors.text,
            flex: 1,
            fontSize: 12
          }}>{index + 1}. {dish.name}</Text><Text style={{
            color: colors.gold
          }}>{dish.count} cmd</Text></View><View style={{
          height: 5,
          borderRadius: 3,
          backgroundColor: "#33332F",
          marginTop: 7
        }}><View style={{
            height: 5,
            width: `${dish.count / topDishes[0].count * 100}%`,
            borderRadius: 3,
            backgroundColor: colors.gold
          }} /></View></View>)}</Glass><SectionTitle title="Heures de pointe" /><Glass style={{
      padding: 17
    }}><Bars values={week.peak} labels={["11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h"]} /></Glass><Text style={{
      color: colors.muted,
      fontSize: 12,
      marginTop: 16
    }}>Ces statistiques sont des exemples. Leurs chiffres viendront de l’API après intégration.</Text></Page>;
}
function ProfileScreen({
  exit,
  restaurant,
  onChangeRestaurant,
  connected = false,
  employeeName = 'Marie T.'
}) {
  return <Page eyebrow={EMPLOYEE} title="Mon espace" subtitle={connected ? 'Compte employé connecté.' : 'Service employé · mode démonstration.'}><Glass style={{
      padding: 19
    }}><View style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 13
      }}><View style={{
          width: 50,
          height: 50,
          borderRadius: 17,
          backgroundColor: "#635035",
          alignItems: "center",
          justifyContent: "center"
        }}><Text style={{
            color: colors.goldBright,
            fontWeight: "900"
          }}>{employeeName.slice(0, 2).toUpperCase()}</Text></View><View><Text style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: "900"
          }}>{employeeName}</Text><Text style={{
            color: colors.muted
          }}>Employée · Service du midi</Text></View></View><Text style={{
        color: colors.muted,
        lineHeight: 21,
        marginTop: 19
      }}>Restaurant de travail : {restaurant.name}. {connected ? 'Le menu partagé est chargé depuis l’API. Commandes et réclamations mobiles attendent leur raccordement.' : 'Les commandes, disponibilités du menu et réponses sont enregistrées uniquement sur cet appareil.'}</Text></Glass><Button title="Changer de restaurant" variant="secondary" icon="restaurant-outline" onPress={onChangeRestaurant} style={{ marginTop: 18 }} /><Button title={connected ? 'Se déconnecter' : 'Revenir à l’espace étudiant'} variant="secondary" icon="swap-horizontal-outline" onPress={exit} style={{
      marginTop: 18
    }} /></Page>;
}
function RestaurantScreen({ select, items = restaurants, connected = false }) {
  return <Page eyebrow={EMPLOYEE} title="Restaurant de travail" subtitle={connected ? 'Établissements attribués à votre compte.' : 'Choisissez l’établissement pour cette session de démonstration.'}>{items.map(item => <Glass key={item.id} style={{ padding: 18, marginBottom: 12 }} onPress={() => select(item.id)}><Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{item.name}</Text><Text style={{ color: colors.muted, marginTop: 5 }}>{item.location}</Text><Text style={{ color: colors.gold, marginTop: 8, fontSize: 12 }}>{connected ? 'Accès vérifié par le serveur' : item.example ? 'Établissement exemple · données fictives' : 'Restaurant actuel · données de maquette'}</Text></Glass>)}{!connected && <Text style={{ color: colors.muted, lineHeight: 20 }}>Les comptes réels limiteront cette liste aux établissements autorisés par l’API.</Text>}</Page>;
}

export default function EmployeeApp({
  onExit
}) {
  const [restaurantId, setRestaurantId] = useState(remoteApiUrl ? null : 'khalifa-food');
  const [auth, setAuth] = useState(null);
  const [assigned, setAssigned] = useState([]);
  const [staffContent, setStaffContent] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [data, setData] = useState(initialEmployeeData);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState("restaurant");
  const [selectedId, setSelectedId] = useState(null);
  const [searchRequested, setSearchRequested] = useState(false);
  const blurTarget = useRef(null);
  const storeKey = `${STORAGE_KEY}-${restaurantId}`;
  const baseData = remoteApiUrl ? { orders: [], claims: [], menu: [] } : restaurantId === 'sleepy-hollow' ? sleepyEmployeeData : initialEmployeeData;
  useEffect(() => {
    if (remoteApiUrl) { setData(baseData); setReady(true); return; }
    let active = true;
    AsyncStorage.getItem(storeKey).then(raw => {
      if (active) setData(raw ? { ...baseData, ...JSON.parse(raw) } : baseData);
    }).catch(() => { if (active) setData(baseData); }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [storeKey]);
  useEffect(() => {
    if (ready && !remoteApiUrl) AsyncStorage.setItem(storeKey, JSON.stringify(data)).catch(() => {});
  }, [data, ready, storeKey]);
  useEffect(() => {
    if (!remoteApiUrl || !auth || !restaurantId) return;
    let active = true;
    staffRequest(`/staff/restaurants/${encodeURIComponent(restaurantId)}/content`, auth.token).then(items => { if (active) setStaffContent(items); }).catch(error => { if (active) setAuthError(error.message); });
    return () => { active = false; };
  }, [auth, restaurantId]);
  if (!ready) return <View style={{
    flex: 1
  }} onLayout={() => SplashScreen.hideAsync().catch(() => {})}><StatusBar style="light" /><View style={{
      flex: 1,
      backgroundColor: colors.bg,
      alignItems: "center",
      justifyContent: "center"
    }}><Image source={require("../assets/splash-logo.png")} style={{
        width: 105,
        height: 105
      }} resizeMode="contain" /></View></View>;
  const loginEmployee = async () => {
    setAuthError('');
    try {
      const result = await staffRequest('/login', null, { method: 'POST', body: JSON.stringify({ email, password }) });
      const items = (await staffRequest('/staff/restaurants', result.token)).filter(item => item.pivot?.role === 'employee');
      if (!items.length) { await staffRequest('/logout', result.token, { method: 'POST' }); throw new Error('Ce compte n’a aucune affectation employé.'); }
      setAuth(result); setAssigned(items); setPassword('');
      if (items.length === 1) { setRestaurantId(items[0].id); setScreen('orders'); }
      else { setRestaurantId(null); setScreen('restaurant'); }
    } catch (error) { setAuthError(error.message); }
  };
  const exitEmployee = async () => {
    if (auth) { try { await staffRequest('/logout', auth.token, { method: 'POST' }); } catch { /* Le jeton n’est plus conservé localement. */ } }
    setAuth(null); onExit();
  };
  if (remoteApiUrl && !auth) return <Page eyebrow={EMPLOYEE} title="Connexion employé" subtitle="Connectez-vous pour voir uniquement vos restaurants."><Field label="Adresse e-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry /><Button title="Se connecter" onPress={loginEmployee} />{authError ? <Text style={{ color: '#ffb3a8', marginTop: 12 }}>{authError}</Text> : null}<Button title="Retour à l’espace étudiant" variant="secondary" onPress={onExit} style={{ marginTop: 20 }} /></Page>;
  const advance = id => setData(current => ({
    ...current,
    orders: current.orders.map(order => order.id === id && nextStatus(order) ? {
      ...order,
      status: nextStatus(order)
    } : order)
  }));
  const updateClaim = (id, fields) => setData(current => ({
    ...current,
    claims: current.claims.map(claim => claim.id === id ? {
      ...claim,
      ...fields
    } : claim)
  }));
  const back = () => {
    setScreen(screen === "order-detail" ? "orders" : "claims");
    setSelectedId(null);
  };
  const selectTab = name => {
    setScreen(name);
    setSelectedId(null);
    setSearchRequested(false);
  };
  const selectRestaurant = id => {
    if (!(remoteApiUrl ? assigned : restaurants).some(item => item.id === id)) return;
    if (id === restaurantId) { setScreen('orders'); return; }
    setReady(false);
    setRestaurantId(id);
    setSelectedId(null);
    setScreen('orders');
  };
  const selectedOrder = data.orders.find(order => order.id === selectedId);
  const selectedClaim = data.claims.find(claim => claim.id === selectedId);
  const pendingClaims = data.claims.filter(claim => claim.status === "À traiter" || claim.status === "En cours").length;
  return <View style={{
    flex: 1,
    backgroundColor: colors.bg
  }} onLayout={() => SplashScreen.hideAsync().catch(() => {})}><StatusBar style="light" /><AppTopBar blurTarget={blurTarget} unreadCount={pendingClaims} restaurantName={(remoteApiUrl ? assigned.find(item => item.id === restaurantId) : getRestaurant(restaurantId))?.name || 'Restaurant'} onRestaurant={() => setScreen('restaurant')} onHome={() => selectTab("orders")} searchLabel="Rechercher dans le service" onSearch={() => {
      setScreen("orders");
      setSearchRequested(true);
    }} onNotifications={() => selectTab("claims")} /><BlurTargetView ref={blurTarget} collapsable={false} style={{
      flex: 1
    }}>
    {screen === 'restaurant' && <RestaurantScreen select={selectRestaurant} items={remoteApiUrl ? assigned : restaurants} connected={Boolean(remoteApiUrl)} />}
    {screen === "orders" && <OrdersScreen key={`orders-${searchRequested}`} data={data} openOrder={id => {
        setSelectedId(id);
        setScreen("order-detail");
      }} advance={advance} searchRequested={searchRequested} />}
    {screen === "order-detail" && <OrderDetailScreen order={selectedOrder} back={back} advance={advance} />}
    {screen === "menu" && (remoteApiUrl ? <Page eyebrow={EMPLOYEE} title="Menu partagé" subtitle={(assigned.find(item => item.id === restaurantId))?.name || 'Restaurant'}>{staffContent.filter(item => item.kind === 'dish').map(item => <Glass key={item.id} style={{ padding: 16, marginBottom: 12 }}><Text style={{ color: colors.text, fontWeight: '800', fontSize: 17 }}>{item.title}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>{item.description}</Text><Text style={{ color: colors.gold, marginTop: 6 }}>{item.price_cdf ? money(item.price_cdf) : ''} · {item.is_published ? 'Publié' : 'Brouillon'}</Text></Glass>)}{!staffContent.some(item => item.kind === 'dish') && <Text style={{ color: colors.muted }}>Aucun plat pour cet établissement.</Text>}</Page> : <MenuScreen data={data} save={menu => setData(current => ({
        ...current,
        menu
      }))} searchRequested={searchRequested} restaurantId={restaurantId} />)}
    {screen === "claims" && <ClaimsScreen data={data} openClaim={id => {
        setSelectedId(id);
        setScreen("claim-detail");
      }} />}
    {screen === "claim-detail" && <ClaimDetailScreen claim={selectedClaim} back={back} update={updateClaim} />}
    {screen === "stats" && (!remoteApiUrl ? <StatsScreen weeks={restaurantId === 'sleepy-hollow' ? sleepyEmployeeWeeks : employeeWeeks} topDishes={restaurantId === 'sleepy-hollow' ? sleepyTopEmployeeDishes : topEmployeeDishes} /> : <Page eyebrow={EMPLOYEE} title="Statistiques" subtitle={(remoteApiUrl ? assigned.find(item => item.id === restaurantId) : getRestaurant(restaurantId))?.name}><Glass style={{ padding: 20 }}><Text style={{ color: colors.muted }}>Les statistiques de cet établissement seront disponibles avec l’API des commandes.</Text></Glass></Page>)}
    {screen === "profile" && <ProfileScreen exit={exitEmployee} restaurant={(remoteApiUrl ? assigned.find(item => item.id === restaurantId) : getRestaurant(restaurantId)) || { name: 'Restaurant' }} connected={Boolean(remoteApiUrl)} employeeName={auth?.user?.name || 'Marie T.'} onChangeRestaurant={() => setScreen('restaurant')} />}
  </BlurTargetView><TabBar active={screen} onSelect={selectTab} blurTarget={blurTarget} /></View>;
}
