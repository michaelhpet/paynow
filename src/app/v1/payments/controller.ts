import { Request, Response } from "express";
import { db } from "../../../db";
import { payments } from "../../../db/schema";
import { success } from "../../../utils";
import { Pagination } from "../../../types";

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
