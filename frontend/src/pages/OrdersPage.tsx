import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAppContext } from "../state/AppContext";
import type { Order } from "../types";

export function OrdersPage() {
  const { token } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api<Order[]>("/orders", { token }).then(setOrders).catch(console.error);
  }, [token]);

  return (
    <section className="stack">
      <h1>注文履歴</h1>
      {orders.map((order) => (
        <article className="panel stack compact" key={order.id}>
          <div className="section-head">
            <strong>注文 #{order.id}</strong>
            <span className="pill">{order.status}</span>
          </div>
          <p>配送先: {order.shippingName} / {order.shippingAddress}</p>
          <p>合計: ¥{Number(order.totalAmount).toLocaleString()}</p>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.productName} x {item.quantity}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
