import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/errors.js";

type UserOrder = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

type AdminOrder = Prisma.OrderGetPayload<{
  include: {
    user: { select: { id: true; name: true; email: true } };
    items: true;
  };
}>;

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: []
};

export function canTransitionOrderStatus(current: OrderStatus, nextStatus: OrderStatus) {
  return allowedTransitions[current].includes(nextStatus);
}

type CheckoutPayload = {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
};

export async function createOrderFromCart(userId: number, payload: CheckoutPayload) {
  return prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { inventory: true }
        }
      }
    });

    if (cartItems.length === 0) {
      throw new ApiError(400, "Cart is empty.");
    }

    for (const item of cartItems) {
      if (!item.product.inventory || item.product.inventory.stock < item.quantity) {
        throw new ApiError(400, `${item.product.name} is out of stock.`);
      }
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const order = await tx.order.create({
      data: {
        userId,
        status: OrderStatus.CREATED,
        totalAmount,
        shippingName: payload.shippingName,
        shippingPhone: payload.shippingPhone,
        shippingAddress: payload.shippingAddress,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            unitPrice: item.product.price,
            quantity: item.quantity,
            lineTotal: Number(item.product.price) * item.quantity
          }))
        }
      },
      include: { items: true }
    });

    for (const item of cartItems) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          stock: { decrement: item.quantity }
        }
      });

      await tx.product.update({
        where: { id: item.productId },
        data: {
          soldCount: { increment: item.quantity },
          popularity: { increment: item.quantity * 3 }
        }
      });
    }

    await tx.cartItem.deleteMany({ where: { userId } });

    return order;
  });
}

export async function listOrdersForUser(userId: number): Promise<UserOrder[]> {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true }
  });
}

export async function getOrderForUser(userId: number, orderId: number): Promise<UserOrder> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true }
  });
  if (!order) {
    throw new ApiError(404, "Order not found.");
  }
  return order;
}

export async function updateOrderStatus(orderId: number, nextStatus: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  if (!canTransitionOrderStatus(order.status, nextStatus)) {
    throw new ApiError(400, `Cannot move from ${order.status} to ${nextStatus}.`);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: nextStatus }
  });
}

export async function listAllOrders(): Promise<AdminOrder[]> {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: true
    }
  });
}
