import { Navigate, Routes, Route } from 'react-router-dom'
import ApiStatus from './features/ApiStatus.jsx';
import AdminApp from './features/admin/AdminApp.jsx'
import FontSizeControl from './components/ui/FontSizeControl.jsx'
import PublicLayout from './components/layout/PublicLayout.jsx'
import { CartProvider } from './features/cart/CartContext.jsx'
import { OrdersProvider } from './features/orders/OrdersContext.jsx'
import { DemoSessionProvider } from './features/auth/DemoSession.jsx'
import HomePage from './features/menu/HomePage.jsx'
import MenuPage, { ProductDetailPage } from './features/menu/MenuPage.jsx'
import CartPage from './features/cart/CartPage.jsx'
import { CheckoutPage, OrderDetailPage, OrdersPage } from './features/orders/OrdersPages.jsx'
import { AccountPage, ForgotPasswordPage, LoginPage, RegisterPage } from './features/auth/AuthPages.jsx'
import ComplaintsPage from './features/complaints/ComplaintsPage.jsx'
import LoyaltyPage from './features/loyalty/LoyaltyPage.jsx'
import ReferralsPage from './features/referrals/ReferralsPage.jsx'
import PromotionsPage from './features/promotions/PromotionsPage.jsx'
import EventsPage from './features/events/EventsPage.jsx'
import PaymentsPage from './features/payments/PaymentsPage.jsx'

export default function App() {
  return (
    <>
      <DemoSessionProvider><CartProvider><OrdersProvider>
        <div className="application-accessibility-tools"><FontSizeControl /></div>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/loyalty" element={<LoyaltyPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
          </Route>
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/api-status" element={<ApiStatus />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OrdersProvider></CartProvider></DemoSessionProvider>
    </>
  )
}
