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
  Platform,
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
import { categories, categoryLabels, dishes, findDish, money } from "./catalog";
import { getRestaurant, restaurants, normalizeRestaurantId, PRIMARY_RESTAURANT_ID } from "./restaurants";
import { loadRemoteCatalog, remoteApiUrl, studentRequest } from './remoteCatalog';
import { buildOrderRequest, contentId, mapOrder, orderItems } from './studentApi';
import { getGamesForRestaurant, playable } from './games';
import Onboarding from "./Onboarding";
import SplashIntro from "./SplashIntro";
import FloatingCart from "./FloatingCart";
import AppTopBar from "./AppTopBar";
import EmployeeApp from "./EmployeeApp";
import Discover from "./Discover";
import DeliveryTracking from "./DeliveryTracking";
import TimePickerField from "./TimePickerField";
import PaymentMethods, { cashPaymentLabel } from "./PaymentMethods";
import { simulatePayment } from "./paymentSandbox";
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
const SESSION_KEY = "mon-miam-miam-student-session-v1";
const ACTIVE_SPACE_KEY = "mon-miam-miam-active-space-v1";
const Context = createContext(null);
const useApp = () => useContext(Context);
const initialData = {
  onboardingDone: false,
  user: null,
  cart: {},
  restaurantFilter: null,
  orders: [],
  complaints: [],
  notificationsReadAt: null,
  points: 120,
  referralUsed: false,
  lastSpin: {},
  gameResults: {},
};
function migrateStudentDemo(saved) {
  const dishId = id => id === 'demo-assiette' ? 'sleepy-burger' : id === 'demo-boisson' ? 'sleepy-limonade' : id;
  const cart = Object.fromEntries(Object.entries(saved.cart || {}).map(([id, quantity]) => [dishId(id), quantity]));
  const orders = (saved.orders || []).map(order => ({ ...order, restaurantId: normalizeRestaurantId(order.restaurantId), items: (order.items || []).map(item => ({ ...item, id: dishId(item.id), restaurantId: normalizeRestaurantId(item.restaurantId) })) }));
  const previousSpins = saved.lastSpin && typeof saved.lastSpin === 'object' ? saved.lastSpin : saved.lastSpin ? { [PRIMARY_RESTAURANT_ID]: saved.lastSpin } : {};
  const lastSpin = Object.fromEntries(Object.entries(previousSpins).map(([id, value]) => [normalizeRestaurantId(id), value]));
  const gameResults = Object.fromEntries(Object.entries(saved.gameResults || {}).map(([id, value]) => [normalizeRestaurantId(id), value]));
  return { ...saved, cart, orders, lastSpin, gameResults, restaurantFilter: normalizeRestaurantId(saved.restaurantFilter) || null };
}
const tabNames = ["home", "restaurant", "menu", "orders", "loyalty", "profile"];
const tabs = [
  ["home", "Accueil", "home-outline"],
  ["menu", "Menu", "restaurant-outline"],
  ["orders", "Commandes", "receipt-outline"],
  ["loyalty", "Fidélité", "star-outline"],
  ["profile", "Profil", "person-outline"],
];

function confirmRestaurantChange(message, onConfirm) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert('Changer de restaurant', message, [
    { text: 'Garder le panier', style: 'cancel' },
    { text: 'Vider et continuer', style: 'destructive', onPress: onConfirm },
  ]);
}

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

