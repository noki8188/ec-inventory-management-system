import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAppContext } from "../../state/AppContext";

type LowStockItem = {
  id: number;
  stock: number;
  lowStockThreshold: number;
  product: {
    id: number;
    name: string;
    category: { name: string };
  };
};

export function AdminInventoryPage() {
  const { token } = useAppContext();
  const [items, setItems] = useState<LowStockItem[]>([]);

  const load = async () => {
    const result = await api<LowStockItem[]>("/admin/inventory/low-stock", { token });
    setItems(result);
  };

  useEffect(() => {
    load().catch(console.error);
  }, [token]);

  const update = async (productId: number, stock: number, lowStockThreshold: number) => {
    await api(`/admin/products/${productId}/inventory`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ stock, lowStockThreshold })
    });
    await load();
  };

  return (
    <section className="stack">
      <h1>低在庫アラート</h1>
      {items.map((item) => (
        <article className="panel cart-row" key={item.id}>
          <div>
            <strong>{item.product.name}</strong>
            <p>{item.product.category.name}</p>
          </div>
          <div className="inline-form">
            <span>在庫 {item.stock}</span>
            <button className="primary-button" onClick={() => update(item.product.id, item.stock + 10, item.lowStockThreshold)}>
              +10 補充
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
