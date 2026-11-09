import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getOrder, getSettings } from "@/lib/db";
import { getPaymentMethod } from "@/lib/payments";
import { PaymentClient } from "@/components/pay/PaymentClient";

export const metadata: Metadata = {
  title: "إتمام الدفع",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const method = getPaymentMethod(order.payment);
  if (order.paymentStatus === "paid" || method.kind === "cod") {
    redirect(`/order/${order.id}`);
  }

  const settings = await getSettings();

  return (
    <PaymentClient
      order={{
        id: order.id,
        total: order.total,
        customerName: order.customer.name,
        items: order.items.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
      }}
      method={{
        id: method.id,
        name: method.name,
        description: method.description,
        kind: method.kind,
      }}
      manual={{
        instapayHandle: settings.instapayHandle,
        bankName: settings.bankName,
        bankAccount: settings.bankAccount,
        bankHolder: settings.bankHolder,
      }}
    />
  );
}
