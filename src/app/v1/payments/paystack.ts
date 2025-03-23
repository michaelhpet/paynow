import { Payment } from "../../../types";

export async function initPaymentReq(data: Pick<Payment, "email" | "amount">) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: data.email, amount: data.amount * 100 }),
  });

  return await res.json();
}
