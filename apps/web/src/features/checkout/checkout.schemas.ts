import { z } from "zod";

import { phoneSchema } from "@nova/validation";

export const checkoutSchema = z.object({
  addressLine: z.string().min(3),
  city: z.string().min(2),
  district: z.string().min(2),
  phone: phoneSchema,
  deliveryMethod: z.enum(["standard", "express", "pickup"]),
  paymentMethod: z.enum(["wallet", "card", "mobile-money"]),
  promoCode: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
