import { OrderStatus, OperationType } from "@prisma/client";
import { z } from "zod";

const dateRangeSchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional()
  })
  .optional();

export const adminAiQuerySchema = z.object({
  message: z.string().min(1).max(1000),
  context: z
    .object({
      dateRange: dateRangeSchema,
      orderStatus: z.nativeEnum(OrderStatus).optional(),
      logType: z.nativeEnum(OperationType).optional(),
      limit: z.number().int().min(1).max(50).optional()
    })
    .optional()
});

export const dailyReportRequestSchema = z.object({
  date: z.string().date().optional(),
  regenerate: z.boolean().optional()
});
