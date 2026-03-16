import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAppContext } from "../../state/AppContext";
import type { AdminAiQueryResponse, DailyReportSnapshot, OperationLog, Order } from "../../types";

type LowStockItem = {
  id: number;
  stock: number;
  lowStockThreshold: number;
};

type DailyReportResponse = {
  reportId: number;
  summary: string;
  sections: DailyReportSnapshot["sections"];
  metrics: DailyReportSnapshot["metrics"];
  generatedAt: string;
  disclaimer: string;
};

const quickPrompts = ["列出低库存商品", "今天有多少待发货订单", "最近 20 条库存操作日志"];

export function AdminAiCopilotPage() {
  const { token } = useAppContext();
  const [message, setMessage] = useState(quickPrompts[0]);
  const [queryResult, setQueryResult] = useState<AdminAiQueryResponse | null>(null);
  const [report, setReport] = useState<DailyReportResponse | null>(null);
  const [history, setHistory] = useState<DailyReportSnapshot[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [todayLogCount, setTodayLogCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const loadSidebar = async () => {
    const [lowStock, orders, logs, reportHistory] = await Promise.all([
      api<LowStockItem[]>("/admin/inventory/low-stock", { token }),
      api<Order[]>("/admin/orders", { token }),
      api<OperationLog[]>("/admin/logs", { token }),
      api<{ items: DailyReportSnapshot[] }>("/admin/ai/reports/daily", { token })
    ]);
    const today = new Date().toISOString().slice(0, 10);
    setLowStockCount(lowStock.length);
    setPendingOrders(orders.filter((order) => order.status === "CONFIRMED").length);
    setTodayLogCount(logs.filter((log) => log.createdAt.slice(0, 10) === today).length);
    setHistory(reportHistory.items);
  };

  useEffect(() => {
    loadSidebar().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "加载 AI Copilot 数据失败");
    });
  }, [token]);

  const submitQuery = async (event?: FormEvent) => {
    event?.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await api<AdminAiQueryResponse>("/admin/ai/query", {
        method: "POST",
        token,
        body: JSON.stringify({ message })
      });
      setQueryResult(result);
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : "查询失败");
    } finally {
      setSubmitting(false);
    }
  };

  const generateTodayReport = async () => {
    setGeneratingReport(true);
    setError(null);
    try {
      const result = await api<DailyReportResponse>("/admin/ai/reports/daily", {
        method: "POST",
        token,
        body: JSON.stringify({})
      });
      setReport(result);
      await loadSidebar();
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "日报生成失败");
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <section className="stack">
      <div className="hero-card admin-hero">
        <div className="stack compact">
          <p className="eyebrow">Admin AI Copilot</p>
          <h1>用自然语言查看库存、订单和运营日报</h1>
          <p>Copilot 会复用当前后台数据做只读分析，不会直接修改库存或订单状态。</p>
        </div>
      </div>

      <div className="admin-ai-layout">
        <div className="stack">
          <form className="panel stack" onSubmit={submitQuery}>
            <div className="section-head">
              <h2>Copilot 查询</h2>
              <button className="primary-button" type="submit" disabled={submitting}>
                {submitting ? "查询中..." : "发送问题"}
              </button>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="例如：今天有多少待发货订单？"
            />
            <div className="chip-row">
              {quickPrompts.map((prompt) => (
                <button key={prompt} type="button" className="ghost-button" onClick={() => setMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            {error && <p className="error-text">{error}</p>}
          </form>

          <div className="panel stack">
            <div className="section-head">
              <h2>AI 回答</h2>
              {queryResult?.intent && <span className="pill">{queryResult.intent}</span>}
            </div>
            <p>{queryResult?.answer ?? "提交问题后，这里会显示总结结果、关键指标和原始数据。"}</p>

            {queryResult?.dataCards?.length ? (
              <div className="card-grid">
                {queryResult.dataCards.map((card) => (
                  <article className="metric-card" key={card.title}>
                    <strong>{card.title}</strong>
                    <div className="metric-value">{card.value}</div>
                    <p>{card.description}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {queryResult?.records?.length ? (
              <div className="stack compact">
                <h3>原始数据</h3>
                <div className="table-shell">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(queryResult.records[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.records.map((record, index) => (
                        <tr key={`${queryResult.intent}-${index}`}>
                          {Object.entries(record).map(([key, value]) => (
                            <td key={key}>{value ?? "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {queryResult?.suggestions?.length ? (
              <div className="stack compact">
                <h3>推荐继续问</h3>
                <div className="chip-row">
                  {queryResult.suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" className="ghost-button" onClick={() => setMessage(suggestion)}>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {queryResult?.disclaimer && <p className="helper-text">{queryResult.disclaimer}</p>}
          </div>
        </div>

        <aside className="stack">
          <div className="panel stack">
            <h2>快捷分析</h2>
            <article className="metric-card">
              <strong>低库存商品</strong>
              <div className="metric-value">{lowStockCount}</div>
              <p>来自当前低库存接口的实时统计</p>
            </article>
            <article className="metric-card">
              <strong>待发货订单</strong>
              <div className="metric-value">{pendingOrders}</div>
              <p>按 `CONFIRMED` 状态统计</p>
            </article>
            <article className="metric-card">
              <strong>今日操作日志</strong>
              <div className="metric-value">{todayLogCount}</div>
              <p>帮助快速感知后台操作活跃度</p>
            </article>
          </div>

          <div className="panel stack">
            <div className="section-head">
              <h2>运营日报</h2>
              <button className="primary-button" type="button" disabled={generatingReport} onClick={generateTodayReport}>
                {generatingReport ? "生成中..." : "生成今日日报"}
              </button>
            </div>
            {report ? (
              <>
                <p>{report.summary}</p>
                <div className="card-grid">
                  <article className="metric-card">
                    <strong>订单数</strong>
                    <div className="metric-value">{report.metrics.totalOrders}</div>
                    <p>当日报告订单总数</p>
                  </article>
                  <article className="metric-card">
                    <strong>成交额</strong>
                    <div className="metric-value">¥{Math.round(report.metrics.totalRevenue).toLocaleString()}</div>
                    <p>按订单金额汇总</p>
                  </article>
                  <article className="metric-card">
                    <strong>低库存商品</strong>
                    <div className="metric-value">{report.metrics.lowStockCount}</div>
                    <p>当前待关注库存风险</p>
                  </article>
                </div>
                <div className="stack compact">
                  {report.sections.map((section) => (
                    <article key={section.title}>
                      <strong>{section.title}</strong>
                      <p>{section.body}</p>
                    </article>
                  ))}
                </div>
                <p className="helper-text">{report.disclaimer}</p>
              </>
            ) : (
              <p>点击“生成今日日报”后，这里会展示按订单、库存和日志聚合的日报摘要。</p>
            )}
          </div>
        </aside>
      </div>

      <div className="panel stack">
        <h2>日报历史</h2>
        {history.length === 0 ? (
          <p>还没有保存的日报。</p>
        ) : (
          history.map((item) => (
            <article className="panel stack compact report-history-item" key={item.id}>
              <div className="section-head">
                <strong>{item.reportDate}</strong>
                <span className="pill">#{item.id}</span>
              </div>
              <p>{item.summary}</p>
              <small>生成时间：{new Date(item.generatedAt).toLocaleString()}</small>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
