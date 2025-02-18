// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
  RequestHandlerParams,
} from "express-serve-static-core";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
// @deno-types="@types/cors"
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
// @deno-types="@types/compression"
import compression from "compression";
import fs from "node:fs";
import { URL } from "node:url";
import { parse } from "@std/yaml";
// @deno-types="@types/swagger-ui-express"
import swaggerUi, { JsonObject } from "swagger-ui-express";
import { logger } from "./middlewares/logger.ts";
import { weatherRouter } from "./routes/weatherRoutes.ts";
import { authRouter } from "./routes/authRoutes.ts";
import { userRouter } from "./routes/userRoutes.ts";
import { logRouter } from "./routes/logRoutes.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { ClientError } from "./errors/ClientError.ts";
import { preprocessOpenAPIDoc } from "./utils/helpers.ts";
import { accountRouter } from "./routes/accountRoutes.ts";

export const app: Express = express();
export const swaggerApp: Express = express();
// Deno.env.get("CORS_ORIGIN")?.split(",") ||
// enable cors for all endpoints
const corsOptions: CorsOptions = {
  origin: "http://localhost:3086",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions) as RequestHandler);
app.options("*", cors(corsOptions) as RequestHandler);

app.use(helmet() as unknown as RequestHandler);

app.use(compression() as RequestHandler);

app.use(logger as RequestHandler);

app.use(express.json() as unknown as RequestHandler);
app.use(express.urlencoded({ extended: false }) as unknown as RequestHandler);

// RATE LIMITER
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter as unknown as RequestHandler);

app.use("/api/v1", authRouter);
app.use("/api/v1/weathers", weatherRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/logs", logRouter);

// error handling middleware
app.use(errorHandler);

const apiDocPath = new URL("./api/openapi.yaml", import.meta.url).pathname;
const swaggerDoc = parse(fs.readFileSync(apiDocPath, "utf-8")) as JsonObject;

const adjustedSwaggerDoc = preprocessOpenAPIDoc(swaggerDoc);

swaggerApp.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to TAFE Weather REST API v1! Go to /api-docs",
  });
});
swaggerApp.use(
  "/api-docs",
  swaggerUi.serve as RequestHandler[],
  swaggerUi.setup(adjustedSwaggerDoc) as RequestHandlerParams
);

// HANDLE UNHANDLED ROUTES
app.all("*", ((_req: Request, _res: Response, next: NextFunction) =>
  next(new ClientError({ code: 400 }))) as RequestHandler);
