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

const validate = (validations: ContextRunner[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
    }
    next();
  };
};

export const validateParams = asynHandler(async (req, res, next) => {
  for (const paramKey in req.params) {
    await param(paramKey).notEmpty().escape().run(req);
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.json({ errors: errors.array() });
    return;
  }

  next();
});

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
