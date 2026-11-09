import {
  Banknote,
  CalendarClock,
  CreditCard,
  Globe,
  Landmark,
  QrCode,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react";
import type { PaymentMethodId } from "@/lib/commerce-types";

const icons = {
  card: CreditCard,
  mada: CreditCard,
  applepay: Smartphone,
  stcpay: Smartphone,
  wallet: Wallet,
  fawry: QrCode,
  valu: CalendarClock,
  instapay: Zap,
  bank: Landmark,
  paypal: Globe,
  cod: Banknote,
} satisfies Record<PaymentMethodId, typeof CreditCard>;

export function PaymentIcon({
  id,
  size = 18,
  className,
}: {
  id: PaymentMethodId;
  size?: number;
  className?: string;
}) {
  const Icon = icons[id] ?? CreditCard;
  return <Icon size={size} className={className} />;
}
