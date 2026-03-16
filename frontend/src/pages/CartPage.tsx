import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAppContext } from "../state/AppContext";
import type { CartItem } from "../types";

export function CartPage() {
  const navigate = useNavigate();
  const { token, refreshCartCount } = useAppContext();
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    const result = await api<CartItem[]>("/cart", { token });
    setItems(result);
  };

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [token]);

  const updateQuantity = async (id: number, quantity: number) => {
    await api(`/cart/items/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ quantity })
    });
    await load();
    await refreshCartCount();
  };

  const remove = async (id: number) => {
    await api(`/cart/items/${id}`, {
      method: "DELETE",
      token
    });
    await load();
    await refreshCartCount();
  };

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <section className="stack">
      <div className="section-head">
        <h1>カート</h1>
        <button className="primary-button" onClick={() => navigate("/shop/checkout")} disabled={!items.length}>
          注文確認へ
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
      <div className="stack">
        {items.map((item) => (
          <article className="panel cart-row" key={item.id}>
            <div>
              <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
              <p>¥{Number(item.product.price).toLocaleString()}</p>
            </div>
            <div className="inline-form">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
              />
              <button className="ghost-button" onClick={() => remove(item.id)}>
                削除
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="total-text">合計: ¥{total.toLocaleString()}</p>
    </section>
  );
}
