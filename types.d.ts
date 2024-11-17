// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request } from "express-serve-static-core";

declare module "express-serve-static-core" {
  export interface Request {
    // deno-lint-ignore no-explicit-any
    user: any;
  }
}
