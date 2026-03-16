import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { adminAiQuerySchema, dailyReportRequestSchema } from "../schemas/admin-ai.schema.js";
import {
  buildDailyReportData,
  executeAdminAiQuery,
  getDailyReportSnapshot,
  listDailyReportSnapshots,
  saveDailyReportSnapshot
} from "../services/admin-ai-data.service.js";
import { renderAdminAiQuery, renderDailyReport } from "../services/admin-ai-llm.service.js";
import { parseAdminAiQuery } from "../services/admin-ai-query.service.js";

export const adminAiRouter = Router();

adminAiRouter.use(authenticate, requireRole(Role.ADMIN));

adminAiRouter.post("/query", validateBody(adminAiQuerySchema), async (req, res, next) => {
  try {
    const plan = parseAdminAiQuery(req.body.message, req.body.context);

    if (plan.intent === "daily_report_generate") {
      const reportDate = plan.dateRange?.from ?? new Date();
      const existing = await getDailyReportSnapshot(reportDate);
      const report = existing
        ? {
            id: existing.id,
            summary: existing.summary,
            metrics: existing.metricsJson as {
              totalOrders: number;
              totalRevenue: number;
              lowStockCount: number;
            },
            generatedAt: existing.updatedAt
          }
        : await buildDailyReportData(reportDate);

      res.json({
        intent: "daily_report_generate",
        answer: report.summary,
        dataCards: [
          {
            title: "订单数",
            value: String(report.metrics.totalOrders ?? 0),
            description: "日报中的订单总数"
          },
          {
            title: "成交额",
            value: `¥${Math.round(report.metrics.totalRevenue ?? 0).toLocaleString()}`,
            description: "日报中的成交额"
          },
          {
            title: "低库存商品",
            value: String(report.metrics.lowStockCount ?? 0),
            description: "日报中的低库存风险数"
          }
        ],
        records: [],
        sources: ["/admin/ai/reports/daily"],
        suggestions: ["列出低库存商品", "今天有多少待发货订单", "最近 20 条库存操作日志"],
        disclaimer: "日报内容来自后台聚合快照，若需最新版本请重新生成日报。"
      });
      return;
    }

    const result = await executeAdminAiQuery(plan);
    res.json(renderAdminAiQuery(result));
  } catch (error) {
    next(error);
  }
});

adminAiRouter.post("/reports/daily", validateBody(dailyReportRequestSchema), async (req, res, next) => {
  try {
    const reportDate = req.body.date ? new Date(`${req.body.date}T00:00:00.000Z`) : new Date();
    const existing = await getDailyReportSnapshot(reportDate);

    if (existing && !req.body.regenerate) {
      const response = renderDailyReport({
        summary: existing.summary,
        metrics: existing.metricsJson as never,
        sections: existing.sectionsJson as never,
        generatedAt: existing.updatedAt
      });
      res.json({ reportId: existing.id, ...response });
      return;
    }

    const report = await buildDailyReportData(reportDate);
    const snapshot = await saveDailyReportSnapshot(req.auth!.userId, reportDate, report);
    const response = renderDailyReport({
      summary: report.summary,
      sections: report.sections,
      metrics: report.metrics,
      generatedAt: snapshot.updatedAt
    });
    res.json({ reportId: snapshot.id, ...response });
  } catch (error) {
    next(error);
  }
});

adminAiRouter.get("/reports/daily", async (req, res, next) => {
  try {
    const result = await listDailyReportSnapshots({
      dateFrom: req.query.dateFrom ? new Date(`${req.query.dateFrom}T00:00:00.000Z`) : undefined,
      dateTo: req.query.dateTo ? new Date(`${req.query.dateTo}T00:00:00.000Z`) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10
    });

    res.json({
      ...result,
      items: result.items.map((item) => ({
        id: item.id,
        reportDate: item.reportDate.toISOString().slice(0, 10),
        summary: item.summary,
        metrics: item.metricsJson,
        sections: item.sectionsJson,
        generatedAt: item.updatedAt.toISOString(),
        generatedBy: item.generatedBy
      }))
    });
  } catch (error) {
    next(error);
  }
});
