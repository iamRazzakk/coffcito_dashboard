import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import PageLoader from "./components/layout/PageLoader";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import VerifyOtp from "./pages/Auth/VerifyOtp";
import ResetPassword from "./pages/Auth/ResetPassword";

const Dashboard = lazy(() => import("./pages/Dashboard/index"));
const OrderPage = lazy(() => import("./pages/Order/index"));
const ShopPage = lazy(() => import("./pages/Shop/index"));
const ProductPage = lazy(() => import("./pages/Product/index"));
const GiftCardsPage = lazy(() => import("./pages/GiftCards/index"));
const WalletPage = lazy(() => import("./pages/Wallet/index"));
const UsersPage = lazy(() => import("./pages/Users/index"));
const SupportPage = lazy(() => import("./pages/Support/index"));
const NotificationsPage = lazy(() => import("./pages/Notifications/index"));
const SettingsPage = lazy(() => import("./pages/Settings/index"));
const ReportsPage = lazy(() => import("./pages/Reports/index"));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <LazyPage>
                <Dashboard />
              </LazyPage>
            }
          />
          <Route
            path="/orders"
            element={
              <LazyPage>
                <OrderPage />
              </LazyPage>
            }
          />
          <Route
            path="/shops"
            element={
              <LazyPage>
                <ShopPage />
              </LazyPage>
            }
          />
          <Route
            path="/products"
            element={
              <LazyPage>
                <ProductPage />
              </LazyPage>
            }
          />
          <Route
            path="/gift-cards"
            element={
              <LazyPage>
                <GiftCardsPage />
              </LazyPage>
            }
          />
          <Route
            path="/wallet"
            element={
              <LazyPage>
                <WalletPage />
              </LazyPage>
            }
          />
          <Route
            path="/users"
            element={
              <LazyPage>
                <UsersPage />
              </LazyPage>
            }
          />
          <Route
            path="/support"
            element={
              <LazyPage>
                <SupportPage />
              </LazyPage>
            }
          />
          <Route
            path="/notifications"
            element={
              <LazyPage>
                <NotificationsPage />
              </LazyPage>
            }
          />
          <Route
            path="/settings"
            element={
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            }
          />
          <Route
            path="/reports"
            element={
              <LazyPage>
                <ReportsPage />
              </LazyPage>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
