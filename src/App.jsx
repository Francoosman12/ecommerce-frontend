import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAnalytics } from "./hooks/useAnalytics";

// PÁGINAS PÚBLICAS
import Home from "./pages/public/Home";
import ProductDetail from "./pages/public/ProductDetail";
import CustomerLogin from "./pages/public/CustomerLogin";
import Register from "./pages/public/Register";
import Checkout from "./pages/public/Checkout";
import MyOrders from "./pages/public/MyOrders";
import AboutUs from "./pages/public/AboutUs";
import {
  OrderSuccess,
  OrderFailure,
  OrderPending,
} from "./pages/public/OrderStatus";
import CartSidebar from "./components/layout/CartSidebar";

// PÁGINAS ADMIN
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProductForm from "./pages/admin/ProductForm";
import CategoryManager from "./pages/admin/CategoryManager";
import FinancialManager from "./pages/admin/FinancialManager";
import OrderManager from "./pages/admin/OrderManager";
import StoreManager from "./pages/admin/StoreManager";
import SalesDashboard from "./pages/admin/SalesDashboard";
import SalesManager from "./pages/admin/SalesManager";
import ManualSaleForm from "./pages/admin/ManualSaleForm";

// GUARDS
import RequireAuth from "./components/layout/RequireAuth";
import RedirectIfAuth from "./components/layout/RedirectIfAuth";

const AppContent = () => {
  useAnalytics();

  return (
    <>
      <ToastContainer
        position="bottom-right"
        theme="colored"
        autoClose={3000}
      />
      <CartSidebar />

      <Routes>
        {/* ── ZONA PÚBLICA ── */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orden/exito/:id" element={<OrderSuccess />} />
        <Route path="/orden/fallo/:id" element={<OrderFailure />} />
        <Route path="/orden/pendiente/:id" element={<OrderPending />} />
        <Route path="/mis-pedidos" element={<MyOrders />} />
        <Route path="/nosotros" element={<AboutUs />} />

        {/* Rutas protegidas contra usuarios ya logueados */}
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <CustomerLogin />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuth>
              <Register />
            </RedirectIfAuth>
          }
        />

        {/* ── ZONA ADMIN ── */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* Admin login — si ya sos admin redirige al panel, si sos customer al home */}
        <Route
          path="/admin/login"
          element={
            <RedirectIfAuth adminOnly={true}>
              <Login />
            </RedirectIfAuth>
          }
        />

        {/* Solo admins — si sos customer te manda al home */}
        <Route element={<RequireAuth />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/edit/:id" element={<ProductForm />} />
          <Route path="/admin/categories" element={<CategoryManager />} />
          <Route path="/admin/financial" element={<FinancialManager />} />
          <Route path="/admin/orders" element={<OrderManager />} />
          <Route path="/admin/store" element={<StoreManager />} />
          <Route path="/admin/sales" element={<SalesDashboard />} />
          <Route path="/admin/sales/history" element={<SalesManager />} />
          <Route path="/admin/sales/new" element={<ManualSaleForm />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex justify-center items-center h-screen bg-cin-50">
              <h2 className="font-display text-2xl text-red-500">
                Página no encontrada
              </h2>
            </div>
          }
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
