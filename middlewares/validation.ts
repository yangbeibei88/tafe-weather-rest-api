// @deno-types="npm:@types/express"
import { Request, Response, NextFunction } from "express";
import asynHandler from "express-async-handler";
import {
  ContextRunner,
  param,
  validationResult,
  Result,
} from "express-validator";

type Location = "body" | "cookies" | "headers" | "params" | "query";

// calling validationResult(req) will include the results for this validation

// const validateBody = (validation: ContextRunner[]) => {
//   return async (req: Request, res: Response, next: NextFunction) => {};
// };

export const validateParams = asynHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const paramKey in req.params) {
      await param(paramKey).notEmpty().escape().run(req);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    next();
  }
);

// const validateParams = (req: Request, res: Response, next: NextFunction) => {
//   const paramKeys = Object.keys(req.params);

//   if (paramKeys && paramKeys.length > 0) {
//     paramKeys.map(async (key) => await param(key).notEmpty().escape().run(req));
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.status(400).json({ errors: errors.array() });
//       return;
//     }
//   }
//   next();
// };
