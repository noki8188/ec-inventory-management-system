import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { orderStatusSchema } from "../schemas/admin.schema.js";
import { checkoutSchema } from "../schemas/order.schema.js";
import { createOrderFromCart, getOrderForUser, listAllOrders, listOrdersForUser, updateOrderStatus } from "../services/order.service.js";
import { createOperationLog } from "../services/log.service.js";
import { OperationType, Role } from "@prisma/client";

export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post("/", validateBody(checkoutSchema), async (req, res, next) => {
  try {
    const order = await createOrderFromCart(req.auth!.userId, req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

orderRouter.get("/", async (req, res, next) => {
  try {
    const orders = await listOrdersForUser(req.auth!.userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

orderRouter.get("/:id", async (req, res, next) => {
  try {
    const order = await getOrderForUser(req.auth!.userId, Number(req.params.id));
    res.json(order);
  } catch (error) {
    next(error);
  }
});

export const adminOrderRouter = Router();

adminOrderRouter.use(authenticate, requireRole(Role.ADMIN));

adminOrderRouter.get("/", async (_req, res, next) => {
  try {
    const orders = await listAllOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

adminOrderRouter.patch("/:id/status", validateBody(orderStatusSchema), async (req, res, next) => {
  try {
    const order = await updateOrderStatus(Number(req.params.id), req.body.status);
    await createOperationLog(req.auth!.userId, OperationType.ORDER_STATUS_UPDATED, order.id, `注文状態を ${order.status} に更新しました。`);
    res.json(order);
  } catch (error) {
    next(error);
  }
});
