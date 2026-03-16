import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getProductById, listProducts } from "../services/product.service.js";

export const productRouter = Router();

productRouter.get("/", async (req, res, next) => {
  try {
    const result = await listProducts({
      keyword: req.query.keyword?.toString(),
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sort: req.query.sort as "newest" | "priceAsc" | "priceDesc" | "popularity" | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await getProductById(Number(req.params.id));
    res.json(product);
  } catch (error) {
    next(error);
  }
});

export const categoryRouter = Router();

categoryRouter.get("/", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});
