// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
import { logger } from "./middlewares/logger.ts";
import { weatherRouter } from "./routes/weatherRoutes.ts";
import { authRouter } from "./routes/authRoutes.ts";
import { userRouter } from "./routes/userRoutes.ts";
import { logRouter } from "./routes/logRoutes.ts";

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

// HANDLE UNHANDLED ROUTES
app.all("*", (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `${req.originalUrl} NOT FOUND.`,
  });
});
