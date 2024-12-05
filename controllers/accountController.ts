// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request, Response, NextFunction } from "express-serve-static-core";
import { ContextRunner } from "express-validator";
// @deno-types="@types/bcryptjs"
import bcrypt from "bcryptjs";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import { ClientError } from "../errors/ClientError.ts";
import {
  validateBodyFactory,
  validatePassword,
  compareStrings,
} from "../middlewares/validation.ts";
import { User } from "../models/UserSchema.ts";
import { findUserById, updateUserPassword } from "../models/UserModel.ts";

const updatePasswordValidations: Record<
  "password" | "newPassword" | "confirmNewPassword",
  ContextRunner
> = {
  password: validatePassword("password", 8, 50),
  newPassword: validatePassword("newPassword", 8, 50),
  confirmNewPassword: compareStrings(
    "passwords",
    "newPassword",
    "confirmNewPassword"
  ),
};

export const validateUpdatePasswordInput = () =>
  validateBodyFactory(updatePasswordValidations)([
    "password",
    "newPassword",
    "confirmNewPassword",
  ]);

export const updatePasswordAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    // Last middleware `protect` already checked the user still exists
    const userId: string = req.user._id.toString();
    const user = (await findUserById(userId, true)) as User;

    // Check if entered password matches database password
    const hashedPassword = user.password;
    const verifyPasswordPromise = await bcrypt.compare(
      currentPassword,
      hashedPassword
    );

    if (!verifyPasswordPromise) {
      return next(
        new ClientError({ code: 401, message: "Incorrect password" })
      );
    }

    // Last middleware has validated newPassword and confirmNewPassword
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    const payload: Pick<User, "password" | "passwordChangedAt"> = {
      password: hashedNewPassword,
      passwordChangedAt: new Date(),
    };

    const result = await updateUserPassword(userId, payload);

    res.status(200).json({
      result: {
        matchedCount: result?.matchedCount,
        modifiedCount: result?.modifiedCount,
      },
    });
  }
);
