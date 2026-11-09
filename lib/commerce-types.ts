export type PaymentMethodId =
  | "cod"
  | "card"
  | "mada"
  | "applepay"
  | "stcpay"
  | "wallet"
  | "fawry"
  | "valu"
  | "instapay"
  | "bank"
  | "paypal";

export type OrderStatus =
  | "pending_payment"
  | "new"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "review"
  | "paid"
  | "failed"
  | "refunded";

export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderCustomer = {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  email?: string;
};

export type OrderRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  customer: OrderCustomer;
  payment: PaymentMethodId;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  codFee: number;
  total: number;
  tracking?: string;
  adminNotes?: string;
  transferRef?: string;
  restocked?: boolean;
};

export type PaymentEvent = {
  id: string;
  orderId: string;
  createdAt: string;
  method: PaymentMethodId;
  type: "created" | "simulated" | "submitted" | "confirmed" | "rejected" | "refunded";
  status: PaymentStatus;
  amount: number;
  reference?: string;
  note?: string;
};

export type ContactRecord = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type SubscriberRecord = {
  email: string;
  createdAt: string;
};

export type ProductOverride = {
  price?: number;
  stock?: number;
  active?: boolean;
  featured?: boolean;
};

export type StoreSettings = {
  shippingFee: number;
  freeShippingThreshold: number;
  codFee: number;
  whatsapp: string;
  supportEmail: string;
  instapayHandle: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  methods: Record<PaymentMethodId, boolean>;
};

export type Database = {
  version: 1;
  seededAt: string;
  orders: OrderRecord[];
  payments: PaymentEvent[];
  products: Record<string, ProductOverride>;
  settings: StoreSettings;
  messages: ContactRecord[];
  subscribers: SubscriberRecord[];
};

export type PublicSettings = {
  shippingFee: number;
  freeShippingThreshold: number;
  codFee: number;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "بانتظار الدفع",
  new: "جديد",
  confirmed: "مؤكد",
  packed: "جاهز للشحن",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
  returned: "مرتجع",
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  "pending_payment",
  "new",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "غير مدفوع",
  pending: "قيد الدفع",
  review: "بانتظار المراجعة",
  paid: "مدفوع",
  failed: "فشل",
  refunded: "مسترد",
};

export const PAYMENT_STATUS_ORDER: PaymentStatus[] = [
  "unpaid",
  "pending",
  "review",
  "paid",
  "failed",
  "refunded",
];
