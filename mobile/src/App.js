import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurTargetView, BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as SplashScreen from "expo-splash-screen";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { categories, dishes, findDish, money } from "./catalog";
import Onboarding from "./Onboarding";
import SplashIntro from "./SplashIntro";
import FloatingCart from "./FloatingCart";
import AppTopBar from "./AppTopBar";
import Discover from "./Discover";
import DeliveryTracking from "./DeliveryTracking";
import TimePickerField from "./TimePickerField";
import PaymentMethods, { cashPaymentLabel } from "./PaymentMethods";
import {
  Button,
  colors,
  Field,
  FoodCard,
  Glass,
  Icon,
  Page,
  Pill,
  SectionTitle,
  styles,
} from "./ui";

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 450, fade: true });

const KEY = "mon-miam-miam-student-v1";
const Context = createContext(null);
const useApp = () => useContext(Context);
const initialData = {
  onboardingDone: false,
  user: null,
  cart: {},
  orders: [],
  complaints: [],
  notificationsReadAt: null,
  points: 120,
  referralUsed: false,
  lastSpin: null,
};
const tabNames = ["home", "menu", "orders", "loyalty", "profile"];
const tabs = [
  ["home", "Accueil", "home-outline"],
  ["menu", "Menu", "restaurant-outline"],
  ["orders", "Commandes", "receipt-outline"],
  ["loyalty", "Fidélité", "star-outline"],
  ["profile", "Profil", "person-outline"],
];

function localNotifications(data) {
  return [
    ...(data.orders || []).map((order) => ({
      id: `order-${order.id}`,
      date: order.date,
      title: `Commande ${order.id}`,
      body: "Commande de démonstration enregistrée sur cet appareil.",
      screen: "order",
      params: { id: order.id },
    })),
    ...(data.complaints || []).map((complaint) => ({
      id: `complaint-${complaint.id}`,
      date: complaint.date,
      title: "Signalement enregistré",
      body: `${complaint.subject} · en attente de connexion au serveur.`,
      screen: "complaints",
      params: {},
    })),
  ].sort((first, second) => second.date.localeCompare(first.date));
}

function AppProvider({ children }) {
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [stack, setStack] = useState([{ name: "onboarding", params: {} }]);
  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), 950);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw);
          setData({ ...initialData, ...saved });
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);
  const screen = stack[stack.length - 1];
  const go = (name, params = {}) =>
    setStack((current) => [...current, { name, params }]);
  const tab = (name) => setStack([{ name, params: {} }]);
  const back = () =>
    setStack((current) =>
      current.length > 1
        ? current.slice(0, -1)
        : [{ name: "home", params: {} }],
    );
  const login = (user) => {
    setData((current) => ({ ...current, user }));
    tab("home");
  };
  const logout = () => {
    setData((current) => ({ ...current, user: null }));
    setStack([{ name: "login", params: {} }]);
  };
  const finishOnboarding = () => {
    setData((current) => ({ ...current, onboardingDone: true }));
    setStack((current) => {
      const top = current[current.length - 1];
      return top.params?.replay && current.length > 1
        ? current.slice(0, -1)
        : [{ name: data.user ? "home" : "login", params: {} }];
    });
  };
  const addToCart = (id, quantity = 1) => {
    setData((current) => ({
      ...current,
      cart: { ...current.cart, [id]: (current.cart[id] || 0) + quantity },
    }));
    Alert.alert(
      "Ajouté au panier",
      `${findDish(id)?.name || "Plat"} · ${quantity} article${quantity > 1 ? "s" : ""}`,
    );
  };
  const setQuantity = (id, quantity) =>
    setData((current) => {
      const cart = { ...current.cart };
      if (quantity < 1) delete cart[id];
      else cart[id] = quantity;
      return { ...current, cart };
    });
  const cartItems = Object.entries(data.cart)
    .map(([id, quantity]) => ({ dish: findDish(id), quantity }))
    .filter((item) => item.dish);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0,
  );
  const placeOrder = ({ mode, address, arrival, usePoints }) => {
    if (!cartItems.length) return;
    const discount = usePoints
      ? Math.min(Math.floor(data.points / 10) * 100, subtotal)
      : 0;
    const order = {
      id: `MMM-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      items: cartItems.map(({ dish, quantity }) => ({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity,
      })),
      subtotal,
      discount,
      total: subtotal - discount + (mode === "Livraison" ? 1500 : 0),
      mode,
      address,
      arrival,
      payment: cashPaymentLabel(mode),
      paymentStatus: "À régler",
      status: "En préparation · démo",
    };
    setData((current) => ({
      ...current,
      cart: {},
      orders: [order, ...current.orders],
      points: Math.max(0, current.points - discount / 100),
    }));
    setStack([{ name: "confirmation", params: { orderId: order.id } }]);
  };
  const submitComplaint = (complaint) =>
    setData((current) => ({
      ...current,
      complaints: [
        {
          ...complaint,
          id: `REC-${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString(),
          status: "À transmettre",
        },
        ...current.complaints,
      ],
    }));
  const value = {
    data,
    setData,
    screen,
    go,
    tab,
    back,
    login,
    logout,
    finishOnboarding,
    addToCart,
    setQuantity,
    cartItems,
    subtotal,
    placeOrder,
    submitComplaint,
  };
  return (
    <Context.Provider value={value}>
      {ready && introDone ? (
        children
      ) : (
        <SplashIntro
          onLayout={() => SplashScreen.hideAsync().catch(() => {})}
        />
      )}
    </Context.Provider>
  );
}

