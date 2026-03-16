import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAppContext } from "../state/AppContext";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { token, refreshCartCount } = useAppContext();
  const [form, setForm] = useState({ shippingName: "", shippingPhone: "", shippingAddress: "" });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api("/orders", {
        method: "POST",
        token,
        body: JSON.stringify(form)
      });
      await refreshCartCount();
      navigate("/shop/orders");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="auth-card">
      <h1>注文確認</h1>
      <form className="stack" onSubmit={handleSubmit}>
        <input value={form.shippingName} onChange={(event) => setForm({ ...form, shippingName: event.target.value })} placeholder="受取人名" />
        <input value={form.shippingPhone} onChange={(event) => setForm({ ...form, shippingPhone: event.target.value })} placeholder="電話番号" />
        <textarea
          value={form.shippingAddress}
          onChange={(event) => setForm({ ...form, shippingAddress: event.target.value })}
          placeholder="配送先住所"
        />
        <button className="primary-button" type="submit">
          注文を作成
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
