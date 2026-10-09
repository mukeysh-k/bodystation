/** Hidden rows that store one installment of a parent additional charge. */
export const CHARGE_PAYMENT_PREFIX = "[[bs-pay:";

export function chargePaymentItemName(chargeId: string) {
  return `${CHARGE_PAYMENT_PREFIX}${chargeId}]]`;
}

export function chargePaymentParentId(itemName: unknown): string | null {
  if (typeof itemName !== "string") return null;
  if (!itemName.startsWith(CHARGE_PAYMENT_PREFIX) || !itemName.endsWith("]]")) return null;
  const id = itemName.slice(CHARGE_PAYMENT_PREFIX.length, -2);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ? id
    : null;
}

export function chargeAmounts(charge: {
  price: number | string | null;
  amount_paid?: number | string | null;
  is_paid?: boolean;
  payments?: { amount: number | string | null }[] | null;
}) {
  const total = Number(charge.price || 0);
  const fromHistory =
    Array.isArray(charge.payments) && charge.payments.length > 0
      ? charge.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      : null;
  const recorded =
    fromHistory !== null ? fromHistory : charge.is_paid ? total : Number(charge.amount_paid || 0);
  const paid = Math.min(Math.max(recorded, 0), Math.max(total, 0));
  const pending = Math.max(0, total - paid);
  return { total, paid, pending };
}
