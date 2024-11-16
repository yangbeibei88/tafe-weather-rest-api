// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request, Response, NextFunction } from "express-serve-static-core";
import { ContextRunner } from "express-validator";
// @deno-types="@types/bcryptjs"
import bcrypt from "bcryptjs";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import { User } from "../models/UserSchema.ts";
import {
  validateBodyFactory,
  validateEmail,
  validatePassword,
} from "../middlewares/validation.ts";
import { findUserByEmail } from "../models/UserModel.ts";
import { ClientError } from "../errors/ClientError.ts";
import { signToken } from "../middlewares/jwtHandler.ts";

const loginValidations: Record<
  keyof Pick<User, "emailAddress" | "password">,
  ContextRunner
> = {
  emailAddress: validateEmail("emailAddress", false, undefined, true),
  password: validatePassword("password", 8, 50),
};

export const validateLoginInputs = () =>
  validateBodyFactory(loginValidations)(["emailAddress", "password"]);

// greetings
export const greetingAction = (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to TAFE Weather REST API v1! Please login to continue.",
  });
};

// authenticate login
export const authLoginAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) CHECK if username is in `users` collection and status is active
    const user = await findUserByEmail(req.body.emailAddress);
    if (!user?.length || !(user?.[0].status === "active")) {
      return next(
        new ClientError({ code: 401, message: "Incorrect Credentials" })
      );
    }

    // 2) CHECK if password is correct
    const userPassword = user[0].password;
    const verifyPasswordPromise = await bcrypt.compare(
      req.body.password,
      userPassword
    );

    console.log(verifyPasswordPromise);

    if (!verifyPasswordPromise) {
      return next(
        new ClientError({ code: 401, message: "Incorrect Credentials" })
      );
    }

    // IF LOGIN CREDENTIALS CORRECT, SEND TOKEN TO THE CLIENT
    const token = signToken({ id: user[0]._id, email: user[0].emailAddress });

    res.status(200).json({
      success: true,
      token,
      message: "You have successfully logged in!",
    });
  }
);

// const logoutAction = asyncHandlerT(async (req, res, next) => {});

// // Restrict permission
// const restrictTo = asyncHandlerT(async (req, res, next) => {});

// const protect = asyncHandlerT(async (req, res, next) => {});
