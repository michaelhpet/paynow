import express from "express";
import { validateGETPayments, validatePOSTPayments } from "./validation";
import { getPayments, initPayment } from "./controller";

const router = express.Router();

router.get("/", validateGETPayments, getPayments);
router.post("/", validatePOSTPayments, initPayment);

export default router;
