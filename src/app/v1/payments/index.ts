import express from "express";
import { validateGETPayments } from "./validation";
import { getPayments } from "./controller";

const router = express.Router();

router.get("/", validateGETPayments, getPayments);

export default router;
