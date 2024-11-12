// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request, Response, NextFunction } from "express-serve-static-core";

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  let statusCode = 200;

  const originStatus = res.status;

  res.status = function (code: number): Response {
    statusCode = code;
    return originStatus.call(this, code);
  };

  const orginalSend = res.send;

  // deno-lint-ignore no-explicit-any
  res.send = function (body?: any): Response {
    const duration = Date.now() - start;

    const log = [
      req.ip || "-",
      "-",
      new Date().toISOString(),
      `${req.method} ${req.originalUrl}`,
      statusCode,
      `${duration}ms`,
    ].join(" ");

    console.info(log);

    return orginalSend.call(this, body);
  };

  next();
}
