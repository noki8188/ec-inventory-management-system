import { OperationType, ProductStatus } from "@prisma/client";
import { config } from "../config.js";
import { cache } from "../lib/cache.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/errors.js";
import { createOperationLog } from "./log.service.js";
import { clearProductCache } from "./product.service.js";

type ProductInput = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  status?: ProductStatus;
  stock: number;
  lowStockThreshold: number;
};

export async function createProduct(adminUserId: number, input: ProductInput) {
  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
      status: input.status ?? ProductStatus.ACTIVE,
      inventory: {
        create: {
          stock: input.stock,
          reservedStock: 0,
          lowStockThreshold: input.lowStockThreshold
        }
      }
    },
    include: { inventory: true, category: true }
  });

  clearProductCache();
  await createOperationLog(adminUserId, OperationType.PRODUCT_CREATED, product.id, `商品 ${product.name} を作成しました。`);
  return product;
}

export async function listAdminProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      inventory: true
    }
  });
}

export async function updateProduct(adminUserId: number, productId: number, input: Partial<ProductInput>) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    throw new ApiError(404, "Product not found.");
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.status ? { status: input.status } : {})
    },
    include: { inventory: true, category: true }
  });

  clearProductCache();
  await createOperationLog(adminUserId, OperationType.PRODUCT_UPDATED, product.id, `商品 ${product.name} を更新しました。`);
  return product;
}

export async function deleteProduct(adminUserId: number, productId: number) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    throw new ApiError(404, "Product not found.");
  }

  await prisma.cartItem.deleteMany({ where: { productId } });
  await prisma.product.update({
    where: { id: productId },
    data: {
      status: ProductStatus.INACTIVE,
      inventory: {
        update: {
          stock: 0
        }
      }
    }
  });
  clearProductCache();
  await createOperationLog(adminUserId, OperationType.PRODUCT_DELETED, productId, `商品 ${existing.name} を削除しました。`);
}

export async function updateInventory(adminUserId: number, productId: number, stock: number, lowStockThreshold: number) {
  const inventory = await prisma.inventory.update({
    where: { productId },
    data: { stock, lowStockThreshold },
    include: { product: true }
  });

  clearProductCache();
  await createOperationLog(
    adminUserId,
    OperationType.INVENTORY_UPDATED,
    productId,
    `商品 ${inventory.product.name} の在庫を ${stock} に更新しました。`
  );
  return inventory;
}

export async function listLowStockProducts() {
  const cacheKey = "low-stock:list";
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const items = await prisma.inventory.findMany({
    include: { product: { include: { category: true } } },
    orderBy: { stock: "asc" }
  });

  const filtered = items.filter((item) => item.stock <= item.lowStockThreshold);

  cache.set(cacheKey, filtered, config.cacheTtlSeconds);
  return filtered;
}

export async function listLogs() {
  return prisma.operationLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  });
}
