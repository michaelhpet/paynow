import express from "express";
import paymentsRouter from "./payments";

const router = express.Router();

router.use("/payments", paymentsRouter);

export default router;
