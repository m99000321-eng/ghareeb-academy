import { z } from "zod";

export const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "الاسم قصير جدًا").max(80),
    phone: z
      .string()
      .trim()
      .min(8, "رقم الجوال غير صحيح")
      .max(20)
      .regex(/^[\d+\s()-]+$/, "رقم الجوال يحتوي رموزًا غير مسموحة"),
    city: z.string().trim().min(2, "أدخل المدينة").max(60),
    address: z.string().trim().min(8, "أدخل عنوانًا أوضح").max(240),
    notes: z.string().trim().max(400).optional().default(""),
  }),
  payment: z.enum(["cod", "card"]),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "السلة فارغة")
    .max(30),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email("البريد الإلكتروني غير صحيح"),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10, "اكتب رسالة أطول").max(2000),
});

export const newsletterSchema = z.object({
  email: z.email("البريد الإلكتروني غير صحيح"),
});

export type OrderInput = z.infer<typeof orderSchema>;