function BottomTabs({ blurTarget }) {
  const { screen, tab } = useApp();
  const insets = useSafeAreaInsets();
  if (!tabNames.includes(screen.name) && screen.name !== "cart") return null;
  return (
    <BlurView
      intensity={82}
      tint="dark"
      blurMethod="dimezisBlurViewSdk31Plus"
      blurTarget={blurTarget}
      style={{
        position: "absolute",
        bottom: insets.bottom + 12,
        left: 16,
        right: 16,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: "rgba(240,219,174,0.4)",
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "rgba(26,27,26,0.42)",
        paddingVertical: 8,
        paddingHorizontal: 5,
        flexDirection: "row",
        shadowColor: "#000000",
        shadowOpacity: 0.32,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
        zIndex: 20,
      }}
    >
      {tabs.map(([name, label, icon]) => (
        <Pressable
          key={name}
          onPress={() => tab(name)}
          accessibilityRole="tab"
          accessibilityState={{ selected: screen.name === name }}
          style={{
            flex: 1,
            alignItems: "center",
            gap: 4,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor:
              screen.name === name ? "rgba(220,199,156,0.15)" : "transparent",
          }}
        >
          <Icon
            name={icon}
            color={screen.name === name ? colors.gold : "#8F918C"}
            size={22}
          />
          <Text
            style={{
              color: screen.name === name ? colors.gold : "#9A9B97",
              fontSize: 10,
              fontWeight: "700",
            }}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </BlurView>
  );
}

function Router() {
  const { screen, finishOnboarding, cartItems, data, go, tab } = useApp();
  const blurTarget = useRef(null);
  if (screen.name === "onboarding")
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.bg }}
        onLayout={() => SplashScreen.hideAsync().catch(() => {})}
      >
        <StatusBar style="light" />
        <Onboarding
          onComplete={finishOnboarding}
          allowSkip={Boolean(screen.params?.replay)}
        />
      </View>
    );
  const pages = {
    login: Login,
    register: Register,
    forgot: Forgot,
    home: Home,
    menu: Menu,
    detail: Detail,
    cart: Cart,
    checkout: Checkout,
    confirmation: Confirmation,
    orders: Orders,
    order: OrderDetail,
    loyalty: Loyalty,
    referrals: Referrals,
    complaints: Complaints,
    report: Report,
    games: Games,
    discover: DiscoverScreen,
    wheel: Wheel,
    leaderboard: Leaderboard,
    profile: Profile,
    notifications: Notifications,
  };
  const Component = pages[screen.name] || Home;
  const showTopBar = !["login", "register", "forgot"].includes(screen.name);
  const notifications = localNotifications(data);
  const unreadCount = notifications.filter(
    (item) =>
      Date.parse(item.date) >
      Date.parse(data.notificationsReadAt || "1970-01-01"),
  ).length;
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.bg }}
      onLayout={() => SplashScreen.hideAsync().catch(() => {})}
    >
      <StatusBar style="light" />
      {showTopBar && (
        <AppTopBar
          blurTarget={blurTarget}
          unreadCount={unreadCount}
          onHome={() => tab("home")}
          onSearch={() => go("menu", { autoFocus: true, searchAt: Date.now() })}
          onNotifications={() => {
            if (screen.name !== "notifications") go("notifications");
          }}
        />
      )}
      <BlurTargetView ref={blurTarget} collapsable={false} style={{ flex: 1 }}>
        <Component
          key={`${screen.name}-${screen.params?.id || ""}-${screen.params?.searchAt || ""}`}
          params={screen.params}
        />
      </BlurTargetView>
      <BottomTabs blurTarget={blurTarget} />
      <FloatingCart
        count={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        hasTabs={tabNames.includes(screen.name)}
        hidden={[
          "login",
          "register",
          "forgot",
          "cart",
          "checkout",
          "confirmation",
        ].includes(screen.name)}
        onOpen={() => go("cart")}
      />
    </View>
  );
}

function Notifications() {
  const { data, setData, go, back } = useApp();
  const items = localNotifications(data);
  useEffect(() => {
    setData((current) => ({
      ...current,
      notificationsReadAt: new Date().toISOString(),
    }));
  }, [setData]);
  return (
    <Page
      title="Notifications"
      subtitle="Les activités enregistrées sur cet appareil."
      onBack={back}
    >
      {items.length ? (
        items.map((item) => (
          <Glass
            key={item.id}
            style={{ padding: 17, marginBottom: 11 }}
            onPress={() => go(item.screen, item.params)}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Icon name="notifications-outline" size={23} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: "800",
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{ color: colors.muted, marginTop: 5, lineHeight: 19 }}
                >
                  {item.body}
                </Text>
                <Text
                  style={{ color: colors.gold, fontSize: 12, marginTop: 9 }}
                >
                  {new Date(item.date).toLocaleString("fr-FR")}
                </Text>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.muted} />
            </View>
          </Glass>
        ))
      ) : (
        <Glass style={{ padding: 24, alignItems: "center" }}>
          <Icon name="notifications-off-outline" size={36} />
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "800",
              marginTop: 12,
            }}
          >
            Aucune notification
          </Text>
          <Text
            style={{ color: colors.muted, textAlign: "center", marginTop: 6 }}
          >
            Vos commandes et signalements de démonstration apparaîtront ici.
          </Text>
        </Glass>
      )}
    </Page>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <Page noHeader>
      <View
        style={{
          minHeight: 190,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/images/05-Menu-layer-00007-0.jpg")}
          style={{ width: 100, height: 92 }}
          resizeMode="contain"
        />
        <Text
          style={{
            color: colors.gold,
            fontWeight: "900",
            letterSpacing: 3,
            marginTop: 8,
          }}
        >
          MON MIAM MIAM
        </Text>
      </View>
      <Glass style={{ padding: 22, marginBottom: 22 }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 27,
            fontWeight: "800",
            marginBottom: 8,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: colors.muted,
            fontSize: 14,
            lineHeight: 21,
            marginBottom: 24,
          }}
        >
          {subtitle}
        </Text>
        {children}
      </Glass>
      <Text style={{ color: colors.muted, textAlign: "center", fontSize: 12 }}>
        Application étudiante · Mode démonstration local
      </Text>
    </Page>
  );
}

function Login() {
  const { login, go } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = () => {
    if (!email.includes("@") || !password) {
      Alert.alert(
        "Informations manquantes",
        "Indiquez un e-mail valide et un mot de passe.",
      );
      return;
    }
    login({ name: email.split("@")[0], email });
  };
  return (
    <AuthShell
      title="Bon retour parmi nous"
      subtitle="Retrouvez votre menu, vos commandes et vos avantages étudiants."
    >
      <Field
        label="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="prenom@universite.cd"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        placeholder="Votre mot de passe"
        secureTextEntry
      />
      <Pressable
        onPress={() => go("forgot")}
        style={{ alignSelf: "flex-end", marginBottom: 21 }}
      >
        <Text style={{ color: colors.gold }}>Mot de passe oublié ?</Text>
      </Pressable>
      <Button title="Se connecter" onPress={submit} icon="log-in-outline" />
      <Button
        title="Explorer la démo"
        variant="secondary"
        onPress={() => login({ name: "Armand", email: "demo@monmiammiam.cd" })}
        style={{ marginTop: 11 }}
      />
      <Pressable onPress={() => go("register")} style={{ marginTop: 20 }}>
        <Text style={{ color: colors.muted, textAlign: "center" }}>
          Nouveau ici ?{" "}
          <Text style={{ color: colors.gold }}>Créer un compte</Text>
        </Text>
      </Pressable>
      <Pressable
        onPress={() => go("onboarding", { replay: true })}
        style={{ marginTop: 17 }}
      >
        <Text style={{ color: colors.gold, textAlign: "center" }}>
          Voir la présentation
        </Text>
      </Pressable>
    </AuthShell>
  );
}

