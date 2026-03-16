import { renderAdminAiQuery } from "../src/services/admin-ai-llm.service.js";

describe("admin ai llm renderer", () => {
  it("renders low stock summary from structured data", () => {
    const response = renderAdminAiQuery({
      intent: "low_stock_query",
      answerContext: {},
      dataCards: [
        { title: "低库存商品数", value: "2", description: "当前命中低库存阈值的商品数" }
      ],
      records: [
        { productName: "商品 A", stock: 2, threshold: 5, categoryName: "食品" },
        { productName: "商品 B", stock: 1, threshold: 5, categoryName: "日用品" }
      ],
      sources: ["/admin/inventory/low-stock"],
      suggestions: []
    });

    expect(response.answer).toContain("2");
    expect(response.disclaimer).toContain("只读");
  });
});
