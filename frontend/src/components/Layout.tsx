import { Link, NavLink } from "react-router-dom";
import { useAppContext } from "../state/AppContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, cartCount, logout } = useAppContext();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          小規模EC在庫管理システム
        </Link>
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
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
