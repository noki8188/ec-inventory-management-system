import { NavLink, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminInventoryPage } from "./pages/admin/AdminInventoryPage";
import { AdminLogsPage } from "./pages/admin/AdminLogsPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";

function AdminNav() {
  return (
    <div className="subnav">
      <NavLink to="/admin">ダッシュボード</NavLink>
      <NavLink to="/admin/products">商品</NavLink>
      <NavLink to="/admin/inventory">在庫</NavLink>
      <NavLink to="/admin/orders">注文</NavLink>
      <NavLink to="/admin/logs">ログ</NavLink>
    </div>
  );
}

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/shop/cart" element={<CartPage />} />
          <Route path="/shop/checkout" element={<CheckoutPage />} />
          <Route path="/shop/orders" element={<OrdersPage />} />
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route
            path="/admin"
            element={
              <>
                <AdminNav />
                <AdminDashboardPage />
              </>
            }
          />
          <Route
            path="/admin/products"
            element={
              <>
                <AdminNav />
                <AdminProductsPage />
              </>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <>
                <AdminNav />
                <AdminInventoryPage />
              </>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <>
                <AdminNav />
                <AdminOrdersPage />
              </>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <>
                <AdminNav />
                <AdminLogsPage />
              </>
            }
          />
        </Route>
      </Routes>
    </Layout>
  );
}
