import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import v1Router from "./v1";
import { AppError } from "../utils";
import { CelebrateError } from "celebrate";
import { drizzle } from "drizzle-orm/libsql";
import logger from "../utils/logger";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", v1Router);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Cannot find ${req.method} ${req.path}`,
    data: null,
  });
});

app.use((err: AppError, _: Request, res: Response, __: NextFunction) => {
  if (err instanceof CelebrateError) {
    const messages: string[] = [];
    err.details.forEach((error) => {
      messages.push(error.message.replace(/\"/g, ""));
    });
    err.code = 400;
    err.message = messages?.[0] || "Bad request";
  }
  const error = new AppError(
    err.code || err.statusCode || 500,
    err.message || "Internal server error"
  );
  res.status(error.code).json({
    status: error.status,
    message: error.message,
    data: null,
  });
});

const PORT = process.env.PORT || 8080;

async function main() {
  try {
    drizzle(process.env.DB_FILE_NAME!);
    logger.info("Database connected successfully 🚀");
    app.listen(PORT, () => logger.info(`Server started on port ${PORT} 🚀`));
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to start server", error.message);
    } else {
      logger.error("Failed to start server", error);
    }
    logger.info("Retrying in a moment...");
    setTimeout(() => {
      main();
    }, 1000);
  }
}

main();

export default app;
