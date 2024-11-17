// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request } from "express-serve-static-core";
import { User } from "./models/UserSchema.ts";

// https://stackoverflow.com/questions/44383387/typescript-error-property-user-does-not-exist-on-type-request
declare module "express-serve-static-core" {
  export interface Request {
    user: User;
  }
}
