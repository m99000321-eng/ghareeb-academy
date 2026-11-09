import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/commerce-types";
import { cn } from "@/lib/utils";

const orderTone: Record<OrderStatus, string> = {
  pending_payment: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  new: "border-violet/30 bg-violet/10 text-violet-300",
  confirmed: "border-cyan/30 bg-cyan/10 text-cyan-300",
  packed: "border-blue-400/25 bg-blue-400/10 text-blue-300",
  shipped: "border-acid/30 bg-acid/10 text-acid",
  delivered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-flare/30 bg-flare/10 text-flare",
  returned: "border-white/15 bg-white/5 text-white/50",
};

const paymentTone: Record<PaymentStatus, string> = {
  unpaid: "border-white/15 bg-white/5 text-white/50",
  pending: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  review: "border-gold/30 bg-gold/10 text-gold",
  paid: "border-acid/30 bg-acid/10 text-acid",
  failed: "border-flare/30 bg-flare/10 text-flare",
  refunded: "border-violet/30 bg-violet/10 text-violet-300",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold",
        orderTone[status],
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold",
        paymentTone[status],
      )}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
