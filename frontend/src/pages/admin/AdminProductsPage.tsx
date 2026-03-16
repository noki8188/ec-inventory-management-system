import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAppContext } from "../../state/AppContext";
import type { Category, Product } from "../../types";

const initialForm = {
  name: "",
  description: "",
  price: 1000,
  imageUrl: "https://picsum.photos/seed/new-product/600/400",
  categoryId: 1,
  stock: 10,
  lowStockThreshold: 5
};

export function AdminProductsPage() {
  const { token } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    const [productResponse, categoryResponse] = await Promise.all([
      api<Product[]>("/admin/products", { token }),
      api<Category[]>("/categories")
    ]);
    setProducts(productResponse);
    setCategories(categoryResponse);
  };

  useEffect(() => {
    load().catch(console.error);
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await api("/admin/products", {
      method: "POST",
      token,
      body: JSON.stringify(form)
    });
    setForm(initialForm);
    await load();
  };

  const remove = async (id: number) => {
    await api(`/admin/products/${id}`, { method: "DELETE", token });
    await load();
  };

  return (
    <section className="admin-split">
      <form className="panel stack" onSubmit={submit}>
        <h1>商品登録</h1>
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="商品名" />
        <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="説明" />
        <input
          type="number"
          value={form.price}
          onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
          placeholder="価格"
        />
        <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: Number(event.target.value) })}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} />
        <button className="primary-button" type="submit">
          登録する
        </button>
      </form>

      <div className="stack">
        <h1>商品一覧</h1>
        {products.map((product) => (
          <article className="panel cart-row" key={product.id}>
            <div>
              <strong>{product.name}</strong>
              <p>在庫: {product.inventory?.stock ?? 0}</p>
            </div>
            <button className="ghost-button" onClick={() => remove(product.id)}>
              削除
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
