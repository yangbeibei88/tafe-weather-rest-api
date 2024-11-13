// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
import { IncomingMessage } from "node:http";
import { Buffer } from "node:buffer";

export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  const orginalSend = res.send;

  // deno-lint-ignore no-explicit-any
  res.send = function (body?: any): Response {
    const duration = Date.now() - start;

    const contentLength = body ? Buffer.byteLength(body) : 0;

    const log = [
      req.ip ||
        (req as unknown as IncomingMessage).socket?.remoteAddress ||
        "-",
      "-",
      new Date().toISOString(),
      `${req.method} ${req.originalUrl} HTTP/${
        (req as unknown as IncomingMessage).httpVersion || 1.1
      }`,
      res.statusCode,
      `${contentLength} bytes`,
      req.get("Referrer") ? `"${req.get("Referrer")}"` : "-",
      req.get("User-Agent") ? `"${req.get("User-Agent")}"` : "-",
      `${duration}ms`,
    ].join(" ");

    console.info(log);

    return orginalSend.call(this, body);
  };

  next();
}