function Register() {
  const { login, back } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Votre espace étudiant, pour découvrir et commander vos plats préférés."
    >
      <Field
        label="Nom complet"
        value={name}
        onChangeText={setName}
        placeholder="Votre nom"
      />
      <Field
        label="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="prenom@universite.cd"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Field
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Au moins 6 caractères"
      />
      <Button
        title="Créer mon compte démo"
        onPress={() => {
          if (!name.trim() || !email.includes("@") || password.length < 6)
            return Alert.alert(
              "Vérifiez vos informations",
              "Nom, e-mail valide et mot de passe de 6 caractères minimum requis.",
            );
          login({ name: name.trim(), email: email.trim() });
        }}
      />
      <Button
        title="Retour à la connexion"
        variant="secondary"
        onPress={back}
        style={{ marginTop: 11 }}
      />
    </AuthShell>
  );
}

function Forgot() {
  const { back } = useApp();
  const [email, setEmail] = useState("");
  return (
    <AuthShell
      title="Mot de passe oublié ?"
      subtitle="La récupération du compte sera disponible après le raccordement au serveur d'authentification."
    >
      <Field
        label="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="prenom@universite.cd"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Revenir à la connexion" onPress={back} />
    </AuthShell>
  );
}

function Home() {
  const { data, go, addToCart, tab } = useApp();
  return (
    <Page
      title={`Bonjour ${data.user?.name?.split(" ")[0] || "étudiant"} 👋`}
      subtitle="Qu'est-ce qui vous ferait plaisir aujourd'hui ?"
    >
      <LinearGradient
        colors={["#4D3920", "#26231D", "#171A18"]}
        style={{
          borderRadius: 23,
          padding: 22,
          borderWidth: 1,
          borderColor: "#8F7652",
        }}
      >
        <Text
          style={{
            color: colors.goldBright,
            fontSize: 11,
            letterSpacing: 2,
            fontWeight: "800",
          }}
        >
          LE GOÛT DU CAMPUS
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 27,
            fontWeight: "900",
            marginTop: 10,
            lineHeight: 32,
          }}
        >
          Un bon repas, à votre rythme.
        </Text>
        <Text
          style={{ color: colors.muted, marginVertical: 13, lineHeight: 20 }}
        >
          Commandez, gagnez des points et profitez de vos avantages.
        </Text>
        <Button
          title="Découvrir le menu"
          onPress={() => tab("menu")}
          icon="arrow-forward"
          style={{ alignSelf: "flex-start" }}
        />
      </LinearGradient>
      <SectionTitle title="En un regard" />
      <View style={{ flexDirection: "row", gap: 9 }}>
        <Glass style={{ flex: 1, padding: 16 }} onPress={() => tab("loyalty")}>
          <Icon name="star-outline" />
          <Text
            style={{
              color: colors.text,
              fontSize: 22,
              fontWeight: "800",
              marginTop: 9,
            }}
          >
            {data.points}
          </Text>
          <Text style={{ color: colors.muted }}>Points fidélité</Text>
        </Glass>
        <Glass style={{ flex: 1, padding: 16 }} onPress={() => tab("orders")}>
          <Icon name="receipt-outline" />
          <Text
            style={{
              color: colors.text,
              fontSize: 22,
              fontWeight: "800",
              marginTop: 9,
            }}
          >
            {data.orders.length}
          </Text>
          <Text style={{ color: colors.muted }}>Commandes</Text>
        </Glass>
      </View>
      <SectionTitle
        title="Menu du jour"
        action="Tout voir"
        onAction={() => tab("menu")}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {dishes.slice(0, 4).map((dish) => (
          <FoodCard
            key={dish.id}
            compact
            dish={dish}
            onPress={() => go("detail", { id: dish.id })}
            onAdd={() => addToCart(dish.id)}
          />
        ))}
      </ScrollView>
      <SectionTitle title="À découvrir" />
      <Glass style={{ padding: 17, marginBottom: 10 }} onPress={() => go("discover", { tab: "promotions" })}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>Promotions & événements</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>Découvrez les offres et l’agenda du rooftop.</Text>
          </View>
          <Icon name="pricetags-outline" size={27} />
        </View>
      </Glass>
      <Glass
        style={{ padding: 17, marginBottom: 10 }}
        onPress={() => go("games")}
      >
        <View style={styles.rowBetween}>
          <View>
            <Text
              style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}
            >
              Jouez, gagnez
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              Tournez la roue et gagnez des points.
            </Text>
          </View>
          <Icon name="gift-outline" size={28} />
        </View>
      </Glass>
      <Glass style={{ padding: 17 }} onPress={() => go("referrals")}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}
            >
              Offre de parrainage
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              Invitez un ami avec votre code personnel.
            </Text>
          </View>
          <Icon name="people-outline" size={28} />
        </View>
      </Glass>
    </Page>
  );
}

function DiscoverScreen({ params }) {
  const { back, go } = useApp();
  return <Discover back={back} go={go} initialTab={params?.tab} />;
}

function Menu({ params = {} }) {
  const { go, addToCart } = useApp();
  const [category, setCategory] = useState("Tout");
  const [query, setQuery] = useState("");
  const filtered = dishes.filter(
    (dish) =>
      (category === "Tout" || dish.category === category) &&
      dish.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Page title="Menu du jour" subtitle="Des saveurs pour chaque envie.">
      <Field
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un plat…"
        autoFocus={params.autoFocus}
        right={<Icon name="search-outline" color={colors.muted} />}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 17 }}
      >
        {categories.map((item) => (
          <Pill
            key={item}
            title={item}
            active={category === item}
            onPress={() => setCategory(item)}
          />
        ))}
      </ScrollView>
      <Text style={{ color: colors.muted, marginBottom: 13 }}>
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
      </Text>
      {filtered.map((dish) => (
        <FoodCard
          key={dish.id}
          dish={dish}
          onPress={() => go("detail", { id: dish.id })}
          onAdd={() => addToCart(dish.id)}
        />
      ))}
      {!filtered.length && (
        <Glass style={{ padding: 22 }}>
          <Text style={{ color: colors.muted }}>
            Aucun plat trouvé. Essayez une autre recherche.
          </Text>
        </Glass>
      )}
    </Page>
  );
}

