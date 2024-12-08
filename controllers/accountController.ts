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
import { UpdatePasswordInput, User, UserInput } from "../models/UserSchema.ts";
import {
  findUserById,
  updateAccountById,
  updateUserPassword,
} from "../models/UserModel.ts";
import { userValidations } from "./userController.ts";

const updatePasswordValidations: Record<
  keyof UpdatePasswordInput,
  ContextRunner
> = {
  currentPassword: validatePassword("password", 8, 50),
  newPassword: validatePassword("newPassword", 8, 50),
  confirmNewPassword: compareStrings(
    "passwords",
    "newPassword",
    "confirmNewPassword"
  ),
};

export const validateUpdateAccountInput = () =>
  validateBodyFactory<UserInput>(userValidations)([
    "firstName",
    "lastName",
    "phone",
  ]);
export const validateUpdatePasswordInput = () =>
  validateBodyFactory<UpdatePasswordInput>(updatePasswordValidations)([
    "currentPassword",
    "newPassword",
    "confirmNewPassword",
  ]);

export const showAccountAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId: string = req.user._id.toString();

    const result = (await findUserById(userId, ["_id", "password"])) as Omit<
      User,
      "_id" | "password"
    >;

    res.status(200).json({
      result,
    });
  }
);

export const updateAccountAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId: string = req.user._id.toString();

    const { firstName, lastName, phone } = req.body;

    const payload: Pick<
      User,
      "firstName" | "lastName" | "phone" | "updatedAt"
    > = {
      firstName,
      lastName,
      phone,
      updatedAt: new Date(),
    };

    const result = await updateAccountById(userId, payload);

    res.status(200).json({
      result: {
        matchedCount: result?.matchedCount,
        modifiedCount: result?.modifiedCount,
      },
    });
  }
);

export const updatePasswordAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { currentPassword, newPassword } = req.body;

    // Last middleware `protect` already checked the user still exists
    const userId: string = req.user._id.toString();
    const user = (await findUserById(userId)) as User;

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

    const payload: Pick<User, "password" | "passwordChangedAt" | "updatedAt"> =
      {
        password: hashedNewPassword,
        passwordChangedAt: new Date(Date.now() - 1000),
        updatedAt: new Date(Date.now() - 1000),
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
