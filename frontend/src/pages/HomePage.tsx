import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Category, Product } from "../types";

type ProductListResponse = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
};

export function HomePage() {
  const [products, setProducts] = useState<ProductListResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    Promise.all([
      api<ProductListResponse>(`/products${query ? `?${query}` : ""}`),
      api<Category[]>("/categories")
    ])
      .then(([productResponse, categoryResponse]) => {
        setProducts(productResponse);
        setCategories(categoryResponse);
      })
      .catch((err: Error) => setError(err.message));
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== "page") {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  return (
    <section className="stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Portfolio-ready full stack demo</p>
          <h1>商品・注文・在庫をひとつの画面群で管理する小規模ECシステム</h1>
          <p>React + Express + Prisma + MySQL で、ユーザー購買フローと管理業務フローを一体で確認できます。</p>
        </div>
      </div>

      <div className="panel filters">
        <input
          placeholder="キーワード検索"
          defaultValue={searchParams.get("keyword") ?? ""}
          onBlur={(event) => updateParam("keyword", event.target.value)}
        />
        <select value={searchParams.get("categoryId") ?? ""} onChange={(event) => updateParam("categoryId", event.target.value)}>
          <option value="">すべてのカテゴリ</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select value={searchParams.get("sort") ?? "newest"} onChange={(event) => updateParam("sort", event.target.value)}>
          <option value="newest">新着順</option>
          <option value="popularity">人気順</option>
          <option value="priceAsc">価格が安い順</option>
          <option value="priceDesc">価格が高い順</option>
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card-grid">
        {products?.items.map((product) => (
          <article key={product.id} className="product-card">
            <img src={product.imageUrl} alt={product.name} />
            <div className="stack compact">
              <span className="pill">{product.category.name}</span>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <strong>¥{Number(product.price).toLocaleString()}</strong>
              <small>在庫: {product.inventory?.stock ?? 0}</small>
              <Link className="primary-button" to={`/products/${product.id}`}>
                詳細を見る
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