function Detail({ params }) {
  const { back, addToCart, go } = useApp();
  const dish = findDish(params.id) || dishes[0];
  const [quantity, setQuantity] = useState(1);
  return (
    <Page title="Détail du plat" onBack={back}>
      <Glass>
        <Image source={dish.image} style={{ width: "100%", height: 235 }} />
        <View style={{ padding: 19 }}>
          <Text
            style={{ color: colors.gold, letterSpacing: 1, fontWeight: "800" }}
          >
            {dish.category.toUpperCase()}
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 26,
              fontWeight: "900",
              marginTop: 7,
            }}
          >
            {dish.name}
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 22, marginTop: 11 }}>
            {dish.description}
          </Text>
          <View style={[styles.rowBetween, { marginVertical: 19 }]}>
            <Text
              style={{
                color: colors.goldBright,
                fontWeight: "900",
                fontSize: 21,
              }}
            >
              {money(dish.price)}
            </Text>
            <Text style={{ color: colors.muted }}>
              ★ {dish.rating} · {dish.minutes} min
            </Text>
          </View>
          <View style={[styles.rowBetween, { marginBottom: 15 }]}>
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              Quantité
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
            >
              <Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <Icon name="remove-circle-outline" size={27} />
              </Pressable>
              <Text
                style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}
              >
                {quantity}
              </Text>
              <Pressable onPress={() => setQuantity(quantity + 1)}>
                <Icon name="add-circle-outline" size={27} />
              </Pressable>
            </View>
          </View>
          <Button
            title={`Ajouter · ${money(dish.price * quantity)}`}
            onPress={() => {
              addToCart(dish.id, quantity);
              go("cart");
            }}
          />
        </View>
      </Glass>
    </Page>
  );
}

function Cart() {
  const { back, cartItems, subtotal, setQuantity, go, tab } = useApp();
  return (
    <Page
      title="Mon panier"
      subtitle="Vérifiez vos plats avant de commander."
      onBack={back}
    >
      {cartItems.length ? (
        <>
          {cartItems.map(({ dish, quantity }) => (
            <Glass key={dish.id} style={{ padding: 12, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", gap: 13 }}>
                <Image
                  source={dish.image}
                  style={{ width: 82, height: 85, borderRadius: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 15,
                      fontWeight: "800",
                    }}
                  >
                    {dish.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.gold,
                      fontWeight: "800",
                      marginTop: 5,
                    }}
                  >
                    {money(dish.price * quantity)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      marginTop: 10,
                    }}
                  >
                    <Pressable
                      onPress={() => setQuantity(dish.id, quantity - 1)}
                    >
                      <Icon name="remove-circle-outline" size={24} />
                    </Pressable>
                    <Text style={{ color: colors.text }}>{quantity}</Text>
                    <Pressable
                      onPress={() => setQuantity(dish.id, quantity + 1)}
                    >
                      <Icon name="add-circle-outline" size={24} />
                    </Pressable>
                    <Pressable onPress={() => setQuantity(dish.id, 0)}>
                      <Icon name="trash-outline" size={20} color={colors.red} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </Glass>
          ))}
          <Glass style={{ padding: 18, marginTop: 10 }}>
            <View style={styles.rowBetween}>
              <Text style={{ color: colors.muted }}>Sous-total</Text>
              <Text style={{ color: colors.text }}>{money(subtotal)}</Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 13 }]}>
              <Text
                style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}
              >
                Total provisoire
              </Text>
              <Text
                style={{ color: colors.gold, fontSize: 18, fontWeight: "900" }}
              >
                {money(subtotal)}
              </Text>
            </View>
          </Glass>
          <Button
            title="Passer la commande"
            onPress={() => go("checkout")}
            icon="arrow-forward"
            style={{ marginTop: 20 }}
          />
        </>
      ) : (
        <Glass style={{ padding: 25, alignItems: "center" }}>
          <Icon name="basket-outline" size={44} />
          <Text
            style={{
              color: colors.text,
              fontSize: 19,
              fontWeight: "800",
              marginTop: 13,
            }}
          >
            Votre panier est vide
          </Text>
          <Text
            style={{
              color: colors.muted,
              textAlign: "center",
              marginVertical: 12,
            }}
          >
            Découvrez le menu et choisissez votre prochain repas.
          </Text>
          <Button title="Voir le menu" onPress={() => tab("menu")} />
        </Glass>
      )}
    </Page>
  );
}

function Checkout() {
  const { back, subtotal, data, placeOrder } = useApp();
  const [mode, setMode] = useState("Retrait");
  const [arrival, setArrival] = useState("");
  const [address, setAddress] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const discount = usePoints
    ? Math.min(Math.floor(data.points / 10) * 100, subtotal)
    : 0;
  return (
    <Page
      title="Finaliser et payer"
      subtitle="Préparez votre commande étudiante."
      onBack={back}
    >
      <SectionTitle title="Mode de réception" />
      <View style={{ flexDirection: "row" }}>
        <Pill
          title="Sur place / retrait"
          active={mode === "Retrait"}
          onPress={() => setMode("Retrait")}
        />
        <Pill
          title="Livraison"
          active={mode === "Livraison"}
          onPress={() => setMode("Livraison")}
        />
      </View>
      <Glass style={{ padding: 17, marginTop: 10 }}>
        <TimePickerField
          label="Heure souhaitée"
          value={arrival}
          onChange={setArrival}
        />
        {mode === "Livraison" && (
          <Field
            label="Adresse de livraison"
            value={address}
            onChangeText={setAddress}
            placeholder="Bâtiment, campus, repère…"
          />
        )}
      </Glass>
      <SectionTitle title="Paiement" />
      <PaymentMethods mode={mode} />
      <SectionTitle title="Vos points" />
      <Glass style={{ padding: 16 }} onPress={() => setUsePoints(!usePoints)}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={{ color: colors.text, fontWeight: "800" }}>
              Utiliser mes {data.points} points
            </Text>
            <Text style={{ color: colors.muted, marginTop: 3 }}>
              Réduction possible :{" "}
              {money(Math.min(Math.floor(data.points / 10) * 100, subtotal))}
            </Text>
          </View>
          <Icon name={usePoints ? "checkbox" : "square-outline"} />
        </View>
      </Glass>
      <SectionTitle title="Récapitulatif" />
      <Glass style={{ padding: 17 }}>
        <Summary label="Plats" value={money(subtotal)} />
        <Summary
          label="Livraison"
          value={mode === "Livraison" ? money(1500) : "Gratuit"}
        />
        <Summary label="Points fidélité" value={`− ${money(discount)}`} />
        <View
          style={{ height: 1, backgroundColor: "#484035", marginVertical: 13 }}
        />
        <Summary
          label="Total"
          value={money(subtotal + (mode === "Livraison" ? 1500 : 0) - discount)}
          strong
        />
      </Glass>
      <Button
        title="Confirmer · payer à la réception"
        onPress={() => {
          if (!arrival.trim() || (mode === "Livraison" && !address.trim()))
            return Alert.alert(
              "Informations manquantes",
              "Indiquez l’heure souhaitée et, en livraison, votre adresse.",
            );
          placeOrder({
            mode,
            arrival: arrival.trim(),
            address: address.trim(),
            usePoints,
          });
        }}
        style={{ marginTop: 20 }}
      />
      <Text
        style={{
          color: colors.muted,
          textAlign: "center",
          fontSize: 12,
          marginTop: 12,
        }}
      >
        Aucun paiement n'est débité. Une commande réelle nécessitera la connexion à l'API.
      </Text>
    </Page>
  );
}

