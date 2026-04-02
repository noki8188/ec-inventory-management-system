import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppContext } from "../state/AppContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, cartCount, adminTheme, toggleAdminTheme, logout } = useAppContext();
  const isAdminPage = location.pathname.startsWith("/admin");
  const adminThemeLabel = adminTheme === "dark" ? "浅色模式" : "暗色模式";

  return (
    <div className="app-shell" data-admin-theme={isAdminPage ? adminTheme : "light"}>
      <header className="topbar">
        <Link to="/" className="brand">
          小規模EC在庫管理システム
        </Link>
        <div className="topbar-actions">
          {isAdminPage && (
            <button className="ghost-button theme-toggle" type="button" aria-pressed={adminTheme === "dark"} onClick={toggleAdminTheme}>
              管理台 {adminThemeLabel}
            </button>
          )}
          <nav className="nav-links">
            <NavLink to="/">商品</NavLink>
            <NavLink to="/shop/cart">カート ({cartCount})</NavLink>
            {user && <NavLink to="/shop/orders">注文履歴</NavLink>}
            {user?.role === "ADMIN" && <NavLink to="/admin">管理画面</NavLink>}
            {!user && <NavLink to="/login">ログイン</NavLink>}
            {!user && <NavLink to="/register">会員登録</NavLink>}
            {user && (
              <button className="ghost-button" onClick={logout}>
                {user.name} / ログアウト
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
