import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAppContext } from "../state/AppContext";
import type { AuthUser } from "../types";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAppContext();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const result = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setAuth(result.token, result.user);
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="auth-card">
      <h1>会員登録</h1>
      <form className="stack" onSubmit={handleSubmit}>
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="氏名" />
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="メールアドレス" />
        <input
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          type="password"
          placeholder="パスワード"
        />
        <button className="primary-button" type="submit">
          登録する
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
