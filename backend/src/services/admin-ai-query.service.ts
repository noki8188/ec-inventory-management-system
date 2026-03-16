import { OrderStatus, OperationType } from "@prisma/client";

export type AiIntent =
  | "low_stock_query"
  | "order_status_query"
  | "operation_log_query"
  | "daily_report_generate"
  | "unsupported";

export type AdminAiQueryPlan = {
  intent: AiIntent;
  normalizedMessage: string;
  limit: number;
  orderStatus?: OrderStatus;
  logType?: OperationType;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
};

type QueryContext = {
  dateRange?: {
    from?: string;
    to?: string;
  };
  orderStatus?: OrderStatus;
  logType?: OperationType;
  limit?: number;
};

const orderStatusKeywords: Array<{ status: OrderStatus; keywords: string[] }> = [
  { status: OrderStatus.CREATED, keywords: ["新订单", "新建订单", "created"] },
  { status: OrderStatus.CONFIRMED, keywords: ["待发货", "已确认", "confirmed"] },
  { status: OrderStatus.SHIPPED, keywords: ["已发货", "配送中", "shipped"] },
  { status: OrderStatus.COMPLETED, keywords: ["已完成", "completed"] },
  { status: OrderStatus.CANCELLED, keywords: ["已取消", "cancelled"] }
];

const logTypeKeywords: Array<{ type: OperationType; keywords: string[] }> = [
  { type: OperationType.INVENTORY_UPDATED, keywords: ["库存", "补货", "inventory"] },
  { type: OperationType.ORDER_STATUS_UPDATED, keywords: ["订单状态", "发货", "order status"] },
  { type: OperationType.PRODUCT_CREATED, keywords: ["创建商品", "新增商品"] },
  { type: OperationType.PRODUCT_UPDATED, keywords: ["更新商品", "编辑商品"] },
  { type: OperationType.PRODUCT_DELETED, keywords: ["删除商品", "下架商品"] }
];

export function parseAdminAiQuery(message: string, context?: QueryContext): AdminAiQueryPlan {
  const normalizedMessage = message.trim().toLowerCase();
  const limit = context?.limit ?? parseLimit(message) ?? 10;
  const dateRange = context?.dateRange ? parseContextDateRange(context.dateRange) : parseDateRange(normalizedMessage);

  if (containsAny(normalizedMessage, ["日报", "运营日报", "daily report"])) {
    return { intent: "daily_report_generate", normalizedMessage, limit, dateRange };
  }

  if (containsAny(normalizedMessage, ["低库存", "库存不足", "缺货", "low stock"])) {
    return { intent: "low_stock_query", normalizedMessage, limit, dateRange };
  }

  if (containsAny(normalizedMessage, ["订单", "待发货", "已发货", "已完成", "已取消", "order"])) {
    return {
      intent: "order_status_query",
      normalizedMessage,
      limit,
      orderStatus: context?.orderStatus ?? detectOrderStatus(normalizedMessage),
      dateRange
    };
  }

  if (containsAny(normalizedMessage, ["日志", "操作记录", "log"])) {
    return {
      intent: "operation_log_query",
      normalizedMessage,
      limit,
      logType: context?.logType ?? detectLogType(normalizedMessage),
      dateRange
    };
  }

  return {
    intent: "unsupported",
    normalizedMessage,
    limit,
    orderStatus: context?.orderStatus,
    logType: context?.logType,
    dateRange
  };
}

function containsAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function detectOrderStatus(text: string) {
  return orderStatusKeywords.find(({ keywords }) => containsAny(text, keywords))?.status;
}

function detectLogType(text: string) {
  return logTypeKeywords.find(({ keywords }) => containsAny(text, keywords))?.type;
}

function parseLimit(message: string) {
  const match = message.match(/(\d{1,2})\s*(条|个|笔|项)?/);
  return match ? Number(match[1]) : undefined;
}

function parseContextDateRange(dateRange: QueryContext["dateRange"]) {
  return {
    from: dateRange?.from ? new Date(dateRange.from) : undefined,
    to: dateRange?.to ? new Date(dateRange.to) : undefined
  };
}

function parseDateRange(message: string) {
  const now = new Date();
  if (containsAny(message, ["今天", "今日", "today"])) {
    return { from: startOfDay(now), to: endOfDay(now) };
  }
  if (containsAny(message, ["昨天", "昨日", "yesterday"])) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
  }
  if (containsAny(message, ["最近7天", "近7天", "last 7 days"])) {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 6);
    return { from, to: endOfDay(now) };
  }
  return undefined;
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
