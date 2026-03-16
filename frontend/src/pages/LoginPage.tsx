import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAppContext } from "../state/AppContext";
import type { AuthUser } from "../types";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const redirectTo = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setAuth(result.token, result.user);
      navigate(redirectTo ?? (result.user.role === "ADMIN" ? "/admin" : "/"));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="auth-card">
      <h1>ログイン</h1>
      <form className="stack" onSubmit={handleSubmit}>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="メールアドレス" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="パスワード" />
        <button className="primary-button" type="submit">
          ログイン
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
      <p>
        アカウントがない場合は <Link to="/register">会員登録</Link>
      </p>
      <p className="helper-text">管理者デモ: admin@example.com / password123</p>
    </section>
  );
}
