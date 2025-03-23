import { NextFunction, Request, Response } from "express";
import { db } from "../../../db";
import { payments } from "../../../db/schema";
import { AppError, success, verifySignature } from "../../../utils";
import { Pagination, Payment, PaystackEvent } from "../../../types";
import { initPaymentReq } from "./paystack";
import { eq } from "drizzle-orm";
import logger from "../../../utils/logger";

export async function getPayments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { limit = 10, page = 1 } = req.query as unknown as Pagination;
    const offset = (page - 1) * limit;

    const data = await db
      .select()
      .from(payments)
      .orderBy(payments.created_at)
      .limit(limit)
      .offset(offset);

    res.status(200).json(success(data, "Payments retrieved successfully"));
  } catch (error) {
    next(error);
  }
}

export async function initPayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    logger.info("Payment initialization started...", { body: req.body });

    const { name, email, amount } = req.body as Payment;

    const paystackRes = await initPaymentReq({ email, amount });

    if (!paystackRes.status) {
      logger.error("Payment initialization failed", { paystackRes });
      throw new AppError(502, "Payment initialization failed");
    }

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

    logger.info("Payment created successfully", { data });

    res
      .status(201)
      .json(
        success(
          { ...data, authorization_url: paystackRes.data.authorization_url },
          "Payment created successfully"
        )
      );
  } catch (error) {
    logger.error("Payment initialization failed", { error });
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
    logger.info("Webhook received...", { body: req.body });

    const signatureValid = verifySignature(
      req.body,
      req.headers["x-paystack-signature"] as string
    );

    if (!signatureValid) {
      logger.error("Invalid webhook signature", { headers: req.headers });
      throw new AppError(400, "Invalid webhook signature");
    }

    const data: PaystackEvent = req.body;

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.reference, data.data.reference));

    if (payment) {
      await db
        .update(payments)
        .set({
          status: data.data.status || payment.status,
          updated_at: data.data.paid_at || new Date().toISOString(),
        })
        .where(eq(payments.reference, data.data.reference));

      logger.info("Payment updated successfully", { data });
    }

    res.status(200).json({ status: "success", message: "Webhook received" });
  } catch (error) {
    logger.error("Webhook failed", { error });
    next(error);
  }
}
