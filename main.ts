// @deno-types="npm:@types/express@4.17.21"
import express, { Express, Request, Response, NextFunction } from "express";
import { weatherRouter } from "./routes/weatherRoutes.ts";
import { authRouter } from "./routes/authRoutes.ts";
import { userRouter } from "./routes/userRoutes.ts";
import { logRouter } from "./routes/logRoutes.ts";

export const app: Express = express();

const reqLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.info(`${req.method} request to ${req.url} by ${req.hostname}`);
  next();
};

app.use(reqLogger);

// ROUTES
app.get("/api/v1", (_req: Request, res: Response) => {
  res.status(200).json({ msg: "Welcome to TAFE Weather REST API v1" });
});

app.use("/api/v1/login", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/weathers", weatherRouter);
app.use("/api/v1/logs", logRouter);

// export function add(a: number, b: number): number {
//   return a + b;
// }

// // Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
// if (import.meta.main) {
//   console.log("Add 2 + 3 =", add(2, 3));
// }
