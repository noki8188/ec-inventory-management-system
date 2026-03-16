import { canTransitionOrderStatus } from "../src/services/order.service.js";

describe("order status transitions", () => {
  it("accepts valid transitions", () => {
    expect(canTransitionOrderStatus("CREATED", "CONFIRMED")).toBe(true);
    expect(canTransitionOrderStatus("CONFIRMED", "SHIPPED")).toBe(true);
    expect(canTransitionOrderStatus("SHIPPED", "COMPLETED")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(canTransitionOrderStatus("CREATED", "COMPLETED")).toBe(false);
    expect(canTransitionOrderStatus("COMPLETED", "CREATED")).toBe(false);
  });
});
