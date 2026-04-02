import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { AuthUser, CartItem } from "../types";

type AppContextValue = {
  token: string | null;
  user: AuthUser | null;
  cartCount: number;
  adminTheme: "light" | "dark";
  setAuth: (token: string | null, user: AuthUser | null) => void;
  setAdminTheme: (theme: "light" | "dark") => void;
  toggleAdminTheme: () => void;
  refreshMe: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
  logout: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const TOKEN_KEY = "small-ec-token";
const USER_KEY = "small-ec-user";
const ADMIN_THEME_KEY = "small-ec-admin-theme";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });
  const [adminTheme, setAdminThemeState] = useState<"light" | "dark">(() => {
    return localStorage.getItem(ADMIN_THEME_KEY) === "dark" ? "dark" : "light";
  });
  const [cartCount, setCartCount] = useState(0);

  const setAdminTheme = (theme: "light" | "dark") => {
    setAdminThemeState(theme);
    localStorage.setItem(ADMIN_THEME_KEY, theme);
  };

  const toggleAdminTheme = () => {
    setAdminTheme(adminTheme === "dark" ? "light" : "dark");
  };

  const setAuth = (nextToken: string | null, nextUser: AuthUser | null) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken && nextUser) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setCartCount(0);
    }
  };

  const refreshMe = async () => {
    if (!token) return;
    const me = await api<AuthUser>("/auth/me", { token });
    setUser(me);
    localStorage.setItem(USER_KEY, JSON.stringify(me));
  };

  const refreshCartCount = async () => {
    if (!token) {
      setCartCount(0);
      return;
    }
    const items = await api<CartItem[]>("/cart", { token });
    setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
  };

  const logout = () => setAuth(null, null);

  useEffect(() => {
    void refreshCartCount();
  }, [token]);

  const value = {
    token,
    user,
    cartCount,
    adminTheme,
    setAuth,
    setAdminTheme,
    toggleAdminTheme,
    refreshMe,
    refreshCartCount,
    logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("AppContext is not available.");
  }
  return value;
}
