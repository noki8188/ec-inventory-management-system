import { OperationType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { listLogs, listLowStockProducts } from "./admin.service.js";
import { listAllOrders } from "./order.service.js";
import { listProducts } from "./product.service.js";
import type { AdminAiQueryPlan, AiIntent } from "./admin-ai-query.service.js";

export type AiDataCard = {
  title: string;
  value: string;
  description: string;
};

export type QueryRecord = Record<string, string | number | null>;

export type AdminAiQueryResult = {
  intent: AiIntent;
  answerContext: Record<string, unknown>;
  dataCards: AiDataCard[];
  records: QueryRecord[];
  sources: string[];
  suggestions: string[];
};

export type DailyReportSection = {
  title: string;
  body: string;
};

export type DailyReportMetrics = {
  reportDate: string;
  totalOrders: number;
  totalRevenue: number;
  orderStatusBreakdown: Record<string, number>;
  lowStockCount: number;
  logCount: number;
  topProductNames: string[];
};

export async function executeAdminAiQuery(plan: AdminAiQueryPlan): Promise<AdminAiQueryResult> {
  switch (plan.intent) {
    case "low_stock_query":
      return buildLowStockResult(plan);
    case "order_status_query":
      return buildOrderStatusResult(plan);
    case "operation_log_query":
      return buildOperationLogResult(plan);
    default:
      return {
        intent: "unsupported",
        answerContext: {
          message: "当前只支持低库存、订单状态、操作日志和运营日报相关问题。"
        },
        dataCards: [],
        records: [],
        sources: [],
        suggestions: ["列出低库存商品", "今天有多少待发货订单", "最近 10 条库存操作日志"]
      };
  }
}

export async function buildDailyReportData(reportDate: Date) {
  const [{ items: popularProducts }, orders, lowStockItems, logs] = await Promise.all([
    listProducts({ sort: "popularity", page: 1, pageSize: 5 }),
    listAllOrders(),
    listLowStockProducts(),
    listLogs()
  ]);

  const ordersForDate = orders.filter((order) => isSameDay(order.createdAt, reportDate));
  const logsForDate = logs.filter((log) => isSameDay(log.createdAt, reportDate));
  const totalRevenue = Number(
    ordersForDate.reduce((sum, order) => sum + Number(order.totalAmount), 0).toFixed(2)
  );
  const orderStatusBreakdown = ordersForDate.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  const metrics: DailyReportMetrics = {
    reportDate: toReportDate(reportDate),
    totalOrders: ordersForDate.length,
    totalRevenue,
    orderStatusBreakdown,
    lowStockCount: lowStockItems.length,
    logCount: logsForDate.length,
    topProductNames: popularProducts.map((product) => product.name)
  };

  const sections: DailyReportSection[] = [
    {
      title: "订单概览",
      body:
        ordersForDate.length === 0
          ? "当日没有新增订单。"
          : `当日新增 ${ordersForDate.length} 笔订单，成交额 ¥${Math.round(totalRevenue).toLocaleString()}，主要状态分布为 ${formatBreakdown(orderStatusBreakdown)}。`
    },
    {
      title: "库存关注",
      body:
        lowStockItems.length === 0
          ? "当前没有低库存商品。"
          : `当前共有 ${lowStockItems.length} 个低库存商品，优先关注 ${lowStockItems
              .slice(0, 3)
              .map((item) => `${item.product.name}(剩余 ${item.stock})`)
              .join("、")}。`
    },
    {
      title: "操作日志",
      body:
        logsForDate.length === 0
          ? "当日没有记录到管理操作。"
          : `当日记录 ${logsForDate.length} 条管理操作，关键动作包括 ${logsForDate
              .slice(0, 3)
              .map((log) => log.description)
              .join("；")}。`
    },
    {
      title: "热销商品",
      body:
        popularProducts.length === 0
          ? "暂无热销商品数据。"
          : `当前热销商品包括 ${popularProducts.map((product) => product.name).join("、")}。`
    }
  ];

  return {
    reportDate: startOfDay(reportDate),
    summary: [`运营日报 ${toReportDate(reportDate)}`, sections[0].body, sections[1].body].join(" "),
    metrics,
    sections
  };
}

export async function saveDailyReportSnapshot(
  adminUserId: number,
  reportDate: Date,
  payload: { summary: string; metrics: DailyReportMetrics; sections: DailyReportSection[] }
) {
  return prisma.dailyReportSnapshot.upsert({
    where: { reportDate: startOfDay(reportDate) },
    update: {
      summary: payload.summary,
      metricsJson: payload.metrics as Prisma.InputJsonValue,
      sectionsJson: payload.sections as Prisma.InputJsonValue,
      generatedByUserId: adminUserId
    },
    create: {
      reportDate: startOfDay(reportDate),
      summary: payload.summary,
      metricsJson: payload.metrics as Prisma.InputJsonValue,
      sectionsJson: payload.sections as Prisma.InputJsonValue,
      generatedByUserId: adminUserId
    },
    include: {
      generatedBy: { select: { id: true, name: true, email: true, role: true } }
    }
  });
}

export async function getDailyReportSnapshot(reportDate: Date) {
  return prisma.dailyReportSnapshot.findUnique({
    where: { reportDate: startOfDay(reportDate) },
    include: {
      generatedBy: { select: { id: true, name: true, email: true, role: true } }
    }
  });
}

export async function listDailyReportSnapshots(input: { dateFrom?: Date; dateTo?: Date; page?: number; pageSize?: number }) {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 10;
  const where: Prisma.DailyReportSnapshotWhereInput = {
    ...(input.dateFrom || input.dateTo
      ? {
          reportDate: {
            ...(input.dateFrom ? { gte: startOfDay(input.dateFrom) } : {}),
            ...(input.dateTo ? { lte: endOfDay(input.dateTo) } : {})
          }
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.dailyReportSnapshot.findMany({
      where,
      orderBy: { reportDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        generatedBy: { select: { id: true, name: true, email: true, role: true } }
      }
    }),
    prisma.dailyReportSnapshot.count({ where })
  ]);

  return { items, page, pageSize, total };
}

async function buildLowStockResult(plan: AdminAiQueryPlan): Promise<AdminAiQueryResult> {
  const lowStockItems = (await listLowStockProducts()).slice(0, plan.limit);
  return {
    intent: "low_stock_query",
    answerContext: { total: lowStockItems.length },
    dataCards: [
      {
        title: "低库存商品数",
        value: String(lowStockItems.length),
        description: "当前命中低库存阈值的商品数"
      }
    ],
    records: lowStockItems.map((item) => ({
      productName: item.product.name,
      categoryName: item.product.category.name,
      stock: item.stock,
      threshold: item.lowStockThreshold
    })),
    sources: ["/admin/inventory/low-stock"],
    suggestions: ["哪些商品最需要优先补货？", "最近 10 条库存操作日志", "生成今日日报"]
  };
}

async function buildOrderStatusResult(plan: AdminAiQueryPlan): Promise<AdminAiQueryResult> {
  const filteredOrders = (await listAllOrders())
    .filter((order) => (plan.orderStatus ? order.status === plan.orderStatus : true))
    .filter((order) => withinRange(order.createdAt, plan.dateRange))
    .slice(0, plan.limit);
  const breakdown = filteredOrders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    intent: "order_status_query",
    answerContext: {
      total: filteredOrders.length,
      orderStatus: plan.orderStatus ?? null,
      breakdown
    },
    dataCards: [
      {
        title: plan.orderStatus ? `${plan.orderStatus} 订单数` : "订单数",
        value: String(filteredOrders.length),
        description: "按当前查询条件筛出的订单数量"
      },
      {
        title: "订单状态分布",
        value: formatBreakdown(breakdown),
        description: "当前筛选结果的状态概览"
      }
    ],
    records: filteredOrders.map((order) => ({
      orderId: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      customerName: order.user?.name ?? null,
      createdAt: order.createdAt.toISOString()
    })),
    sources: ["/admin/orders"],
    suggestions: ["今天有多少待发货订单？", "最近 10 条操作日志", "生成今日日报"]
  };
}

async function buildOperationLogResult(plan: AdminAiQueryPlan): Promise<AdminAiQueryResult> {
  const filteredLogs = (await listLogs())
    .filter((log) => (plan.logType ? log.type === plan.logType : true))
    .filter((log) => withinRange(log.createdAt, plan.dateRange))
    .slice(0, plan.limit);

  return {
    intent: "operation_log_query",
    answerContext: { total: filteredLogs.length, logType: plan.logType ?? null },
    dataCards: [
      {
        title: "日志条数",
        value: String(filteredLogs.length),
        description: "按当前查询条件筛出的操作日志数量"
      }
    ],
    records: filteredLogs.map((log) => ({
      logId: log.id,
      type: log.type,
      operator: log.user.name,
      description: log.description,
      createdAt: log.createdAt.toISOString()
    })),
    sources: ["/admin/logs"],
    suggestions: ["最近 20 条库存操作日志", "列出低库存商品", "生成今日日报"]
  };
}

function withinRange(value: Date, range?: { from?: Date; to?: Date }) {
  if (!range) return true;
  if (range.from && value < range.from) return false;
  if (range.to && value > range.to) return false;
  return true;
}

function isSameDay(value: Date, target: Date) {
  return startOfDay(value).getTime() === startOfDay(target).getTime();
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function formatBreakdown(breakdown: Record<string, number>) {
  const entries = Object.entries(breakdown);
  return entries.length > 0 ? entries.map(([status, count]) => `${status} ${count}`).join(" / ") : "暂无数据";
}

function toReportDate(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}
