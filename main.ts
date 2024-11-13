// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Express,
  Request,
  Response,
  NextFunction,
} from "express-serve-static-core";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
import { logger } from "./middlewares/logger.ts";
import { weatherRouter } from "./routes/weatherRoutes.ts";
import { authRouter } from "./routes/authRoutes.ts";
import { userRouter } from "./routes/userRoutes.ts";
import { logRouter } from "./routes/logRoutes.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { ClientError } from "./errors/ClientError.ts";

export const app: Express = express();

app.use(logger);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ROUTES
app.get("/api/v1", (_req: Request, res: Response) => {
  res.status(200).json({ msg: "Welcome to TAFE Weather REST API v1" });
});

// app.use("/api/v1/login", authRouter);
// app.use("/api/v1/users", userRouter);
app.use("/api/v1/weathers", weatherRouter);
app.use("/api/v1/logs", logRouter);

// error handling middleware
app.use(errorHandler);

// HANDLE UNHANDLED ROUTES
app.all("*", (_req: Request, _res: Response, next: NextFunction) =>
  next(new ClientError({ code: 400 }))
);
