// @deno-types="npm:@types/express@4.17.20"
import { Request, Response, NextFunction } from "express";
import asynHandler from "express-async-handler";
import {
  ContextRunner,
  param,
  validationResult,
  Result,
  body,
  ValidationChain,
} from "express-validator";

type Location = "body" | "cookies" | "headers" | "params" | "query";

// calling validationResult(req) will include the results for this validation

export const validateBody = (validations: ContextRunner[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
};

export const validateParams = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const paramKey in req.params) {
      await param(paramKey).notEmpty().escape().run(req);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() });
      return;
    }

    next();
  };
};

export const validateText = (
  name: string,
  min: number = 0,
  max: number = 254,
  required: boolean = true
): ValidationChain => {
  let chain: ValidationChain = body(name);

  if (required === false) {
    chain = chain.optional({ values: "falsy" });
  }

  chain = chain
    .isString()
    .trim()
    .isLength({ min, max })
    .escape()
    .withMessage(`${name} must be a string, ${min} - ${max} characters.`);

  return chain;
};

export const validateNumber = (
  name: string,
  type: "int" | "float",
  min?: number,
  max?: number,
  required: boolean = true
): ValidationChain => {
  let chain: ValidationChain = body(name);

  if (required === false) {
    chain = chain.optional({ values: "null" });
  }

  switch (type) {
    case "int":
      chain = chain
        .toInt()
        .isInt({ min, max })
        .withMessage(`${name} must be an integer between ${min} and ${max}`);
      break;
    case "float":
      chain = chain
        .toFloat()
        .isFloat({ min, max })
        .withMessage(`${name} must be a float between ${min} and ${max}`);
      break;
  }

  return chain;
};

export const validateGeoJSON = () => {};

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
