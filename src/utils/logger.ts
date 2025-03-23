import winston from "winston";

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

if (process.env.NODE_ENV === "test") {
  logger.silent = true;
}

export default logger;