function Summary({ label, value, strong }) {
  return (
    <View style={[styles.rowBetween, { marginBottom: 9 }]}>
      <Text
        style={{
          color: strong ? colors.text : colors.muted,
          fontWeight: strong ? "800" : "400",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: strong ? colors.gold : colors.text,
          fontWeight: strong ? "900" : "600",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Confirmation({ params }) {
  const { data, tab, go } = useApp();
  const order =
    data.orders.find((item) => item.id === params.orderId) || data.orders[0];
  return (
    <Page
      title="Commande confirmée"
      subtitle="Votre commande de démonstration a été enregistrée sur cet appareil."
    >
      <Glass style={{ padding: 25, alignItems: "center" }}>
        <Icon name="checkmark-circle" size={58} color={colors.green} />
        <Text
          style={{
            color: colors.text,
            fontSize: 23,
            fontWeight: "900",
            marginTop: 14,
          }}
        >
          Merci pour votre commande !
        </Text>
        <Text style={{ color: colors.gold, fontWeight: "800", marginTop: 6 }}>
          {order?.id}
        </Text>
        <Text
          style={{
            color: colors.muted,
            textAlign: "center",
            lineHeight: 20,
            marginTop: 11,
          }}
        >
          Nous avons conservé les détails localement. Aucun restaurant n'a reçu
          cette commande.
        </Text>
      </Glass>
      {order && (
        <Glass style={{ padding: 18, marginTop: 15 }}>
          <Summary label="Réception" value={order.mode} />
          <Summary label="Heure souhaitée" value={order.arrival} />
          <Summary label="Paiement" value={order.payment} />
          <Summary
            label="État du paiement"
            value={order.paymentStatus || "Non renseigné"}
          />
          <Summary label="Total" value={money(order.total)} strong />
        </Glass>
      )}
      <Button
        title={order?.mode === "Livraison" ? "Voir le suivi de livraison" : "Voir ma commande"}
        onPress={() => go("order", { id: order?.id })}
        style={{ marginTop: 19 }}
      />
      <Button
        title="Retour à l'accueil"
        variant="secondary"
        onPress={() => tab("home")}
        style={{ marginTop: 10 }}
      />
    </Page>
  );
}

function Orders() {
  const { data, go, tab } = useApp();
  const [filter, setFilter] = useState("Toutes");
  const list = data.orders.filter(
    (order) => filter === "Toutes" || order.status.includes(filter),
  );
  return (
    <Page
      title="Mes commandes"
      subtitle="Suivez vos commandes enregistrées dans la démo."
    >
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <Pill
          title="Toutes"
          active={filter === "Toutes"}
          onPress={() => setFilter("Toutes")}
        />
        <Pill
          title="En préparation"
          active={filter === "En préparation"}
          onPress={() => setFilter("En préparation")}
        />
      </View>
      {list.length ? (
        list.map((order) => (
          <Glass
            key={order.id}
            style={{ padding: 17, marginBottom: 11 }}
            onPress={() => go("order", { id: order.id })}
          >
            <View style={styles.rowBetween}>
              <Text
                style={{ color: colors.text, fontWeight: "900", fontSize: 16 }}
              >
                {order.id}
              </Text>
              <Icon name="chevron-forward" size={18} />
            </View>
            <Text style={{ color: colors.muted, marginTop: 6 }}>
              {new Date(order.date).toLocaleDateString("fr-FR")} ·{" "}
              {order.items.length} plat{order.items.length > 1 ? "s" : ""} ·{" "}
              {order.mode}
            </Text>
            {order.mode === "Livraison" && (
              <Text style={{ color: colors.gold, marginTop: 7, fontSize: 12 }}>
                Voir la carte de suivi →
              </Text>
            )}
            <View style={[styles.rowBetween, { marginTop: 13 }]}>
              <Text
                style={{ color: colors.green, fontWeight: "700", fontSize: 12 }}
              >
                {order.status}
              </Text>
              <Text style={{ color: colors.gold, fontWeight: "900" }}>
                {money(order.total)}
              </Text>
            </View>
          </Glass>
        ))
      ) : (
        <Glass style={{ padding: 24, alignItems: "center" }}>
          <Icon name="receipt-outline" size={42} />
          <Text
            style={{
              color: colors.text,
              fontWeight: "800",
              fontSize: 18,
              marginTop: 12,
            }}
          >
            Aucune commande
          </Text>
          <Text
            style={{
              color: colors.muted,
              textAlign: "center",
              marginVertical: 12,
            }}
          >
            Votre historique apparaîtra ici après une commande démo.
          </Text>
          <Button title="Voir le menu" onPress={() => tab("menu")} />
        </Glass>
      )}
    </Page>
  );
}

function OrderDetail({ params }) {
  const { data, back, go } = useApp();
  const order = data.orders.find((item) => item.id === params.id);
  if (!order) return <Page title="Commande introuvable" onBack={back} />;
  return (
    <Page
      title={order.id}
      subtitle={new Date(order.date).toLocaleString("fr-FR")}
      onBack={back}
    >
      <Glass style={{ padding: 18 }}>
        <Text style={{ color: colors.gold, fontSize: 13, fontWeight: "800" }}>
          ● {order.status}
        </Text>
        <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
          Ce suivi est une simulation locale. Le statut réel sera disponible
          après connexion à l'API.
        </Text>
      </Glass>
      <SectionTitle title="Plats commandés" />
      {order.items.map((item) => (
        <Glass key={item.id} style={{ padding: 15, marginBottom: 9 }}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "800" }}>
                {item.name}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>
                Quantité : {item.quantity}
              </Text>
            </View>
            <Text style={{ color: colors.gold, fontWeight: "800" }}>
              {money(item.price * item.quantity)}
            </Text>
          </View>
        </Glass>
      ))}
      <SectionTitle title="Livraison et paiement" />
      <Glass style={{ padding: 17 }}>
        <Summary label="Mode" value={order.mode} />
        <Summary label="Heure souhaitée" value={order.arrival} />
        {order.address ? (
          <Summary label="Adresse" value={order.address} />
        ) : null}
        <Summary label="Paiement" value={order.payment} />
        <Summary
          label="État du paiement"
          value={order.paymentStatus || "Non renseigné"}
        />
        <Summary label="Réduction" value={money(order.discount)} />
        <Summary label="Total" value={money(order.total)} strong />
      </Glass>
      {order.mode === "Livraison" && (
        <View style={{ marginTop: 18 }}>
          <DeliveryTracking order={order} />
        </View>
      )}
      <Button
        title="Signaler un problème"
        variant="secondary"
        onPress={() => go("report", { orderId: order.id })}
        style={{ marginTop: 20 }}
      />
    </Page>
  );
}

function Loyalty() {
  const { data, go, tab } = useApp();
  const progress = Math.min(100, (data.points / 500) * 100);
  return (
    <Page
      title="Ma fidélité"
      subtitle="Chaque commande vous rapproche de nouveaux avantages."
    >
      <LinearGradient
        colors={["#5A4325", "#29231B", "#1C1E1B"]}
        style={{
          padding: 24,
          borderRadius: 23,
          borderColor: "#8E754D",
          borderWidth: 1,
        }}
      >
        <Text
          style={{
            color: colors.goldBright,
            letterSpacing: 2,
            fontSize: 11,
            fontWeight: "800",
          }}
        >
          VOTRE SOLDE
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 54,
            fontWeight: "900",
            marginTop: 8,
          }}
        >
          {data.points} <Text style={{ fontSize: 17 }}>pts</Text>
        </Text>
        <Text style={{ color: colors.muted, marginTop: 4 }}>
          Utilisez vos points au moment de commander.
        </Text>
        <View
          style={{
            height: 8,
            borderRadius: 5,
            backgroundColor: "#5B5245",
            marginTop: 22,
          }}
        >
          <View
            style={{
              height: 8,
              width: `${progress}%`,
              borderRadius: 5,
              backgroundColor: colors.gold,
            }}
          />
        </View>
        <Text style={{ color: colors.goldBright, fontSize: 12, marginTop: 8 }}>
          {Math.max(0, 500 - data.points)} points avant le prochain palier
        </Text>
      </LinearGradient>
      <SectionTitle title="Comment ça marche ?" />
      <Glass style={{ padding: 17 }}>
        <InfoRow
          icon="restaurant-outline"
          title="Commandez"
          body="Parcourez le menu et choisissez vos plats."
        />
        <InfoRow
          icon="star-outline"
          title="Cumulez"
          body="La démo crédite 10 points par tranche de 1 000 FCFA."
        />
        <InfoRow
          icon="gift-outline"
          title="Profitez"
          body="Échangez 10 points contre 100 FCFA lors du paiement démo."
        />
      </Glass>
      <Button
        title="Commander pour gagner des points"
        onPress={() => tab("menu")}
        style={{ marginTop: 19 }}
      />
      <Button
        title="Parrainer un ami"
        variant="secondary"
        onPress={() => go("referrals")}
        style={{ marginTop: 10 }}
      />
    </Page>
  );
}

