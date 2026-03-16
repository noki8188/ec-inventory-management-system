import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/errors.js";

export async function getCart(userId: number) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { inventory: true, category: true } } }
  });
  return items;
}

export async function addCartItem(userId: number, productId: number, quantity: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true }
  });

  if (!product || !product.inventory) {
    throw new ApiError(404, "Product not found.");
  }

  if (quantity <= 0) {
    throw new ApiError(400, "Quantity must be greater than 0.");
  }

  return prisma.cartItem.upsert({
    where: {
      userId_productId: { userId, productId }
    },
    update: {
      quantity: { increment: quantity }
    },
    create: {
      userId,
      productId,
      quantity
    },
    include: { product: true }
  });
}

export async function updateCartItem(userId: number, itemId: number, quantity: number) {
  if (quantity <= 0) {
    throw new ApiError(400, "Quantity must be greater than 0.");
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId }
  });
  if (!item) {
    throw new ApiError(404, "Cart item not found.");
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity }
  });
}

export async function deleteCartItem(userId: number, itemId: number) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId }
  });
  if (!item) {
    throw new ApiError(404, "Cart item not found.");
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
}
