import { OperationType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function createOperationLog(userId: number, type: OperationType, targetId: number, description: string) {
  await prisma.operationLog.create({
    data: {
      userId,
      type,
      targetId,
      description
    }
  });
}
