import type { AdminAiQueryResult, DailyReportMetrics, DailyReportSection } from "./admin-ai-data.service.js";
import type { AiIntent } from "./admin-ai-query.service.js";

export type AdminAiQueryResponse = {
  intent: AiIntent;
  answer: string;
  dataCards: AdminAiQueryResult["dataCards"];
  records: AdminAiQueryResult["records"];
  sources: string[];
  suggestions: string[];
  disclaimer: string;
};

export type DailyReportResponse = {
  summary: string;
  sections: DailyReportSection[];
  metrics: DailyReportMetrics;
  generatedAt: string;
  disclaimer: string;
};

export function renderAdminAiQuery(result: AdminAiQueryResult): AdminAiQueryResponse {
  return {
    intent: result.intent,
    answer: buildQueryAnswer(result),
    dataCards: result.dataCards,
    records: result.records,
    sources: result.sources,
    suggestions: result.suggestions,
    disclaimer: "AI Copilot 仅基于当前后台可访问数据做只读总结，请在执行运营动作前再次确认原始记录。"
  };
}

export function renderDailyReport(input: {
  summary: string;
  sections: DailyReportSection[];
  metrics: DailyReportMetrics;
  generatedAt?: Date;
}): DailyReportResponse {
  return {
    summary: input.summary,
    sections: input.sections,
    metrics: input.metrics,
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    disclaimer: "日报内容来自订单、库存和操作日志的聚合结果，适合作为运营参考，不替代人工复核。"
  };
}

function buildQueryAnswer(result: AdminAiQueryResult) {
  switch (result.intent) {
    case "low_stock_query":
      return result.records.length === 0
        ? "当前没有命中低库存阈值的商品。"
        : `当前共有 ${result.records.length} 个低库存商品，优先关注 ${result.records
            .slice(0, 3)
            .map((record) => `${record.productName}(库存 ${record.stock})`)
            .join("、")}。`;
    case "order_status_query":
      return `本次查询共找到 ${result.dataCards[0]?.value ?? "0"} 笔订单。你可以继续按状态或日期范围缩小范围。`;
    case "operation_log_query":
      return `本次查询共匹配到 ${result.dataCards[0]?.value ?? "0"} 条操作日志，建议优先检查最近的库存和订单状态变更。`;
    default:
      return String(result.answerContext.message ?? "这个问题暂不在当前 Admin AI Copilot 的支持范围内。");
  }
}
