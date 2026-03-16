import { OrderStatus, OperationType } from "@prisma/client";
import { parseAdminAiQuery } from "../src/services/admin-ai-query.service.js";

describe("admin ai query parser", () => {
  it("detects low stock intent", () => {
    expect(parseAdminAiQuery("低库存商品有哪些")).toMatchObject({
      intent: "low_stock_query"
    });
  });

  it("detects order status intent with mapped status", () => {
    expect(parseAdminAiQuery("今天有多少待发货订单")).toMatchObject({
      intent: "order_status_query",
      orderStatus: OrderStatus.CONFIRMED
    });
  });

  it("detects operation log intent with log type", () => {
    expect(parseAdminAiQuery("最近 20 条库存操作日志")).toMatchObject({
      intent: "operation_log_query",
      logType: OperationType.INVENTORY_UPDATED,
      limit: 20
    });
  });

  it("returns unsupported for unrelated prompts", () => {
    expect(parseAdminAiQuery("帮我预测下个月销量")).toMatchObject({
      intent: "unsupported"
    });
  });
});
