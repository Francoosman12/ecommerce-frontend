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

import RequireAuth from "./components/layout/RequireAuth";

// Componente interno para usar useAnalytics dentro del Router
const AppContent = () => {
  useAnalytics(); // Trackea cada cambio de ruta automáticamente

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
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orden/exito/:id" element={<OrderSuccess />} />
        <Route path="/orden/fallo/:id" element={<OrderFailure />} />
        <Route path="/orden/pendiente/:id" element={<OrderPending />} />

        {/* ── ZONA ADMIN ── */}
        <Route path="/admin" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/edit/:id" element={<ProductForm />} />
          <Route path="/admin/categories" element={<CategoryManager />} />
          <Route path="/admin/financial" element={<FinancialManager />} />
          <Route path="/admin/orders" element={<OrderManager />} />
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
