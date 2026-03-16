import { OrderStatus, ProductStatus } from "@prisma/client";
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  categoryId: z.number().int().positive(),
  status: z.nativeEnum(ProductStatus).optional(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0)
});

export const productUpdateSchema = productSchema.partial();

export const inventorySchema = z.object({
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0)
});

export const orderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus)
});
