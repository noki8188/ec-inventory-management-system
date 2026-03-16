import { Prisma, ProductStatus } from "@prisma/client";
import { config } from "../config.js";
import { cache } from "../lib/cache.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/errors.js";

export type ProductListQuery = {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "priceAsc" | "priceDesc" | "popularity";
  page?: number;
  pageSize?: number;
};

export async function listProducts(query: ProductListQuery) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const cacheKey = `products:${JSON.stringify({ ...query, page, pageSize })}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    ...(query.keyword
      ? {
          OR: [
            { name: { contains: query.keyword } },
            { description: { contains: query.keyword } }
          ]
        }
      : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.minPrice || query.maxPrice
      ? {
          price: {
            ...(query.minPrice ? { gte: query.minPrice } : {}),
            ...(query.maxPrice ? { lte: query.maxPrice } : {})
          }
        }
      : {})
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "priceAsc"
      ? { price: "asc" }
      : query.sort === "priceDesc"
        ? { price: "desc" }
        : query.sort === "popularity"
          ? { popularity: "desc" }
          : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true, inventory: true }
    }),
    prisma.product.count({ where })
  ]);

  const result = { items, page, pageSize, total };
  cache.set(cacheKey, result, config.cacheTtlSeconds);
  return result;
}

export async function getProductById(id: number) {
  const cacheKey = `product:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const product = await prisma.product.findFirst({
    where: { id, status: ProductStatus.ACTIVE },
    include: { category: true, inventory: true }
  });
  if (!product) {
    throw new ApiError(404, "Product not found.");
  }
  cache.set(cacheKey, product, config.cacheTtlSeconds);
  return product;
}

export function clearProductCache() {
  cache.clearByPrefix("product:");
  cache.clearByPrefix("products:");
  cache.clearByPrefix("low-stock:");
}
