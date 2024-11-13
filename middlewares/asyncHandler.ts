// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";

// export const asyncHandlerT = (
//   handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
// ): RequestHandler => {
//   return (req, res, next) => {
//     handler(req, res, next).catch(next);
//   };
// };

export const asyncHandlerT = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
  return ((req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  }) as RequestHandler;
};

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler2 =
  (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
