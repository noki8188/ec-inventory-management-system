import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAppContext } from "../../state/AppContext";
import type { Order } from "../../types";

const nextStatuses = ["CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"] as const;

export function AdminOrdersPage() {
  const { token } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);

  const load = async () => {
    const result = await api<Order[]>("/admin/orders", { token });
    setOrders(result);
  };

  useEffect(() => {
    load().catch(console.error);
  }, [token]);

  const updateStatus = async (orderId: number, status: string) => {
    await api(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status })
    });
    await load();
  };

  return (
    <section className="stack">
      <h1>注文管理</h1>
      {orders.map((order) => (
        <article className="panel stack compact" key={order.id}>
          <div className="section-head">
            <strong>注文 #{order.id}</strong>
            <span className="pill">{order.status}</span>
          </div>
          <p>{order.user?.name} / ¥{Number(order.totalAmount).toLocaleString()}</p>
          <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>
            <option value={order.status}>{order.status}</option>
            {nextStatuses.filter((status) => status !== order.status).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </article>
      ))}
    </section>
  );
}
