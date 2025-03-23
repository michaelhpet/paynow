import express from "express";
import {
  validateGETPayments,
  validateGETPaymentStatus,
  validatePOSTPayments,
} from "./validation";
import { getPayments, getPaymentStatus, initPayment } from "./controller";

const router = express.Router();

router.get("/", validateGETPayments, getPayments);
router.post("/", validatePOSTPayments, initPayment);
router.get("/:id", validateGETPaymentStatus, getPaymentStatus);

export default router;
