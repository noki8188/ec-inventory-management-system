import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAppContext } from "../../state/AppContext";
import type { OperationLog, Order, Product } from "../../types";

type ProductListResponse = {
  items: Product[];
  total: number;
};

export function AdminDashboardPage() {
  const { token } = useAppContext();
  const [products, setProducts] = useState<ProductListResponse | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);

  useEffect(() => {
    Promise.all([
      api<ProductListResponse>("/products?page=1&pageSize=5&sort=popularity"),
      api<Order[]>("/admin/orders", { token }),
      api<OperationLog[]>("/admin/logs", { token })
    ])
      .then(([productResponse, orderResponse, logResponse]) => {
        setProducts(productResponse);
        setOrders(orderResponse.slice(0, 5));
        setLogs(logResponse.slice(0, 5));
      })
      .catch(console.error);
  }, [token]);

  return (
    <section className="stack">
      <div className="hero-card admin-hero">
        <div>
          <p className="eyebrow">Admin console</p>
          <h1>在庫と注文をまとめて監視</h1>
        </div>
      </div>
      <div className="dashboard-grid">
        <article className="panel">
          <h2>人気商品</h2>
          <ul>{products?.items.map((product) => <li key={product.id}>{product.name}</li>)}</ul>
        </article>
        <article className="panel">
          <h2>最近の注文</h2>
          <ul>{orders.map((order) => <li key={order.id}>#{order.id} / {order.status}</li>)}</ul>
        </article>
        <article className="panel">
          <h2>操作ログ</h2>
          <ul>{logs.map((log) => <li key={log.id}>{log.description}</li>)}</ul>
        </article>
      </div>
    </section>
  );
}
