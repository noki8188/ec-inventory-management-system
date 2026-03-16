import bcrypt from "bcryptjs";
import { PrismaClient, ProductStatus, Role, OrderStatus, OperationType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.operationLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const [admin, userA, userB] = await Promise.all([
    prisma.user.create({
      data: { email: "admin@example.com", name: "Admin User", passwordHash, role: Role.ADMIN }
    }),
    prisma.user.create({
      data: { email: "yamada@example.com", name: "山田太郎", passwordHash, role: Role.USER }
    }),
    prisma.user.create({
      data: { email: "sato@example.com", name: "佐藤花子", passwordHash, role: Role.USER }
    })
  ]);

  const categories = await Promise.all(
    ["食品", "日用品", "文具", "家電"].map((name) =>
      prisma.category.create({
        data: { name }
      })
    )
  );

  const products = await Promise.all(
    Array.from({ length: 16 }).map((_, index) => {
      const category = categories[index % categories.length];
      return prisma.product.create({
        data: {
          name: `サンプル商品 ${index + 1}`,
          description: `小規模ECデモ用の商品説明 ${index + 1}`,
          price: (1200 + index * 150).toFixed(2),
          imageUrl: `https://picsum.photos/seed/product-${index + 1}/600/400`,
          status: ProductStatus.ACTIVE,
          popularity: 50 - index,
          soldCount: index * 2,
          categoryId: category.id,
          inventory: {
            create: {
              stock: index < 3 ? 3 + index : 20 + index,
              reservedStock: 0,
              lowStockThreshold: 5
            }
          }
        }
      });
    })
  );

  const order = await prisma.order.create({
    data: {
      userId: userA.id,
      status: OrderStatus.CONFIRMED,
      totalAmount: "3900.00",
      shippingName: "山田太郎",
      shippingPhone: "09012345678",
      shippingAddress: "東京都千代田区1-1-1",
      items: {
        create: [
          {
            productId: products[0].id,
            productName: products[0].name,
            unitPrice: "1200.00",
            quantity: 1,
            lineTotal: "1200.00"
          },
          {
            productId: products[1].id,
            productName: products[1].name,
            unitPrice: "1350.00",
            quantity: 2,
            lineTotal: "2700.00"
          }
        ]
      }
    }
  });

  await prisma.product.update({
    where: { id: products[0].id },
    data: { soldCount: { increment: 1 }, popularity: { increment: 10 } }
  });
  await prisma.product.update({
    where: { id: products[1].id },
    data: { soldCount: { increment: 2 }, popularity: { increment: 12 } }
  });

  await prisma.operationLog.createMany({
    data: [
      {
        userId: admin.id,
        type: OperationType.PRODUCT_CREATED,
        targetId: products[0].id,
        description: "初期商品データを登録しました。"
      },
      {
        userId: admin.id,
        type: OperationType.ORDER_STATUS_UPDATED,
        targetId: order.id,
        description: "注文を CONFIRMED に更新しました。"
      }
    ]
  });

  await prisma.cartItem.create({
    data: {
      userId: userB.id,
      productId: products[2].id,
      quantity: 1
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
