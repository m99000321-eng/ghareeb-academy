import { NextResponse } from "next/server";
import { getSettings, isPaymentEnabled } from "@/lib/db";
import { PAYMENT_METHODS } from "@/lib/payments";

export async function GET() {
  const settings = await getSettings();
  const methods = PAYMENT_METHODS.filter((method) =>
    isPaymentEnabled(settings, method.id),
  ).map((method) => ({
    ...method,
    fee: method.id === "cod" ? settings.codFee : 0,
  }));

  return NextResponse.json({
    ok: true,
    methods,
    manual: {
      instapayHandle: settings.instapayHandle,
      bankName: settings.bankName,
      bankAccount: settings.bankAccount,
      bankHolder: settings.bankHolder,
    },
    settings: {
      shippingFee: settings.shippingFee,
      freeShippingThreshold: settings.freeShippingThreshold,
      codFee: settings.codFee,
    },
  });
}