function InfoRow({ icon, title, body }) {
  return (
    <View style={{ flexDirection: "row", gap: 13, marginBottom: 18 }}>
      <Icon name={icon} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: "800" }}>{title}</Text>
        <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>
          {body}
        </Text>
      </View>
    </View>
  );
}

function Referrals() {
  const { data, setData, back } = useApp();
  const [code, setCode] = useState("");
  const myCode = `MIAM-${(data.user?.name || "ETUDIANT")
    .replace(/[^a-z]/gi, "")
    .slice(0, 5)
    .toUpperCase()}-${(data.user?.email || "DEMO").length.toString().padStart(2, "0")}`;
  const apply = () => {
    if (data.referralUsed)
      return Alert.alert(
        "Code déjà utilisé",
        "Un seul code de parrainage peut être utilisé dans la démo.",
      );
    if (code.trim().length < 5 || code.trim().toUpperCase() === myCode)
      return Alert.alert(
        "Code invalide",
        "Saisissez un code de parrainage différent du vôtre.",
      );
    setData((current) => ({
      ...current,
      points: current.points + 50,
      referralUsed: true,
    }));
    Alert.alert("Code appliqué", "50 points de démonstration ont été ajoutés.");
  };
  return (
    <Page
      title="Parrainer, gagner"
      subtitle="Invitez vos amis à découvrir Mon Miam Miam."
      onBack={back}
    >
      <Glass style={{ padding: 23, alignItems: "center" }}>
        <Icon name="people-outline" size={35} />
        <Text style={{ color: colors.muted, marginTop: 14 }}>
          VOTRE CODE PERSONNEL
        </Text>
        <Text
          selectable
          style={{
            color: colors.goldBright,
            fontSize: 25,
            fontWeight: "900",
            marginTop: 6,
            letterSpacing: 1,
          }}
        >
          {myCode}
        </Text>
        <Text
          style={{
            color: colors.muted,
            textAlign: "center",
            lineHeight: 20,
            marginTop: 12,
          }}
        >
          Vous pouvez copier ce code et le partager manuellement.
        </Text>
      </Glass>
      <SectionTitle title="J'ai un code" />
      <Glass style={{ padding: 16 }}>
        <Field
          label="Code de parrainage"
          value={code}
          onChangeText={setCode}
          placeholder="MIAM-XXXXX-00"
          autoCapitalize="characters"
        />
        <Button
          title={data.referralUsed ? "Code déjà utilisé" : "Appliquer le code"}
          disabled={data.referralUsed}
          onPress={apply}
        />
      </Glass>
      <Text style={{ color: colors.muted, lineHeight: 20, marginTop: 16 }}>
        Ce programme est simulé localement. Les avantages réels et la validation
        des codes devront être gérés par le serveur.
      </Text>
    </Page>
  );
}

