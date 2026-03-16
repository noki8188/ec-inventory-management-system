import { Role } from "@prisma/client";
import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { inventorySchema, productSchema, productUpdateSchema } from "../schemas/admin.schema.js";
import { createProduct, deleteProduct, listAdminProducts, listLogs, listLowStockProducts, updateInventory, updateProduct } from "../services/admin.service.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole(Role.ADMIN));

adminRouter.get("/products", async (_req, res, next) => {
  try {
    const products = await listAdminProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/products", validateBody(productSchema), async (req, res, next) => {
  try {
    const product = await createProduct(req.auth!.userId, req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/products/:id", validateBody(productUpdateSchema), async (req, res, next) => {
  try {
    const product = await updateProduct(req.auth!.userId, Number(req.params.id), req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/products/:id", async (req, res, next) => {
  try {
    await deleteProduct(req.auth!.userId, Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

adminRouter.patch("/products/:id/inventory", validateBody(inventorySchema), async (req, res, next) => {
  try {
    const inventory = await updateInventory(req.auth!.userId, Number(req.params.id), req.body.stock, req.body.lowStockThreshold);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/inventory/low-stock", async (_req, res, next) => {
  try {
    const items = await listLowStockProducts();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/logs", async (_req, res, next) => {
  try {
    const logs = await listLogs();
    res.json(logs);
  } catch (error) {
    next(error);
  }
});
