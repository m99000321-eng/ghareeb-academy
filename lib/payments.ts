import type { PaymentMethodId } from "./commerce-types";

export type PaymentKind = "cod" | "manual" | "online";

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  nameEn: string;
  description: string;
  kind: PaymentKind;
  icon: string;
  badge?: string;
  providers?: string;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "card",
    name: "بطاقة بنكية",
    nameEn: "Visa / Mastercard / Meeza",
    description: "ادفع بأمان عبر بوابة دفع مشفّرة — فيزا، ماستركارد، أو ميزة.",
    kind: "online",
    icon: "card",
    badge: "الأكثر استخدامًا",
  },
  {
    id: "mada",
    name: "مدى",
    nameEn: "Mada",
    description: "البطاقات البنكية السعودية عبر بوابة مدى الآمنة.",
    kind: "online",
    icon: "mada",
  },
  {
    id: "applepay",
    name: "Apple Pay",
    nameEn: "Apple Pay",
    description: "دفع سريع وآمن بلمسة واحدة من أجهزة Apple.",
    kind: "online",
    icon: "applepay",
  },
  {
    id: "stcpay",
    name: "STC Pay",
    nameEn: "STC Pay",
    description: "حوّل من محفظة STC Pay مباشرة وأكمل طلبك.",
    kind: "online",
    icon: "stcpay",
  },
  {
    id: "wallet",
    name: "محفظة إلكترونية",
    nameEn: "Vodafone / Etisalat / Orange / WE Cash",
    description: "فودافون كاش، اتصالات كاش، أورنج كاش، أو WE Pay.",
    kind: "online",
    icon: "wallet",
  },
  {
    id: "fawry",
    name: "فوري",
    nameEn: "Fawry",
    description: "ادفع كاش من أي منفذ فوري بكود الدفع الخاص بطلبك.",
    kind: "online",
    icon: "fawry",
  },
  {
    id: "valu",
    name: "تقسيط Valu",
    nameEn: "Valu Installments",
    description: "قسّط طلبك على 3 أو 6 أو 12 شهرًا بدون فوائد.",
    kind: "online",
    icon: "valu",
    badge: "تقسيط",
  },
  {
    id: "instapay",
    name: "إنستاباي",
    nameEn: "InstaPay",
    description: "تحويل فوري من تطبيق بنكك إلى حساب المتجر، ثم ارفع رقم العملية.",
    kind: "manual",
    icon: "instapay",
  },
  {
    id: "bank",
    name: "تحويل بنكي",
    nameEn: "Bank Transfer",
    description: "حوّل المبلغ إلى حساب المتجر وأرسل رقم الحوالة للتأكيد.",
    kind: "manual",
    icon: "bank",
  },
  {
    id: "paypal",
    name: "PayPal",
    nameEn: "PayPal",
    description: "ادفع عبر حسابك في PayPal أو ببطاقة دولية.",
    kind: "online",
    icon: "paypal",
  },
  {
    id: "cod",
    name: "الدفع عند الاستلام",
    nameEn: "Cash on Delivery",
    description: "ادفع نقدًا أو بالشبكة للمندوب عند وصول طلبك.",
    kind: "cod",
    icon: "cod",
  },
];

export const paymentMethodMap = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [method.id, method]),
) as Record<PaymentMethodId, PaymentMethod>;

export function getPaymentMethod(id: PaymentMethodId): PaymentMethod {
  return paymentMethodMap[id] ?? paymentMethodMap.cod;
}

export const PAYMENT_SETUP_KEYS: Record<string, string[]> = {
  card: ["PAYMOB_API_KEY", "PAYMOB_IFRAME_ID", "STRIPE_SECRET_KEY"],
  mada: ["PAYMOB_API_KEY", "PAYMOB_IFRAME_ID"],
  applepay: ["STRIPE_SECRET_KEY", "PAYMOB_API_KEY"],
  stcpay: ["PAYMOB_API_KEY", "MOYASAR_API_KEY"],
  wallet: ["PAYMOB_API_KEY", "PAYMOB_WALLET_INTEGRATION_ID"],
  fawry: ["PAYMOB_API_KEY", "PAYMOB_FAWRY_INTEGRATION_ID"],
  valu: ["PAYMOB_API_KEY", "VALU_MERCHANT_ID"],
  paypal: ["PAYPAL_CLIENT_ID", "PAYPAL_SECRET"],
};