function AppProvider({ children, skipOnboarding = false }) {
  const [data, setData] = useState(initialData);
  const [sessionToken, setSessionToken] = useState(null);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [sync, setSync] = useState({ loading: false, error: '', lastSync: null });
  const cartVersion = useRef(null);
  const skipCartWrite = useRef(false);
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [apiConnected, setApiConnected] = useState(false);
  const [ready, setReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [stack, setStack] = useState([
    { name: skipOnboarding ? "login" : "onboarding", params: {} },
  ]);
  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), 950);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    let active = true;
    if (remoteApiUrl) setSync(current => ({ ...current, loading: true }));
    loadRemoteCatalog().then(loaded => {
      if (active && loaded) { setApiConnected(true); setCatalogVersion(value => value + 1); setSync({ loading: false, error: '', lastSync: new Date().toISOString() }); }
      else if (active) setSync(current => ({ ...current, loading: false, error: remoteApiUrl ? 'Catalogue API vide. Démonstration affichée.' : '', lastSync: null }));
    }).catch(error => { if (active) setSync(current => ({ ...current, loading: false, error: error.message, lastSync: null })); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY), AsyncStorage.getItem(SESSION_KEY)])
      .then(([raw, rawSession]) => {
        if (raw) {
          const saved = JSON.parse(raw);
          const migrated = migrateStudentDemo(saved);
          if (migrated.source === 'server') { migrated.user = null; migrated.orders = []; migrated.cart = {}; }
          setData({ ...initialData, ...migrated });
          if (skipOnboarding)
            setStack([{ name: migrated.user ? "home" : "login", params: {} }]);
        }
        if (rawSession) {
          const savedSession = JSON.parse(rawSession);
          if (savedSession?.token) { setSessionToken(savedSession.token); if (skipOnboarding) setStack([{ name: "home", params: {} }]); }
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data.source === 'server' ? { ...data, user: null, orders: [], cart: {} } : data)).catch(() => {});
  }, [data, ready]);
  useEffect(() => {
    if (!ready) return;
    if (sessionToken) AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ token: sessionToken })).catch(() => {});
    else AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  }, [sessionToken, ready]);
  const screen = stack[stack.length - 1];
  useEffect(() => {
    if (!sessionToken || !['orders', 'order'].includes(screen.name)) return;
    let active = true;
    let running = false;
    const refreshOrders = async () => {
      if (!active || running) return;
      running = true;
      try {
        const result = await studentRequest('/me/orders?per_page=100', sessionToken);
        if (active) {
          setData(current => ({ ...current, orders: (result.data || []).map(mapOrder) }));
          setSync(current => ({ ...current, error: '', lastSync: new Date().toISOString() }));
        }
      } catch (error) { if (active) setSync(current => ({ ...current, error: error.message })); }
      finally { running = false; }
    };
    void refreshOrders();
    const timer = setInterval(refreshOrders, 4000);
    return () => { active = false; clearInterval(timer); };
  }, [sessionToken, screen.name]);
  const go = (name, params = {}) =>
    setStack((current) => [...current, { name, params }]);
  const tab = (name) => setStack([{ name, params: {} }]);
  const back = () =>
    setStack((current) =>
      current.length > 1
        ? current.slice(0, -1)
        : [{ name: "home", params: {} }],
    );
  const login = (user, token = null) => {
    setSessionToken(token);
    setCartHydrated(false);
    setData((current) => ({ ...current, user, source: token ? 'server' : 'demo', orders: token ? [] : current.orders, cart: token ? {} : current.cart, complaints: token ? [] : current.complaints, points: token ? 0 : current.points }));
    tab("home");
  };
  const logout = () => {
    if (sessionToken) studentRequest('/auth/logout', sessionToken, { method: 'POST' }).catch(() => {});
    setSessionToken(null);
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
    setCartHydrated(false);
    setData((current) => ({ ...current, user: null, orders: [], cart: {}, source: null }));
    setStack([{ name: "login", params: {} }]);
  };
  useEffect(() => {
    if (!sessionToken) return;
    let active = true;
    setSync(current => ({ ...current, loading: true, error: '' }));
    Promise.all([studentRequest('/me', sessionToken), studentRequest('/me/cart', sessionToken), studentRequest('/me/orders?per_page=100', sessionToken)])
      .then(([profile, cart, orders]) => {
        if (!active) return;
        cartVersion.current = cart?.version ?? null;
        skipCartWrite.current = true;
        setData(current => ({ ...current, user: profile, cart: Object.fromEntries((cart?.items || []).map(item => [`api-${item.content_id}`, item.quantity])), orders: (orders.data || []).map(mapOrder) }));
        setCartHydrated(true);
        setSync({ loading: false, error: '', lastSync: new Date().toISOString() });
      })
      .catch(error => {
        if (!active) return;
        if (error.status === 401 || error.status === 403) { AsyncStorage.removeItem(SESSION_KEY).catch(() => {}); setSessionToken(null); setData(current => ({ ...current, user: null, cart: {}, orders: [] })); tab('login'); }
        setSync(current => ({ ...current, loading: false, error: error.message }));
      });
    return () => { active = false; };
  }, [sessionToken]);
  useEffect(() => {
    if (!sessionToken || !cartHydrated) return;
    if (skipCartWrite.current) { skipCartWrite.current = false; return; }
    const timer = setTimeout(async () => {
      try {
        const entries = Object.entries(data.cart);
        if (!entries.length) {
          await studentRequest('/me/cart', sessionToken, { method: 'DELETE' });
          cartVersion.current = null;
        } else {
          const restaurantId = findDish(entries[0][0])?.restaurantId;
          if (!restaurantId) throw new Error('Plat du panier absent du catalogue serveur.');
          const cart = await studentRequest('/me/cart', sessionToken, { method: 'PUT', body: JSON.stringify({
            restaurant_id: restaurantId, replace_restaurant: true, expected_version: cartVersion.current,
            items: entries.map(([id, quantity]) => ({ content_id: contentId(id), quantity })),
          }) });
          cartVersion.current = cart.version;
        }
        setSync(current => ({ ...current, error: '', lastSync: new Date().toISOString() }));
      } catch (error) { setSync(current => ({ ...current, error: `Panier non synchronisé : ${error.message}` })); }
    }, 350);
    return () => clearTimeout(timer);
  }, [data.cart, sessionToken, cartHydrated]);
  const finishOnboarding = () => {
    setData((current) => ({ ...current, onboardingDone: true }));
    setStack((current) => {
      const top = current[current.length - 1];
      return top.params?.replay && current.length > 1
        ? current.slice(0, -1)
        : [{ name: sessionToken || data.user ? "home" : "login", params: {} }];
    });
  };
  const selectRestaurant = (id, onSelected) => {
    if (!restaurants.some(item => item.id === id)) return;
    const currentRestaurant = Object.keys(data.cart).map(findDish).find(Boolean)?.restaurantId;
    const choose = () => {
      setData(current => ({ ...current, cart: currentRestaurant && currentRestaurant !== id ? {} : current.cart, restaurantFilter: id }));
      onSelected?.();
    };
    if (currentRestaurant && currentRestaurant !== id) confirmRestaurantChange('Votre panier contient des plats d’un autre restaurant. Il sera vidé pour continuer.', choose);
    else choose();
  };
  const addToCart = (id, quantity = 1, onAdded) => {
    const dish = findDish(id);
    if (!dish || dish.available === false) return;
    const currentRestaurant = Object.keys(data.cart).map(findDish).find(Boolean)?.restaurantId;
    const add = () => {
      setData(current => ({ ...current, cart: currentRestaurant && currentRestaurant !== dish.restaurantId ? { [id]: quantity } : { ...current.cart, [id]: (current.cart[id] || 0) + quantity } }));
      if (onAdded) onAdded();
      else Alert.alert('Ajouté au panier', `${dish.name} · ${quantity} article${quantity > 1 ? 's' : ''}`);
    };
    if (currentRestaurant && currentRestaurant !== dish.restaurantId) confirmRestaurantChange('Une commande ne peut contenir les plats que d’un seul restaurant. Vider le panier actuel et ajouter ce plat ?', add);
    else add();
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
  const placeOrder = async ({ mode, address, district, phone, arrival, usePoints, paymentAttempt }) => {
    if (!cartItems.length) return;
    const restaurantId = cartItems[0].dish.restaurantId;
    if (cartItems.some(item => item.dish.restaurantId !== restaurantId)) {
      Alert.alert('Panier à vérifier', 'Une commande ne peut concerner qu’un seul restaurant.');
      return;
    }
    if (sessionToken) {
      if (usePoints || paymentAttempt) throw new Error('La réduction et les paiements test locaux ne sont pas disponibles pour une commande serveur.');
      setSync(current => ({ ...current, loading: true, error: '' }));
      try {
        const body = await buildOrderRequest(restaurantId, sessionToken, { mode, address, district, phone, arrival, cartItems });
        const quote = await studentRequest(`/restaurants/${encodeURIComponent(restaurantId)}/quotes`, sessionToken,
          { method: 'POST', body: JSON.stringify(body) });
        const created = await studentRequest(`/restaurants/${encodeURIComponent(restaurantId)}/orders`, sessionToken,
          { method: 'POST', headers: { 'Idempotency-Key': `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}` }, body: JSON.stringify(body) });
        let paymentStatus = 'À régler';
        try {
          const intent = await studentRequest(`/me/orders/${encodeURIComponent(created.id)}/payment-intents`, sessionToken,
            { method: 'POST', headers: { 'Idempotency-Key': `cash-${created.id}` }, body: JSON.stringify({ method: 'cash' }) });
          paymentStatus = intent.status === 'cash_due' ? 'Espèces à régler' : 'Paiement en attente';
        } catch (error) { paymentStatus = `Intention à créer : ${error.message}`; }
        const order = { ...mapOrder(created), total: created.amount_cdf ?? quote.total_cdf, paymentStatus };
        await studentRequest('/me/cart', sessionToken, { method: 'DELETE' }).catch(() => {});
        cartVersion.current = null;
        skipCartWrite.current = true;
        setData(current => ({ ...current, cart: {}, orders: [order, ...current.orders.filter(item => item.id !== order.id)] }));
        setSync({ loading: false, error: '', lastSync: new Date().toISOString() });
        setStack([{ name: 'confirmation', params: { orderId: order.id } }]);
        return;
      } catch (error) {
        setSync(current => ({ ...current, loading: false, error: error.message }));
        throw error;
      }
    }
    const discount = usePoints
      ? Math.min(Math.floor(data.points / 10) * 100, subtotal)
      : 0;
    const order = {
      id: `MMM-${Date.now().toString().slice(-6)}`,
      restaurantId,
      date: new Date().toISOString(),
      items: cartItems.map(({ dish, quantity }) => ({
        id: dish.id,
        restaurantId: dish.restaurantId,
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
      payment: paymentAttempt?.methodName || cashPaymentLabel(mode),
      paymentStatus: paymentAttempt ? "Test réussi · aucun débit" : "À régler",
      paymentTest: paymentAttempt || null,
      currency: "CDF",
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
    catalogVersion,
    apiConnected,
    sessionToken,
    sync,
    setData,
    screen,
    go,
    tab,
    back,
    login,
    logout,
    finishOnboarding,
    addToCart,
    selectRestaurant,
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
  const active = screen.name === 'restaurant' ? 'home' : screen.name;
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
          accessibilityState={{ selected: active === name }}
          style={{
            flex: 1,
            alignItems: "center",
            gap: 4,
            paddingVertical: 5,
            borderRadius: 20,
            backgroundColor:
              active === name ? "rgba(220,199,156,0.15)" : "transparent",
          }}
        >
          <Icon
            name={icon}
            color={active === name ? colors.gold : "#8F918C"}
            size={22}
          />
          <Text
            style={{
              color: active === name ? colors.gold : "#9A9B97",
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

function Router({ onOpenEmployee }) {
  const { screen, finishOnboarding, cartItems, data, go, tab, sync, sessionToken } = useApp();
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
    restaurant: RestaurantHome,
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
    quiz: QuizGame,
    memory: MemoryGame,
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
      {remoteApiUrl && <View style={{ paddingHorizontal: 22, paddingVertical: 5 }}>
        <Text style={{ color: sync.error ? colors.red : colors.muted, fontSize: 11 }}>
          {sync.loading ? 'Synchronisation en cours…' : sync.error ? `API : ${sync.error}` : sessionToken ? `Dernière synchronisation : ${sync.lastSync ? new Date(sync.lastSync).toLocaleTimeString('fr-CD') : 'en attente'}` : apiConnected ? 'Serveur disponible · connectez-vous pour synchroniser votre espace.' : 'Connexion au serveur en attente.'}
        </Text>
      </View>}
      <BlurTargetView ref={blurTarget} collapsable={false} style={{ flex: 1 }}>
        <Component
          key={`${screen.name}-${screen.params?.id || ""}-${screen.params?.searchAt || ""}`}
          params={screen.params}
          onOpenEmployee={onOpenEmployee}
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
                  {new Date(item.date).toLocaleString("fr-CD", { timeZone: "Africa/Kinshasa" })}
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
  const [space, setSpace] = useState(null);
  const [studentReentry, setStudentReentry] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(ACTIVE_SPACE_KEY)
      .then((saved) => setSpace(saved === "employee" ? "employee" : "student"))
      .catch(() => setSpace("student"));
  }, []);
  const switchSpace = (next) => {
    if (space === "student" && next === "employee") setStudentReentry(true);
    setSpace(next);
    AsyncStorage.setItem(ACTIVE_SPACE_KEY, next).catch(() => {});
  };
  return (
    <SafeAreaProvider>
      {space === "employee" ? (
        <EmployeeApp onExit={() => switchSpace("student")} />
      ) : space === "student" ? (
        <AppProvider skipOnboarding={studentReentry}>
          <Router onOpenEmployee={() => switchSpace("employee")} />
        </AppProvider>
      ) : (
        <SplashIntro onLayout={() => SplashScreen.hideAsync().catch(() => {})} />
      )}
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
        {remoteApiUrl ? 'Application étudiante · Serveur connecté' : 'Application étudiante'}
      </Text>
    </Page>
  );
}

function Login({ onOpenEmployee }) {
  const { login, go } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!email.includes("@") || !password) {
      Alert.alert(
        "Informations manquantes",
        "Indiquez un e-mail valide et un mot de passe.",
      );
      return;
    }
    if (!remoteApiUrl) return setError('API non configurée. Utilisez la démonstration.');
    setBusy(true); setError('');
    try {
      const session = await studentRequest('/auth/login', null, { method: 'POST', body: JSON.stringify({ email, password }) });
      const profile = await studentRequest('/me', session.token);
      if (profile.account_type !== 'student') {
        await studentRequest('/auth/logout', session.token, { method: 'POST' }).catch(() => {});
        throw new Error('Ce compte ne correspond pas à un étudiant.');
      }
      login(profile, session.token);
    } catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
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
      <Button title={busy ? 'Connexion…' : 'Se connecter'} onPress={submit} disabled={busy} icon="log-in-outline" />
      {error ? <Text style={{ color: colors.red, marginTop: 9 }}>{error}</Text> : null}
      <Button
        title="Explorer la démo"
        variant="secondary"
        onPress={() => login({ name: "Armand", email: "demo@monmiammiam.cd" })}
        style={{ marginTop: 11 }}
      />
      <Button
        title="Espace employé · démo"
        variant="secondary"
        icon="briefcase-outline"
        onPress={onOpenEmployee}
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
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
        placeholder="Au moins 12 caractères"
      />
      <Button
        title={busy ? 'Création…' : 'Créer mon compte'}
        disabled={busy}
        onPress={async () => {
          if (!name.trim() || !email.includes('@') || password.length < 12) return setError('Nom, e-mail valide et mot de passe de 12 caractères minimum requis.');
          if (!remoteApiUrl) return setError('API non configurée. Revenez à la connexion pour explorer la démonstration.');
          setBusy(true); setError('');
          try {
            const session = await studentRequest('/auth/register', null, { method: 'POST', body: JSON.stringify({ name: name.trim(), email: email.trim(), password, password_confirmation: password }) });
            login(session.user, session.token);
          } catch (reason) { setError(reason.message); }
          finally { setBusy(false); }
        }}
      />
      {error ? <Text style={{ color: colors.red, marginTop: 9 }}>{error}</Text> : null}
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
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <AuthShell
      title="Mot de passe oublié ?"
      subtitle="Demandez un jeton de réinitialisation. En développement, le serveur l’inscrit dans son journal local."
    >
      <Field
        label="Adresse e-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="prenom@universite.cd"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title={busy ? 'Envoi…' : 'Demander un jeton'} disabled={busy} onPress={async () => {
        if (!email.includes('@')) return setError('Indiquez une adresse e-mail valide.');
        if (!remoteApiUrl) return setError('API non configurée.');
        setBusy(true); setError('');
        try { await studentRequest('/auth/password/forgot', null, { method: 'POST', body: JSON.stringify({ email }) }); setNotice('Si le compte existe, le jeton a été inscrit dans le journal local du serveur.'); }
        catch (reason) { setError(reason.message); }
        finally { setBusy(false); }
      }} />
      {notice ? <Text style={{ color: colors.green, marginTop: 9 }}>{notice}</Text> : null}
      {error ? <Text style={{ color: colors.red, marginTop: 9 }}>{error}</Text> : null}
      <Button title="Revenir à la connexion" variant="secondary" onPress={back} style={{ marginTop: 11 }} />
    </AuthShell>
  );
}

function Home() {
  const { data, selectRestaurant, go, apiConnected } = useApp();
  const [query, setQuery] = useState('');
  const visible = restaurants.filter(item => `${item.name} ${item.location}`.toLocaleLowerCase('fr').includes(query.trim().toLocaleLowerCase('fr')));
  return <Page title={`Bonjour ${data.user?.name?.split(' ')[0] || 'étudiant'} 👋`} subtitle="Choisissez un restaurant pour découvrir sa carte et ses activités."><Field value={query} onChangeText={setQuery} placeholder="Rechercher un restaurant ou un lieu…" right={<Icon name="search-outline" color={colors.gold} />} />{visible.map(item => <Glass key={item.id} style={{ padding: 20, marginBottom: 14 }} onPress={() => selectRestaurant(item.id, () => go('restaurant'))}><Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900' }}>{item.example ? 'RESTAURANT EXEMPLE' : 'RESTAURANT ACTUEL'}</Text><Text style={{ color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 7 }}>{item.name}</Text><Text style={{ color: colors.muted, marginTop: 7 }}>{item.location}</Text><Text style={{ color: colors.muted, marginTop: 3 }}>{item.hours}</Text><Text style={{ color: colors.goldBright, marginTop: 14, fontWeight: '800' }}>Voir le restaurant →</Text></Glass>)}{!visible.length && <Glass style={{ padding: 20 }}><Text style={{ color: colors.muted }}>Aucun restaurant trouvé.</Text></Glass>}<Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>{apiConnected ? 'Catalogue synchronisé avec le serveur.' : 'Catalogue de démonstration local.'}</Text></Page>;
}

function RestaurantHome() {
  const { data, go, addToCart, tab } = useApp();
  const selected = restaurants.find(item => item.id === data.restaurantFilter);
  if (!selected) return <Page title="Choisir un restaurant"><Button title="Voir les restaurants" onPress={() => tab('home')} /></Page>;
  if (selected.id !== PRIMARY_RESTAURANT_ID) return <Page title={selected.name} subtitle={`${selected.location} · ${selected.hours}`} onBack={() => tab('home')}><Glass style={{ padding: 19, marginBottom: 18 }}><Text style={{ color: colors.gold, fontWeight: '900' }}>{selected.example ? 'Établissement de démonstration' : 'Votre restaurant'}</Text><Text style={{ color: colors.muted, marginTop: 8 }}>Les plats, promotions, événements et jeux présentés ici sont propres à cet établissement.</Text></Glass><Button title="Voir les plats" onPress={() => tab('menu')} /><Button title="Promotions, événements et jeux" variant="secondary" onPress={() => go('discover')} style={{ marginTop: 10 }} /><SectionTitle title="La carte" />{dishes.filter(dish => dish.restaurantId === selected.id).map(dish => <FoodCard key={dish.id} dish={dish} onPress={() => go('detail', { id: dish.id })} onAdd={() => addToCart(dish.id)} />)}</Page>;
  return (
    <Page
      title={selected.name}
      subtitle={`${selected.location} · ${selected.hours}`}
      onBack={() => tab('home')}
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
          <Text style={{ color: colors.muted }}>Points fidélité plateforme</Text>
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
            {data.orders.filter(order => order.restaurantId === selected.id).length}
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
        {dishes.filter(dish => dish.restaurantId === data.restaurantFilter).slice(0, 4).map((dish) => (
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
            <Text style={{ color: colors.muted, marginTop: 4 }}>Découvrez les offres et l’agenda de ce restaurant.</Text>
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
              Explorez la roue, le quiz et les paires gourmandes.
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
  const { back, go, data, tab } = useApp();
  if (!restaurants.some(item => item.id === data.restaurantFilter)) return <Page title="Choisir un restaurant"><Button title="Voir les restaurants" onPress={() => tab('home')} /></Page>;
  return <Discover back={back} go={go} initialTab={params?.tab} restaurantFilter={data.restaurantFilter} />;
}

function Menu({ params = {} }) {
  const { go, addToCart, data, tab } = useApp();
  const selected = restaurants.find(item => item.id === data.restaurantFilter);
  const [category, setCategory] = useState("Tout");
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [priceOrder, setPriceOrder] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const matches = dishes.filter((dish) => {
    const content = `${dish.name} ${dish.description}`.toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return dish.restaurantId === data.restaurantFilter && (!availableOnly || dish.available !== false) && content.includes(normalizedQuery);
  });
  const filtered = matches.filter((dish) => category === "Tout" || dish.category === category);
  const sections = (category === "Tout" ? categories.slice(1) : [category])
    .map((name) => ({
      name,
      items: filtered.filter((dish) => dish.category === name)
        .sort((a, b) =>
          Number(a.available === false) - Number(b.available === false) ||
          (priceOrder ? a.price - b.price : 0),
        ),
    }))
    .filter((section) => section.items.length);
  if (!selected) return <Page title="Choisir un restaurant" subtitle="Sélectionnez un établissement avant de consulter ses plats."><Button title="Voir les restaurants" onPress={() => tab('home')} /></Page>;
  return (
    <Page title={`La carte · ${selected.name}`} subtitle={`${selected.location} · ${selected.hours}`}>
      <Button title="Changer de restaurant" variant="secondary" onPress={() => tab('home')} style={{ marginBottom: 14 }} />
      <Field
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un plat, une boisson…"
        autoFocus={params.autoFocus}
        right={<Icon name="search-outline" color={colors.muted} />}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10 }}
      >
        {categories.map((item) => (
          <Pill
            key={item}
            title={`${categoryLabels[item]} (${item === "Tout" ? matches.length : matches.filter((dish) => dish.category === item).length})`}
            active={category === item}
            onPress={() => setCategory(item)}
          />
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        <Pill
          title="Disponibles"
          icon="checkmark-circle-outline"
          active={availableOnly}
          onPress={() => setAvailableOnly((current) => !current)}
        />
        <Pill
          title="Prix croissant"
          icon="swap-vertical-outline"
          active={priceOrder}
          onPress={() => setPriceOrder((current) => !current)}
        />
      </View>
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 4 }}>
        {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
      </Text>
      {sections.map((section) => (
        <View key={section.name}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 17, marginBottom: 13 }}>
            <Text style={{ color: colors.text, fontSize: 19, fontWeight: "800" }}>{categoryLabels[section.name]}</Text>
            <Text style={{ color: colors.gold, fontSize: 13, fontWeight: "800" }}>{section.items.length}</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "rgba(236,217,177,0.18)" }} />
          </View>
          {section.items.map((dish) => (
            <FoodCard
              key={dish.id}
              dish={dish}
              onPress={() => go("detail", { id: dish.id })}
              onAdd={() => addToCart(dish.id)}
            />
          ))}
        </View>
      ))}
      {!filtered.length && (
        <Glass style={{ padding: 22 }}>
          <Text style={{ color: colors.muted }}>
            Aucun résultat avec ces filtres.
          </Text>
          <Pressable onPress={() => { setQuery(""); setCategory("Tout"); setAvailableOnly(false); setPriceOrder(false); }} style={{ marginTop: 14 }}>
            <Text style={{ color: colors.gold, fontWeight: "800" }}>Afficher toute la carte →</Text>
          </Pressable>
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
          <Text style={{ color: colors.gold, fontWeight: '800', marginBottom: 5 }}>{getRestaurant(dish.restaurantId).name}{dish.example ? ' · article fictif' : ''}</Text>
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
            {(dish.rating || dish.minutes) && (
              <Text style={{ color: colors.muted }}>
                {[dish.rating && `★ ${dish.rating}`, dish.minutes && `${dish.minutes} min`].filter(Boolean).join(" · ")}
              </Text>
            )}
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
            title={dish.available === false ? "Momentanément indisponible" : `Ajouter · ${money(dish.price * quantity)}`}
            disabled={dish.available === false}
            onPress={() => {
              addToCart(dish.id, quantity, () => go("cart"));
            }}
          />
        </View>
      </Glass>
    </Page>
  );
}

function Cart() {
  const { back, cartItems, subtotal, setQuantity, go, tab } = useApp();
  const cartRestaurant = cartItems.length ? getRestaurant(cartItems[0].dish.restaurantId) : null;
  return (
    <Page
      title="Mon panier"
      subtitle="Vérifiez vos plats avant de commander."
      onBack={back}
    >
      {cartItems.length ? (
        <>
          <Glass style={{ padding: 15, marginBottom: 14 }}><Text style={{ color: colors.gold, fontWeight: '800' }}>Restaurant : {cartRestaurant.name}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>Une commande ne peut contenir les plats que d’un seul restaurant. Choisir un autre restaurant videra ce panier après confirmation.</Text></Glass>
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
                  <Text style={{ color: colors.muted, fontSize: 11 }}>{getRestaurant(dish.restaurantId).name}</Text>
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
  const { back, subtotal, data, cartItems, placeOrder, sessionToken } = useApp();
  const cartRestaurant = cartItems.length ? getRestaurant(cartItems[0].dish.restaurantId) : null;
  const [mode, setMode] = useState("Retrait");
  const [arrival, setArrival] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [paymentScenario, setPaymentScenario] = useState("success");
  const discount = usePoints
    ? Math.min(Math.floor(data.points / 10) * 100, subtotal)
    : 0;
  return (
    <Page
      title="Finaliser et payer"
      subtitle="Préparez votre commande étudiante."
      onBack={back}
    >
      {cartRestaurant && <Glass style={{ padding: 14, marginBottom: 12 }}><Text style={{ color: colors.gold, fontWeight: '800' }}>Commande pour {cartRestaurant.name}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{sessionToken ? 'Le serveur vérifiera les plats, le créneau, les frais et le total avant de créer la commande.' : 'Paiement et livraison de démonstration, sans transmission au restaurant.'}</Text></Glass>}
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
          <><Field
            label="Adresse de livraison"
            value={address}
            onChangeText={setAddress}
            placeholder="Bâtiment, campus, repère…"
          />{sessionToken && <><Field label="Commune" value={district} onChangeText={setDistrict} placeholder="Gombe" /><Field label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+243…" /></>}</>
        )}
      </Glass>
      <SectionTitle title="Paiement" />
      <PaymentMethods mode={mode} selectedMethod={selectedMethod} onSelect={setSelectedMethod} scenario={paymentScenario} onScenarioChange={setPaymentScenario} connected={Boolean(sessionToken)} />
      <SectionTitle title="Vos points" />
      <Glass style={{ padding: 16 }} onPress={() => { if (!sessionToken) setUsePoints(!usePoints); }}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={{ color: colors.text, fontWeight: "800" }}>
              {sessionToken ? 'Réduction en points indisponible pour la commande serveur' : `Utiliser mes ${data.points} points`}
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
          label={sessionToken ? 'Total estimé' : 'Total'}
          value={money(subtotal + (mode === "Livraison" ? 1500 : 0) - discount)}
          strong
        />
      </Glass>
      <Button
        title={busy ? 'Vérification serveur…' : selectedMethod === "cash" ? "Commander · espèces à régler" : "Tester le paiement et confirmer"}
        disabled={busy}
        onPress={async () => {
          if (!arrival.trim() || (mode === "Livraison" && !address.trim()))
            return Alert.alert(
              "Informations manquantes",
              "Indiquez l’heure souhaitée et, en livraison, votre adresse.",
            );
          const amount = subtotal + (mode === "Livraison" ? 1500 : 0) - discount;
          if (sessionToken && selectedMethod !== 'cash') return setError('Ce moyen de paiement n’est pas encore disponible sur le serveur. Choisissez les espèces.');
          if (selectedMethod !== "cash" && amount <= 0) {
            return Alert.alert("Total nul", "Choisissez le paiement à la réception pour confirmer une commande sans montant à tester.");
          }
          const paymentAttempt = selectedMethod === "cash" ? null : simulatePayment({ methodId: selectedMethod, scenario: paymentScenario, amount });
          if (paymentAttempt?.status === "test_failed") {
            return Alert.alert("Paiement test refusé", `Aucun débit ni commande créée. Référence : ${paymentAttempt.reference}`);
          }
          if (paymentAttempt?.status === "test_pending") {
            return Alert.alert("Paiement test en attente", `Aucun débit ni commande créée. Référence : ${paymentAttempt.reference}`);
          }
          setBusy(true); setError('');
          try { await placeOrder({ mode, arrival: arrival.trim(), address: address.trim(), district, phone, usePoints, paymentAttempt }); }
          catch (reason) { setError(reason.message); }
          finally { setBusy(false); }
        }}
        style={{ marginTop: 20 }}
      />
      {error ? <Text style={{ color: colors.red, marginTop: 10 }}>{error}</Text> : null}
      <Text
        style={{
          color: colors.muted,
          textAlign: "center",
          fontSize: 12,
          marginTop: 12,
        }}
      >
        {sessionToken ? 'La commande n’existe que lorsque le serveur renvoie son identifiant. Espèces à régler ; aucun paiement électronique confirmé.' : "Simulation locale : aucun paiement n'est débité et aucune commande n'est envoyée au restaurant."}
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
      title={order?.source === 'server' ? 'Commande reçue par le serveur' : 'Commande de démonstration'}
      subtitle={order?.source === 'server' ? `Statut serveur : ${order.status}. Le restaurant doit encore accepter la commande.` : 'Votre commande de démonstration a été enregistrée sur cet appareil.'}
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
          {order?.source === 'server' ? 'Le serveur a créé cette commande. Son acceptation et son paiement restent à confirmer.' : "Nous avons conservé les détails localement. Aucun restaurant n'a reçu cette commande."}
        </Text>
      </Glass>
      {order && (
        <Glass style={{ padding: 18, marginTop: 15 }}>
          <Summary label="Restaurant" value={getRestaurant(order.restaurantId).name} />
          <Summary label="Réception" value={order.mode} />
          <Summary label="Heure souhaitée" value={order.arrival} />
          <Summary label="Paiement" value={order.payment} />
          <Summary
            label="État du paiement"
            value={order.paymentStatus || "Non renseigné"}
          />
          {order.paymentTest && <Summary label="Référence du test" value={order.paymentTest.reference} />}
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
  const { data, go, tab, sessionToken } = useApp();
  const [filter, setFilter] = useState("Toutes");
  const list = data.orders.filter(
    (order) => filter === "Toutes" || order.status.includes(filter),
  );
  return (
    <Page
      title="Mes commandes"
      subtitle={sessionToken ? 'Statuts reçus du serveur lors de la dernière synchronisation.' : 'Suivez vos commandes enregistrées dans la démo.'}
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
              {new Date(order.date).toLocaleDateString("fr-CD", { timeZone: "Africa/Kinshasa" })} ·{" "}
              {order.items.length} plat{order.items.length > 1 ? "s" : ""} ·{" "}
              {order.mode}
            </Text>
            <Text style={{ color: colors.gold, marginTop: 4, fontWeight: '700' }}>{getRestaurant(order.restaurantId).name}</Text>
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
      subtitle={new Date(order.date).toLocaleString("fr-CD", { timeZone: "Africa/Kinshasa" })}
      onBack={back}
    >
      <Glass style={{ padding: 18 }}>
        <Text style={{ color: colors.gold, fontWeight: '800', marginBottom: 6 }}>Restaurant : {getRestaurant(order.restaurantId).name}</Text>
        <Text style={{ color: colors.gold, fontSize: 13, fontWeight: "800" }}>
          ● {order.status}
        </Text>
        <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 20 }}>
          {order.source === 'server' ? 'Statut transmis par le serveur lors de la dernière synchronisation.' : "Ce suivi est une simulation locale. Le statut réel sera disponible après connexion à l'API."}
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
        {order.paymentTest && <Summary label="Référence du test" value={order.paymentTest.reference} />}
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
          body="La démo crédite 10 points par tranche de 1 000 CDF."
        />
        <InfoRow
          icon="gift-outline"
          title="Profitez"
          body="Échangez 10 points contre 100 CDF lors du paiement démo."
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
              {item.id} · {new Date(item.date).toLocaleDateString("fr-CD", { timeZone: "Africa/Kinshasa" })}
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
  const restaurantId = data.restaurantFilter;
  const restaurant = restaurants.find(item => item.id === restaurantId);
  const games = getGamesForRestaurant(restaurantId);
  const lastSpin = data.lastSpin?.[restaurantId];
  const available = lastSpin !== new Date().toDateString();
  if (!restaurant) return <Page title="Choisir un restaurant" onBack={back}><Button title="Voir les restaurants" onPress={() => go('home')} /></Page>;
  return <Page title={`Jeux · ${restaurant.name}`} subtitle="Les jeux de cet établissement uniquement." onBack={back}>
    {games.map(game => {
      const result = data.gameResults?.[restaurantId]?.[game.id];
      const enabled = playable(game);
      const icon = game.type === 'quiz' ? 'help-circle-outline' : game.type === 'memory' ? 'apps-outline' : 'gift-outline';
      return <Glass key={game.id} style={{ padding: 20, marginBottom: 13 }}><Icon name={icon} size={32} /><Text style={{ color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 10 }}>{game.title}</Text><Text style={{ color: colors.muted, marginVertical: 9, lineHeight: 20 }}>{game.description}</Text>{result && <Text style={{ color: colors.gold, marginBottom: 10 }}>Meilleur résultat : {game.type === 'memory' ? `${result.best} essais` : `${result.best}/${game.questions?.length || 0}`}</Text>}<Button title={game.type === 'wheel' && !available ? 'Revenir demain' : enabled ? 'Jouer' : 'Disponible prochainement'} disabled={!enabled || game.type === 'wheel' && !available} onPress={() => go(game.type === 'wheel' ? 'wheel' : game.type, { id: game.id })} /></Glass>;
    })}
    {!games.length && <Glass style={{ padding: 20 }}><Text style={{ color: colors.muted }}>Aucun jeu publié pour ce restaurant.</Text></Glass>}
    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>Quiz et paires : scores conservés sur cet appareil, sans récompense réelle. La roue utilise des points de démonstration.</Text>
  </Page>;
}

function QuizGame({ params }) {
  const { data, setData, back } = useApp();
  const restaurantId = data.restaurantFilter;
  const game = getGamesForRestaurant(restaurantId).find(item => item.id === params?.id && item.type === 'quiz');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const answerLock = useRef(false);
  useEffect(() => { answerLock.current = false; }, [index]);
  const question = playable(game) ? game.questions[index] : null;
  const answer = () => {
    if (selected === null || !question || answerLock.current) return;
    answerLock.current = true;
    const nextScore = score + Number(selected === question.answer);
    setScore(nextScore);
    if (index + 1 === game.questions.length) {
      setFinished(true);
      setData(current => {
        const scoped = current.gameResults?.[restaurantId] || {};
        const previous = scoped[game.id];
        return { ...current, gameResults: { ...current.gameResults, [restaurantId]: { ...scoped, [game.id]: { best: Math.max(previous?.best || 0, nextScore), plays: (previous?.plays || 0) + 1 } } } };
      });
    } else { setIndex(index + 1); setSelected(null); }
  };
  if (!question) return <Page title="Jeu indisponible" onBack={back}><Text style={{ color: colors.muted }}>Ce quiz n’est pas publié pour le restaurant sélectionné.</Text></Page>;
  return <Page title={game.title} subtitle={`${getRestaurant(restaurantId).name} · question ${index + 1}/${game.questions.length}`} onBack={back}>
    {finished ? <Glass style={{ padding: 22 }}><Icon name="trophy-outline" size={36} /><Text style={{ color: colors.text, fontSize: 24, fontWeight: '900', marginVertical: 12 }}>Score : {score}/{game.questions.length}</Text><Text style={{ color: colors.muted, marginBottom: 17 }}>Ce résultat est enregistré uniquement sur cet appareil.</Text><Button title="Rejouer" onPress={() => { answerLock.current = false; setIndex(0); setScore(0); setSelected(null); setFinished(false); }} /></Glass> : <Glass style={{ padding: 20 }}><Text style={{ color: colors.gold, fontWeight: '800' }}>QUIZ GOURMAND</Text><Text style={{ color: colors.text, fontSize: 20, fontWeight: '900', marginVertical: 17 }}>{question.question}</Text>{question.options.map((option, optionIndex) => <Pressable key={`${optionIndex}-${option}`} accessibilityRole="radio" accessibilityState={{ selected: selected === optionIndex }} onPress={() => setSelected(optionIndex)} style={{ padding: 15, marginBottom: 9, borderWidth: 1, borderColor: selected === optionIndex ? colors.gold : '#5b5648', borderRadius: 14, backgroundColor: selected === optionIndex ? '#4b3d28' : '#242623' }}><Text style={{ color: colors.text }}>{option}</Text></Pressable>)}<Button title={index + 1 === game.questions.length ? 'Voir mon score' : 'Valider et continuer'} disabled={selected === null} onPress={answer} style={{ marginTop: 9 }} /></Glass>}
  </Page>;
}

const shufflePairs = pairs => [...pairs.flatMap((pair, index) => [{ id: `${index}-a`, pair }, { id: `${index}-b`, pair }])].sort(() => Math.random() - .5);

function MemoryGame({ params }) {
  const { data, setData, back } = useApp();
  const restaurantId = data.restaurantFilter;
  const game = getGamesForRestaurant(restaurantId).find(item => item.id === params?.id && item.type === 'memory');
  const pairs = playable(game) ? game.pairs : [];
  const [cards, setCards] = useState(() => shufflePairs(pairs));
  const [opened, setOpened] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const saved = useRef(false);
  useEffect(() => {
    if (opened.length !== 2) return undefined;
    const first = cards.find(card => card.id === opened[0]);
    const second = cards.find(card => card.id === opened[1]);
    if (first?.pair === second?.pair) { setMatched(current => [...current, first.pair]); setOpened([]); return undefined; }
    const timer = setTimeout(() => setOpened([]), 850);
    return () => clearTimeout(timer);
  }, [opened, cards]);
  useEffect(() => {
    if (!pairs.length || matched.length !== pairs.length || saved.current) return;
    saved.current = true;
    setData(current => {
      const scoped = current.gameResults?.[restaurantId] || {};
      const previous = scoped[game.id];
      return { ...current, gameResults: { ...current.gameResults, [restaurantId]: { ...scoped, [game.id]: { best: previous ? Math.min(previous.best, moves) : moves, plays: (previous?.plays || 0) + 1 } } } };
    });
  }, [matched.length, pairs.length, moves, restaurantId, game?.id, setData]);
  const pick = card => {
    if (opened.length >= 2 || opened.includes(card.id) || matched.includes(card.pair)) return;
    const next = [...opened, card.id];
    setOpened(next);
    if (next.length === 2) setMoves(value => value + 1);
  };
  if (!pairs.length) return <Page title="Jeu indisponible" onBack={back}><Text style={{ color: colors.muted }}>Ce jeu de mémoire n’est pas publié pour le restaurant sélectionné.</Text></Page>;
  const finished = matched.length === pairs.length;
  return <Page title={game.title} subtitle={`${getRestaurant(restaurantId).name} · ${moves} essai${moves > 1 ? 's' : ''}`} onBack={back}>
    <Glass style={{ padding: 19 }}><Text style={{ color: colors.muted, marginBottom: 15 }}>Retournez deux cartes pour retrouver les plats identiques.</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'center' }}>{cards.map(card => { const shown = opened.includes(card.id) || matched.includes(card.pair); return <Pressable key={card.id} accessibilityRole="button" accessibilityLabel={shown ? card.pair : 'Carte cachée'} onPress={() => pick(card)} style={{ width: '30%', minHeight: 82, justifyContent: 'center', alignItems: 'center', padding: 8, borderWidth: 1, borderColor: shown ? colors.gold : '#5b5648', borderRadius: 14, backgroundColor: shown ? '#4b3d28' : '#242623' }}><Text style={{ color: colors.text, textAlign: 'center', fontWeight: '800' }}>{shown ? card.pair : '✦'}</Text></Pressable>; })}</View>{finished && <><Text style={{ color: colors.gold, fontSize: 18, fontWeight: '900', marginVertical: 15 }}>Bravo ! Toutes les paires trouvées en {moves} essais.</Text><Button title="Rejouer" onPress={() => { saved.current = false; setCards(shufflePairs(pairs)); setOpened([]); setMatched([]); setMoves(0); }} /></>}</Glass>
    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 13 }}>Votre meilleur résultat reste sur cet appareil et ne donne pas de points réels.</Text>
  </Page>;
}

function Wheel() {
  const { data, setData, back } = useApp();
  const restaurantId = data.restaurantFilter;
  const wheelPublished = getGamesForRestaurant(restaurantId).some(game => game.type === 'wheel');
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const lastSpin = data.lastSpin?.[restaurantId];
  const available = lastSpin !== new Date().toDateString();
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
        lastSpin: { ...(current.lastSpin && typeof current.lastSpin === 'object' ? current.lastSpin : {}), [restaurantId]: new Date().toDateString() },
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
  if (!wheelPublished) return <Page title="Jeux du restaurant" subtitle={getRestaurant(restaurantId).name} onBack={back}><Glass style={{ padding: 20 }}><Text style={{ color: colors.muted }}>La roue n’est pas publiée pour ce restaurant.</Text></Glass></Page>;
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

function Profile({ onOpenEmployee }) {
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
      <Button
        title="Ouvrir l’espace employé · démo"
        variant="secondary"
        icon="briefcase-outline"
        onPress={onOpenEmployee}
        style={{ marginTop: 18 }}
      />
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
