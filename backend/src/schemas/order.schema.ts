import { z } from "zod";

export const checkoutSchema = z.object({
  shippingName: z.string().min(1).max(100),
  shippingPhone: z.string().min(8).max(20),
  shippingAddress: z.string().min(5).max(300)
});
