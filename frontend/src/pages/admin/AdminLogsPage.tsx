import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAppContext } from "../../state/AppContext";
import type { OperationLog } from "../../types";

export function AdminLogsPage() {
  const { token } = useAppContext();
  const [logs, setLogs] = useState<OperationLog[]>([]);

  useEffect(() => {
    api<OperationLog[]>("/admin/logs", { token }).then(setLogs).catch(console.error);
  }, [token]);

  return (
    <section className="stack">
      <h1>操作ログ</h1>
      {logs.map((log) => (
        <article className="panel stack compact" key={log.id}>
          <strong>{log.type}</strong>
          <p>{log.description}</p>
          <small>{new Date(log.createdAt).toLocaleString()}</small>
        </article>
      ))}
    </section>
  );
}
