// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express-serve-static-core";

import { BaseError } from "../errors/BaseError.ts";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof BaseError) {
    const { statusCode, errors, stack } = err;

    if (Deno.env.get("DENO_ENV") === "development") {
      console.error(
        JSON.stringify(
          {
            code: statusCode,
            errors: errors,
            stack: stack,
          },
          null,
          2
        )
      );
    }
    return res.status(statusCode).json({
      statusCode,
      errors,
      path: req.originalUrl,
    });
  }

  // // unhandled errors
  // console.error(JSON.stringify(err, null, 2));
  // return res.status(400).send({
  //   errors: [{ message: "Something went wrong." }],
  // });
};
