// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request, Response, NextFunction } from "express-serve-static-core";
import { OptionalId } from "mongodb";
import { ContextRunner } from "express-validator";
// @deno-types="@types/bcryptjs"
import bcrypt from "bcryptjs";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import { RequiredUser, User, roles, userStatus } from "../models/UserSchema.ts";
import {
  compareStrings,
  validateBodyFactory,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateSelect,
  validateText,
} from "../middlewares/validation.ts";
import { ClientError } from "../errors/ClientError.ts";
import {
  deleteUser,
  findUserByEmail,
  getAllUsers,
  getUser,
  insertUser,
  updateUser,
} from "../models/UserModel.ts";

// Define the validation rules for user-related fields
const userValidations: Record<
  keyof RequiredUser | "confirmPassword",
  ContextRunner
> = {
  firstName: validateText("firstName", 2, 50),
  lastName: validateText("lastName", 2, 50),
  emailAddress: validateEmail("emailAddress", true, findUserByEmail, true),
  phone: validatePhoneNumber("phone"),
  role: validateSelect("role", roles, "array"),
  status: validateSelect("status", userStatus, "string"),
  password: validatePassword("password", 8, 50),
  confirmPassword: compareStrings("passwords", "password", "confirmPassword"),
};

const validateUserInputs = (
  fields: (keyof RequiredUser | "confirmPassword")[]
) => validateBodyFactory(userValidations)(fields);

export const validateNewUserInputs = () =>
  validateUserInputs([
    "firstName",
    "lastName",
    "emailAddress",
    "phone",
    "role",
    "status",
    "password",
    "confirmPassword",
  ]);

export const validateUpdateUserInputs = () =>
  validateUserInputs(["firstName", "lastName", "phone", "role", "status"]);

export const listUsersAction = asyncHandlerT(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const users = await getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  }
);

export const showUserAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await getUser(req.params.id);

    if (!user) {
      next(new ClientError({ code: 404 }));
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const createUserAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    // hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const inputData: OptionalId<User> = {
      emailAddress: req.body.emailAddress,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      role: req.body.role,
      status: req.body.status,
    };

    console.log(inputData);

    const newUser = await insertUser(inputData);

    res.status(201).json({
      success: true,
      data: newUser,
    });
  }
);

export const updateUserAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const inputData: Omit<OptionalId<User>, "password"> = {
      emailAddress: req.body.emailAddress,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      role: req.body.role,
      status: req.body.status,
    };

    const result = await updateUser(req.params.id, inputData);

    if (!result?.matchedCount) {
      next(new ClientError({ code: 404, message: "The user not found." }));
      return;
    }

    res.status(200).json({
      success: true,
      result,
    });
  }
);

export const deleteUserAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await deleteUser(req.params.id);

    if (!result?.deletedCount) {
      next(
        new ClientError({
          code: 404,
          message: "The user not found.",
        })
      );
      return;
    }

    res.status(204).json({
      success: true,
      msg: "Successfully deleted one document.",
      result,
    });
  }
);
