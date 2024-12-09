// deno-lint-ignore-file no-explicit-any
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
  body,
  ValidationChain,
  buildCheckFunction,
  query,
} from "express-validator";
import { ClientError } from "../errors/ClientError.ts";

type Location = "body" | "cookies" | "headers" | "params" | "query";

const bodyOrQuery = buildCheckFunction(["body", "query"]);

// calling validationResult(req) will include the results for this validation

export const validateBody = (validations: ContextRunner[]): RequestHandler => {
  return (async (req: Request, _res: Response, next: NextFunction) => {
    const isArray = Array.isArray(req.body);
    const documents = isArray ? req.body : [req.body];

    const validDocuments: any[] = [];
    const errors: { index: number; issues: any[] }[] = [];

    for (const [index, document] of documents.entries()) {
      const innerReq = { ...req, body: document };
      for (const validation of validations) {
        await validation.run(innerReq);
      }

      const result = validationResult(innerReq);
      if (result.isEmpty()) {
        validDocuments.push(document);
      } else {
        errors.push({ index, issues: result.array() });
      }
    }

    if (errors.length > 0) {
      return next(
        new ClientError({
          code: 400,
          message: "Validation Error",
          context: errors,
        })
      );
    }

    req.body = isArray ? validDocuments : validDocuments[0];

    next();
  }) as RequestHandler;
};

export const validatePathParams = (): RequestHandler => {
  return (async (req: Request, _res: Response, next: NextFunction) => {
    for (const paramKey in req.params) {
      await param(paramKey).trim().toLowerCase().escape().run(req);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new ClientError({ code: 404, context: { ...errors.array() } })
      );
    }

    next();
  }) as RequestHandler;
};

export const validateQueryParams = (
  allowedParams?: string[]
): RequestHandler => {
  return (async (req: Request, _res: Response, next: NextFunction) => {
    const queryKeys = Object.keys(req.query);

    const invalidParams = queryKeys.filter(
      (key) => !allowedParams?.includes(key)
    );

    if (invalidParams.length > 0) {
      return next(
        new ClientError({
          code: 400,
          message: `Invalid query parameters: ${invalidParams.join(
            ", "
          )}. Allowed parameters are: ${allowedParams?.join(", ")}.`,
          context: {
            invalidParams,
            allowedParams,
          },
        })
      );
    }

    const validParams = queryKeys.filter((key) => allowedParams?.includes(key));

    for (const queryKey of validParams) {
      // compatible with query params contains nested operator
      await query(`${queryKey}.*`).trim().toLowerCase().escape().run(req);
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new ClientError({ code: 404, context: { ...errors.array() } })
      );
    }
    next();
  }) as RequestHandler;
};

export const validateBodyFactory =
  <T>(resourceValidations: Record<keyof T, ContextRunner>) =>
  (fields: (keyof T)[]): RequestHandler =>
    validateBody(
      fields.flatMap((field) => {
        const validation = resourceValidations[field];
        return validation ? [validation] : [];
      })
    );

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
    .matches(/^0[2-478]\d{8}$/)
    .withMessage(
      `${name} must be 10 digits without spaces and special characters.`
    );

  return chain;
};

export const validateEmail = (
  name: string,
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

  // if (runInUse === true && cb === "function") {
  //   chain = chain.custom(async (v) => {
  //     const results = await cb(v);
  //     if (results?.length > 0) {
  //       throw new Error("Email already in use.");
  //     }
  //   });
  // }

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
    if (v !== req.body[str1Name]) {
      throw new Error(`${plurals} do not match.`);
    }
    return true;
  });

  return chain;
};

export const validateSelect = (
  name: string,
  options: readonly string[],
  storeType: "string" | "array",
  required: boolean = true
): ValidationChain => {
  let chain: ValidationChain = body(name);

  if (required === false) {
    chain.optional({ values: "null" });
  }

  // The input could be text input (string), single select (string)
  chain = chain
    .customSanitizer((v) => {
      let result: string[];
      if (typeof v === "string" && v.trim().length > 0) {
        // if the field is a text input or single select, convert the req.body to array
        result = v
          .trim()
          .toLowerCase()
          .split(",")
          .map((item) => item.trim())
          .filter((item) => options.includes(item));
        // return storeType === "string" ? result.join(",") : result;
      } else if (Array.isArray(v) && v.length > 0) {
        // if the field is multiple select, then req.body will return an array
        const values = v
          .map((item) => item.trim().toLowerCase())
          .filter((item) => options.includes(item));

        result = Array.from(new Set(values));
      } else {
        // all other cases, return empty array
        result = [];
      }
      return storeType === "string" ? result.join(",") : result;
    })
    .custom((v) => v.length > 0)
    .withMessage("The selected/entered values are invalid.");

  return chain;
};

export const validateDate = (
  name: string,
  required: boolean = true
): ValidationChain => {
  let chain: ValidationChain = body(name);

  if (required === false) {
    chain = chain.optional({ values: "falsy" });
  }

  chain = chain.isDate().withMessage("Invalid date");

  return chain;
};
