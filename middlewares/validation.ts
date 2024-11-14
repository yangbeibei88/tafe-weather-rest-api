// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
import {
  ContextRunner,
  param,
  validationResult,
  Result,
  body,
  ValidationChain,
} from "express-validator";
import { ClientError } from "../errors/ClientError.ts";

type Location = "body" | "cookies" | "headers" | "params" | "query";

// calling validationResult(req) will include the results for this validation

export const validateBody = (validations: ContextRunner[]): RequestHandler => {
  return (async (req: Request, _res: Response, next: NextFunction) => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      next(
        new ClientError({
          code: 400,
          message: "Validation Error",
          context: { ...errors.array() },
        })
      );
      // res.json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler;
};

export const validateParams = (): RequestHandler => {
  return (async (req: Request, _res: Response, next: NextFunction) => {
    for (const paramKey in req.params) {
      await param(paramKey).notEmpty().escape().run(req);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      next(new ClientError({ code: 404, context: { ...errors.array() } }));
      // res.json({ errors: errors.array() });
      return;
    }

    next();
  }) as RequestHandler;
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
  min: number = -Infinity,
  max: number = +Infinity,
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

export const validatePhoneNumber = (
  name: string,
  required: boolean = true
): ValidationChain => {
  let chain: ValidationChain = body(name);

  if (required === false) {
    chain = chain.optional({ values: "falsy" });
  }

  chain = chain
    .trim()
    .matches(/^0[2-478]\\d{8}$/)
    .withMessage(
      `${name} must be 10 digits without spaces and special characters.`
    );

  return chain;
};

export const validateEmail = (
  name: string,
  runInUse: boolean = false,
  // deno-lint-ignore no-explicit-any
  cb: any = undefined,
  required: boolean = true
): ValidationChain => {
  let chain: ValidationChain = body(name);

  if (required === false) {
    chain = chain.optional({ values: "falsy" });
  }

  chain = chain
    .trim()
    .toLowerCase()
    .isEmail()
    .isLength({ max: 254 })
    .withMessage(
      `${name} must be a valid email address, not more than 254 characters.`
    );

  if (runInUse === true && cb === "function") {
    chain = chain.custom(async (v) => {
      const results = await cb(v);
      if (results?.length > 0) {
        throw new Error("Email already in use.");
      }
    });
  }

  return chain;
};

export const validatePassword = (
  name: string,
  min: number = 8,
  max: number = 50,
  required: boolean = true
): ValidationChain => {
  let chain: ValidationChain = body(name);

  if (required === false) {
    chain = chain.optional({ values: "falsy" });
  }

  chain = chain.trim().custom((v) => {
    const isValid =
      v.length >= min &&
      v.length <= max &&
      /[A-Z]/.test(v) &&
      /[a-z]/.test(v) &&
      /[0-9]/.test(v) &&
      /[\W_]/.test(v);

    if (!isValid) {
      throw new Error(
        `Invalid password. Password must be at least ${min} characters, at most ${max} characters, containing uppercase(s),lowercase(s), number(s), and special character(s).`
      );
    }
    return true;
  });

  return chain;
};

export const compareStrings = (
  plurals: string,
  str1Name: string,
  str2Name: string
): ValidationChain => {
  let chain: ValidationChain = body(str2Name);

  chain = chain.trim().custom((v, { req }) => {
    if (v !== req.body(str1Name)) {
      throw new Error(`${plurals} do not match.`);
    }
    return true;
  });

  return chain;
};

export const validateSelect = (
  name: string,
  options: readonly string[],
  required: boolean = true
): ValidationChain => {
  let chain: ValidationChain = body(name);

  if (required === false) {
    chain.optional({ values: "null" });
  }

  // The input could be text input (string), single select (string)
  chain = chain
    .customSanitizer((v) => {
      // if the field is a text input or single select, then req.body will return a string
      if (typeof v === "string" && v.trim().length > 0) {
        return v
          .trim()
          .toLowerCase()
          .split(",")
          .map((item) => item.trim())
          .filter((item) => options.includes(item));
      }

      // if the field is multiple select, then req.body will return an array
      if (Array.isArray(v) && v.length > 0) {
        const values = v
          .map((item) => item.trim().toLowerCase())
          .filter((item) => options.includes(item));

        return Array.from(new Set(values));
      }

      // all other cases, return empty array
      return [];
    })
    .custom((v) => v.length > 0)
    .withMessage("The selected/entered values are invalid.");

  return chain;
};

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
