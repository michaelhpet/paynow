import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { db } from "../../../db";
import { payments } from "../../../db/schema";
import { AppError, success } from "../../../utils";
import { Pagination, Payment, PaystackEvent } from "../../../types";
import { initPaymentReq } from "./paystack";
import { eq } from "drizzle-orm";

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

export async function initPayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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
  } catch (error) {
    next(error);
  }
}

export async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const [data] = await db.select().from(payments).where(eq(payments.id, id));

    if (!data) throw new AppError(404, "Payment not found");

    res.status(200).json(
      success(
        {
          id: data.id,
          name: data.name,
          email: data.email,
          amount: data.amount,
          status: data.status,
          reference: data.reference,
          created_at: data.created_at,
          updated_at: data.updated_at,
          ...(data.status !== "completed"
            ? {
                access_code: data.access_code,
                authorization_url: `https://checkout.paystack.com/${data.access_code}`,
              }
            : {}),
        },
        "Payment retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
}

export async function webhook(req: Request, res: Response, next: NextFunction) {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"])
      throw new AppError(400, "Invalid webhook signature");

    const data: PaystackEvent = req.body;

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.reference, data.data.reference));

    if (!payment) throw new AppError(404, "Payment not found");

    await db
      .update(payments)
      .set({
        status: data.data.status || payment.status,
        updated_at: new Date().toISOString(),
      })
      .where(eq(payments.reference, data.data.reference));

    res.status(200).json({ status: "success", message: "Webhook received" });
  } catch (error) {
    next(error);
  }
}
