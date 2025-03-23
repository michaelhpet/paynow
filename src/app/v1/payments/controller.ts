import { Request, Response } from "express";
import { db } from "../../../db";
import { payments } from "../../../db/schema";
import { AppError, success } from "../../../utils";
import { Pagination, Payment } from "../../../types";
import { initPaymentReq } from "./paystack";

export async function getPayments(req: Request, res: Response) {
  const { limit = 10, page = 1 } = req.query as unknown as Pagination;
  const offset = (page - 1) * limit;

  const data = await db
    .select()
    .from(payments)
    .orderBy(payments.created_at)
    .limit(limit)
    .offset(offset);

  res.status(200).json(success(data, "Payments retrieved successfully"));
}

export async function initPayment(req: Request, res: Response) {
  const { name, email, amount } = req.body as Payment;

  const paystackRes = await initPaymentReq({ email, amount });

  if (!paystackRes.status)
    throw new AppError(502, "Payment initialization failed");

  const [data] = await db
    .insert(payments)
    .values({
      name,
      email,
      amount,
      status: "pending",
      reference: paystackRes.data.reference,
      access_code: paystackRes.data.access_code,
    })
    .returning();

  res
    .status(201)
    .json(
      success(
        { ...data, authorization_url: paystackRes.data.authorization_url },
        "Payment created successfully"
      )
    );
}
