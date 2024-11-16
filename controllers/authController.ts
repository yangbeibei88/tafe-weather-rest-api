// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request, Response, NextFunction } from "express-serve-static-core";
import { ContextRunner } from "express-validator";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import { User } from "../models/UserSchema.ts";
import {
  validateBodyFactory,
  validateEmail,
  validatePassword,
} from "../middlewares/validation.ts";

const loginValidations: Record<
  keyof Pick<User, "emailAddress" | "password">,
  ContextRunner
> = {
  emailAddress: validateEmail("emailAddress", false, undefined, true),
  password: validatePassword("password", 8, 50),
};

export const validateLoginInputs = () =>
  validateBodyFactory(loginValidations)(["emailAddress", "password"]);

// authenticate login
const authenticateLoginAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) VALIDATE & SANITISE FIELDS
    // 2) Return error in json if failed validation
    // 3) CHECK if username is in `users` collection and status is active
    // 4) CHECK if password is correct
  }
);

const logoutAction = asyncHandlerT(async (req, res, next) => {});

// Restrict permission
const restrictTo = asyncHandlerT(async (req, res, next) => {});

const protect = asyncHandlerT(async (req, res, next) => {});
