import express from "express";
import {
  validateGETPayments,
  validateGETPaymentStatus,
  validatePOSTPayments,
} from "./validation";
import {
  getPayments,
  getPaymentStatus,
  initPayment,
  webhook,
} from "./controller";

const router = express.Router();

router.get("/", validateGETPayments, getPayments);
router.post("/", validatePOSTPayments, initPayment);
router.get("/:id", validateGETPaymentStatus, getPaymentStatus);
router.post("/webhook", webhook);

export default router;
