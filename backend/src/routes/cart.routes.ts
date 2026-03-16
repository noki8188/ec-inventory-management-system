import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { addCartItemSchema, updateCartItemSchema } from "../schemas/cart.schema.js";
import { addCartItem, deleteCartItem, getCart, updateCartItem } from "../services/cart.service.js";

export const cartRouter = Router();

cartRouter.use(authenticate);

cartRouter.get("/", async (req, res, next) => {
  try {
    const items = await getCart(req.auth!.userId);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

cartRouter.post("/items", validateBody(addCartItemSchema), async (req, res, next) => {
  try {
    const item = await addCartItem(req.auth!.userId, req.body.productId, req.body.quantity);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

cartRouter.patch("/items/:id", validateBody(updateCartItemSchema), async (req, res, next) => {
  try {
    const item = await updateCartItem(req.auth!.userId, Number(req.params.id), req.body.quantity);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

cartRouter.delete("/items/:id", async (req, res, next) => {
  try {
    await deleteCartItem(req.auth!.userId, Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
