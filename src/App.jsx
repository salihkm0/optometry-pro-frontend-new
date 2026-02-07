import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";

// Layout
import Layout from "./components/layout/Layout";

// Auth Pages
import Login from "./pages/auth/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminShops from "./pages/admin/Shops";
import AdminShopForm from "./pages/admin/Shops/ShopFormPage";
import AdminCustomers from "./pages/admin/Customers";
import AdminCustomerDetail from "./pages/admin/Customers/CustomerDetail";
import AdminRecords from "./pages/admin/Records";
import AdminRecordDetail from "./pages/admin/Records/RecordDetail";

// Shop Pages
import ShopDashboard from "./pages/shop/Dashboard";
import ShopCustomers from "./pages/shop/Customers";
import ShopCustomerDetail from "./pages/shop/Customers/CustomerDetail";
import ShopRecords from "./pages/shop/Records";
import ShopRecordDetail from "./pages/shop/Records/RecordDetail";

// Form Pages
import CustomerFormPage from "./pages/shared/CustomerFormPage";
import RecordFormPage from "./pages/shared/RecordFormPage";
import AdminSettings from "./pages/admin/Settings";
import ShopSettings from "./pages/shop/Settings";
import BillingPage from "./pages/shop/Billing/Billing";
import BillingList from "./pages/shop/Billing/BillingList";
import BillingDetails from "./pages/shop/Billing/BillingDetails";

function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (
    requiredRole === "admin" &&
    !["super_admin", "admin"].includes(user?.role)
  ) {
    return <Navigate to="/shop/dashboard" />;
  }

  if (
    requiredRole === "shop" &&
    !["shop_owner", "optometrist", "assistant", "receptionist"].includes(
      user?.role,
    )
  ) {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="shops" element={<AdminShops />} />
          <Route path="shops/new" element={<AdminShopForm />} />
          <Route path="shops/edit/:id" element={<AdminShopForm />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="customers/new" element={<CustomerFormPage />} />
          <Route path="customers/edit/:id" element={<CustomerFormPage />} />
          <Route path="records" element={<AdminRecords />} />
          <Route path="records/:id" element={<AdminRecordDetail />} />
          <Route path="records/new" element={<RecordFormPage />} />
          <Route path="records/edit/:id" element={<RecordFormPage />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Shop Routes */}
        <Route
          path="/shop"
          element={
            <ProtectedRoute requiredRole="shop">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<ShopDashboard />} />
          <Route path="customers" element={<ShopCustomers />} />
          <Route path="customers/:id" element={<ShopCustomerDetail />} />
          <Route path="customers/new" element={<CustomerFormPage />} />
          <Route path="customers/edit/:id" element={<CustomerFormPage />} />
          <Route path="records" element={<ShopRecords />} />
          <Route path="records/:id" element={<ShopRecordDetail />} />
          <Route path="records/new" element={<RecordFormPage />} />
          <Route path="records/edit/:id" element={<RecordFormPage />} />
          <Route path="settings" element={<ShopSettings />} />
          <Route path="billing" element={<BillingList />} />
          <Route path="billing/new" element={<BillingPage />} />
          <Route path="billing/:id" element={<BillingDetails />} />
          <Route path="billing/edit/:id" element={<BillingPage />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
