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
    const { statusCode, errors, logging } = err;

    if (logging === true) {
      console.error(
        JSON.stringify(
          {
            code: err.statusCode,
            errors: err.errors,
            stack: err.stack,
          },
          null,
          2
        )
      );
    }
    return res.status(statusCode).json({
      status: statusCode,
      detail: errors,
      instance: req.originalUrl,
    });
  }

  // // unhandled errors
  // console.error(JSON.stringify(err, null, 2));
  // return res.status(400).send({
  //   errors: [{ message: "Something went wrong." }],
  // });
};