function Complaints() {
  const { data, go, back } = useApp();
  return (
    <Page
      title="Mes réclamations"
      subtitle="Signalez un souci lié à votre expérience."
      onBack={back}
      right={
        <Pressable onPress={() => go("report")}>
          <Icon name="add-circle-outline" size={27} />
        </Pressable>
      }
    >
      <Button
        title="Signaler un problème"
        onPress={() => go("report")}
        icon="add"
      />
      {data.complaints.length ? (
        data.complaints.map((item) => (
          <Glass key={item.id} style={{ padding: 17, marginTop: 12 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>
              {item.subject}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 5 }}>
              {item.id} · {new Date(item.date).toLocaleDateString("fr-FR")}
            </Text>
            <Text
              style={{
                color: colors.gold,
                marginTop: 8,
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              {item.status}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
              {item.message}
            </Text>
            {item.photoUri && (
              <Image
                source={{ uri: item.photoUri }}
                style={{ height: 135, borderRadius: 12, marginTop: 12 }}
              />
            )}
          </Glass>
        ))
      ) : (
        <Glass style={{ padding: 23, marginTop: 18, alignItems: "center" }}>
          <Icon name="chatbubbles-outline" size={42} />
          <Text
            style={{
              color: colors.text,
              fontWeight: "800",
              fontSize: 18,
              marginTop: 12,
            }}
          >
            Aucune réclamation
          </Text>
          <Text
            style={{ color: colors.muted, textAlign: "center", marginTop: 6 }}
          >
            Vos signalements créés dans cette démo apparaîtront ici.
          </Text>
        </Glass>
      )}
    </Page>
  );
}

function Report({ params }) {
  const { submitComplaint, back } = useApp();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(params.orderId || "");
  const [photo, setPhoto] = useState(null);
  const choosePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      if (!result.canceled) setPhoto(result.assets[0].uri);
    } catch {
      Alert.alert(
        "Photo indisponible",
        "Impossible d'ouvrir la galerie sur cet appareil.",
      );
    }
  };
  const submit = async () => {
    if (!subject.trim() || message.trim().length < 10)
      return Alert.alert(
        "Informations manquantes",
        "Ajoutez un sujet et une description de 10 caractères minimum.",
      );
    let photoUri = null;
    if (photo) {
      try {
        photoUri = `${FileSystem.documentDirectory}reclamation-${Date.now()}.jpg`;
        await FileSystem.copyAsync({ from: photo, to: photoUri });
      } catch {
        return Alert.alert(
          "Photo non enregistrée",
          "Réessayez avec une autre photo.",
        );
      }
    }
    submitComplaint({
      subject: subject.trim(),
      orderId: orderId.trim(),
      message: message.trim(),
      photoUri,
    });
    Alert.alert(
      "Signalement enregistré",
      "Il est conservé sur cet appareil, mais n'a pas encore été transmis au restaurant.",
    );
    back();
  };
  return (
    <Page
      title="Signaler un problème"
      subtitle="Décrivez le problème pour préparer votre demande."
      onBack={back}
    >
      <Glass style={{ padding: 17 }}>
        <Field
          label="Sujet"
          value={subject}
          onChangeText={setSubject}
          placeholder="Ex. Plat manquant"
        />
        <Field
          label="Commande concernée (facultatif)"
          value={orderId}
          onChangeText={setOrderId}
          placeholder="Ex. MMM-123456"
        />
        <Field
          label="Votre message"
          value={message}
          onChangeText={setMessage}
          placeholder="Expliquez le problème…"
          multiline
        />
        <Button
          title={photo ? "Changer la photo" : "Joindre une photo"}
          variant="secondary"
          icon="image-outline"
          onPress={choosePhoto}
          style={{ marginBottom: 13 }}
        />
        {photo && (
          <Image
            source={{ uri: photo }}
            style={{ height: 145, borderRadius: 12, marginBottom: 13 }}
          />
        )}
        <Button title="Enregistrer le signalement" onPress={submit} />
      </Glass>
      <Text
        style={{
          color: colors.muted,
          fontSize: 12,
          lineHeight: 18,
          marginTop: 15,
        }}
      >
        La transmission et le suivi réels seront disponibles lorsque
        l'application mobile sera reliée à l'API.
      </Text>
    </Page>
  );
}

function Games() {
  const { data, go, back } = useApp();
  const available = data.lastSpin !== new Date().toDateString();
  return (
    <Page
      title="Jouez, gagnez"
      subtitle="Des jeux et avantages pour les étudiants."
      onBack={back}
    >
      <LinearGradient
        colors={["#53401F", "#24231E", "#161817"]}
        style={{
          padding: 23,
          borderRadius: 23,
          borderWidth: 1,
          borderColor: "#8F7652",
        }}
      >
        <Icon name="gift-outline" size={36} />
        <Text
          style={{
            color: colors.text,
            fontSize: 25,
            fontWeight: "900",
            marginTop: 15,
          }}
        >
          La roue de la chance
        </Text>
        <Text
          style={{ color: colors.muted, lineHeight: 21, marginVertical: 12 }}
        >
          Une tentative par jour pour gagner des points de fidélité dans la
          démo.
        </Text>
        <Button
          title={available ? "Tenter ma chance" : "Revenir demain"}
          onPress={() => go("wheel")}
          disabled={!available}
        />
      </LinearGradient>
      <SectionTitle title="Vos avantages" />
      <Glass style={{ padding: 17 }}>
        <InfoRow
          icon="star-outline"
          title={`${data.points} points disponibles`}
          body="Utilisables lors de votre prochaine commande démo."
        />
        <InfoRow
          icon="trophy-outline"
          title="Classement étudiant"
          body="Découvrez le tableau des meilleurs étudiants."
        />
      </Glass>
      <Button
        title="Voir le classement"
        variant="secondary"
        onPress={() => go("leaderboard")}
        style={{ marginTop: 16 }}
      />
    </Page>
  );
}

