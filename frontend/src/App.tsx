import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RetailerLayout from "@/components/layout/RetailerLayout";
import CustomerLayout from "@/components/layout/CustomerLayout";
import Dashboard from "@/pages/retailer/Dashboard";
import Products from "@/pages/retailer/Products";
import AddStock from "@/pages/retailer/AddStock";
import StockHistory from "@/pages/retailer/StockHistory";
import NewSale from "@/pages/retailer/NewSale";
import SaleHistory from "@/pages/retailer/SaleHistory";
import Discounts from "@/pages/retailer/Discounts";
import Analytics from "@/pages/retailer/Analytics";
import RetailerProfile from "@/pages/retailer/Profile";
import CustomerHome from "@/pages/customer/Home";
import MyItems from "@/pages/customer/MyItems";
import Notifications from "@/pages/customer/Notifications";
import ClaimPurchase from "@/pages/customer/ClaimPurchase";
import CustomerProfile from "@/pages/customer/Profile";
import CustomerSettings from "@/pages/customer/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'retailer' ? '/retailer' : '/customer'} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Retailer routes */}
            <Route path="/retailer" element={<ProtectedRoute role="retailer"><RetailerLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="add-stock" element={<AddStock />} />
              <Route path="stock-history" element={<StockHistory />} />
              <Route path="new-sale" element={<NewSale />} />
              <Route path="sale-history" element={<SaleHistory />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<RetailerProfile />} />
            </Route>

            {/* Customer routes */}
            <Route path="/customer" element={<ProtectedRoute role="customer"><CustomerLayout /></ProtectedRoute>}>
              <Route index element={<CustomerHome />} />
              <Route path="items" element={<MyItems />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="claim" element={<ClaimPurchase />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route path="settings" element={<CustomerSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
