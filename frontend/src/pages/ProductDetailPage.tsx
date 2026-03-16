import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAppContext } from "../state/AppContext";
import type { Product } from "../types";

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, refreshCartCount } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api<Product>(`/products/${id}`)
      .then(setProduct)
      .catch((error: Error) => setMessage(error.message));
  }, [id]);

  const addToCart = async () => {
    if (!token) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    await api("/cart/items", {
      method: "POST",
      token,
      body: JSON.stringify({ productId: Number(id), quantity })
    });
    await refreshCartCount();
    setMessage("カートに追加しました。");
  };

  if (!product) {
    return <p>{message ?? "読み込み中..."}</p>;
  }

  return (
    <section className="detail-layout">
      <img src={product.imageUrl} alt={product.name} className="detail-image" />
      <div className="stack">
        <span className="pill">{product.category.name}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <strong>¥{Number(product.price).toLocaleString()}</strong>
        <p>在庫: {product.inventory?.stock ?? 0}</p>
        <div className="inline-form">
          <input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          <button className="primary-button" onClick={addToCart}>
            カートに追加
          </button>
        </div>
        {message && <p>{message}</p>}
      </div>
    </section>
  );
}