function Wheel() {
  const { data, setData, back } = useApp();
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const available = data.lastSpin !== new Date().toDateString();
  const rewards = [10, 20, 25, 30, 50, 75];
  const spin = () => {
    if (!available || spinning) return;
    const index = Math.floor(Math.random() * rewards.length);
    setSpinning(true);
    rotation.setValue(0);
    Animated.timing(rotation, {
      toValue: 1440 - index * 60 - 30,
      duration: 2900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      setSpinning(false);
      if (!finished) return;
      const prize = rewards[index];
      setResult(prize);
      setData((current) => ({
        ...current,
        points: current.points + prize,
        lastSpin: new Date().toDateString(),
      }));
    });
  };
  const rotationStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1800],
          outputRange: ["0deg", "1800deg"],
        }),
      },
    ],
  };
  return (
    <Page
      title="Roue de la chance"
      subtitle="Un tour quotidien, un petit cadeau."
      onBack={back}
    >
      <Glass style={{ padding: 24, alignItems: "center" }}>
        <View
          style={{
            width: 260,
            height: 275,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <View style={{ position: "absolute", top: 0, zIndex: 1 }}>
            <Icon name="caret-down" size={28} color={colors.goldBright} />
          </View>
          <Animated.View style={rotationStyle}>
            <Svg width={250} height={250} viewBox="0 0 250 250">
              {rewards.map((prize, index) => {
                const start = ((-90 + index * 60) * Math.PI) / 180;
                const end = ((-90 + (index + 1) * 60) * Math.PI) / 180;
                const middle = (start + end) / 2;
                const x1 = 125 + 116 * Math.cos(start);
                const y1 = 125 + 116 * Math.sin(start);
                const x2 = 125 + 116 * Math.cos(end);
                const y2 = 125 + 116 * Math.sin(end);
                return (
                  <React.Fragment key={prize}>
                    <Path
                      d={`M 125 125 L ${x1} ${y1} A 116 116 0 0 1 ${x2} ${y2} Z`}
                      fill={index % 2 ? "#2B2924" : "#AF9060"}
                      stroke="#DCC79C"
                      strokeWidth={2}
                    />
                    <SvgText
                      x={125 + 75 * Math.cos(middle)}
                      y={129 + 75 * Math.sin(middle)}
                      fill={index % 2 ? colors.goldBright : "#1F1B15"}
                      fontSize={17}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {prize}
                    </SvgText>
                  </React.Fragment>
                );
              })}
              <Circle
                cx={125}
                cy={125}
                r={29}
                fill="#1B1A18"
                stroke={colors.gold}
                strokeWidth={3}
              />
              <SvgText
                x={125}
                y={130}
                textAnchor="middle"
                fill={colors.gold}
                fontSize={12}
                fontWeight="bold"
              >
                MIAM
              </SvgText>
            </Svg>
          </Animated.View>
        </View>
        <Text
          style={{
            color: colors.muted,
            textAlign: "center",
            lineHeight: 20,
            marginVertical: 22,
          }}
        >
          {result
            ? `${result} points ont été ajoutés à votre solde local.`
            : available
              ? "Touchez le bouton pour découvrir votre gain."
              : "Votre tour du jour a déjà été utilisé."}
        </Text>
        <Button
          title={
            spinning
              ? "La roue tourne…"
              : available
                ? "Lancer la roue"
                : "Revenir demain"
          }
          onPress={spin}
          disabled={!available || spinning}
          style={{ alignSelf: "stretch" }}
        />
      </Glass>
    </Page>
  );
}

function Leaderboard() {
  const { data, back } = useApp();
  const [period, setPeriod] = useState("Semaine");
  const leaders = [
    { name: "Sarah K.", points: 890 },
    { name: "David M.", points: 760 },
    { name: "Grace L.", points: 645 },
    { name: "Junior B.", points: 520 },
    { name: data.user?.name || "Vous", points: data.points },
  ].sort((a, b) => b.points - a.points);
  return (
    <Page
      title="Classement"
      subtitle="Un aperçu illustratif des étudiants les plus actifs."
      onBack={back}
    >
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {["Jour", "Semaine", "Mois"].map((item) => (
          <Pill
            key={item}
            title={item}
            active={period === item}
            onPress={() => setPeriod(item)}
          />
        ))}
      </View>
      <Glass style={{ padding: 17 }}>
        {leaders.map((person, index) => (
          <View
            key={`${person.name}-${index}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 13,
              paddingVertical: 13,
              borderBottomWidth: index < leaders.length - 1 ? 1 : 0,
              borderBottomColor: "#37352F",
            }}
          >
            <Text
              style={{
                color: index < 3 ? colors.gold : colors.muted,
                width: 30,
                fontWeight: "900",
                fontSize: 19,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "800" }}>
                {person.name}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                {period}
              </Text>
            </View>
            <Text style={{ color: colors.gold, fontWeight: "800" }}>
              {person.points} pts
            </Text>
          </View>
        ))}
      </Glass>
      <Text style={{ color: colors.muted, lineHeight: 20, marginTop: 16 }}>
        Classement illustratif : les autres profils sont des données de
        démonstration. Le classement réel dépendra de l'API.
      </Text>
    </Page>
  );
}

function Profile() {
  const { data, setData, go, logout } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(data.user?.name || "");
  const changeName = () => {
    if (!name.trim()) return Alert.alert("Nom requis", "Saisissez votre nom.");
    setData((current) => ({
      ...current,
      user: { ...current.user, name: name.trim() },
    }));
    setEditing(false);
  };
  return (
    <Page title="Mon profil" subtitle="Votre espace et vos préférences.">
      <Glass style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          <View
            style={{
              width: 55,
              height: 55,
              borderRadius: 18,
              backgroundColor: "#635035",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon name="person" size={27} color={colors.goldBright} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.text, fontSize: 19, fontWeight: "900" }}
            >
              {data.user?.name}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 3 }}>
              {data.user?.email}
            </Text>
          </View>
        </View>
        {editing ? (
          <View style={{ marginTop: 18 }}>
            <Field label="Nom affiché" value={name} onChangeText={setName} />
            <Button title="Enregistrer" onPress={changeName} />
          </View>
        ) : (
          <Button
            title="Modifier mon nom"
            variant="secondary"
            onPress={() => setEditing(true)}
            style={{ marginTop: 17 }}
          />
        )}
      </Glass>
      <SectionTitle title="Mon espace" />
      <Glass style={{ paddingHorizontal: 17 }}>
        <ProfileLink
          icon="star-outline"
          label="Fidélité"
          onPress={() => go("loyalty")}
        />
        <ProfileLink
          icon="people-outline"
          label="Parrainage"
          onPress={() => go("referrals")}
        />
        <ProfileLink
          icon="chatbubbles-outline"
          label="Réclamations"
          onPress={() => go("complaints")}
        />
        <ProfileLink
          icon="pricetags-outline"
          label="Promotions & événements"
          onPress={() => go("discover")}
        />
        <ProfileLink
          icon="game-controller-outline"
          label="Jeux"
          onPress={() => go("games")}
        />
        <ProfileLink
          icon="trophy-outline"
          label="Classement"
          onPress={() => go("leaderboard")}
        />
        <ProfileLink
          icon="sparkles-outline"
          label="Revoir la présentation"
          onPress={() => go("onboarding", { replay: true })}
          last
        />
      </Glass>
      <SectionTitle title="À propos" />
      <Glass style={{ padding: 17 }}>
        <Text style={{ color: colors.text, fontWeight: "800" }}>
          Mon Miam Miam · Étudiant
        </Text>
        <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>
          Version de démonstration locale. Les paiements, l'authentification et
          la synchronisation requièrent la connexion à l'API.
        </Text>
      </Glass>
      <Button
        title="Se déconnecter"
        variant="secondary"
        onPress={logout}
        icon="log-out-outline"
        style={{ marginTop: 20 }}
      />
    </Page>
  );
}

function ProfileLink({ icon, label, onPress, last }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
        paddingVertical: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: "#393630",
      }}
    >
      <Icon name={icon} />
      <Text style={{ color: colors.text, fontWeight: "700", flex: 1 }}>
        {label}
      </Text>
      <Icon name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}
