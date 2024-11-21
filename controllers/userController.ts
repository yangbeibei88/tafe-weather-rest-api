// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request, Response, NextFunction } from "express-serve-static-core";
import { OptionalId } from "mongodb";
import { ContextRunner } from "express-validator";
// @deno-types="@types/bcryptjs"
import bcrypt from "bcryptjs";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import { User, UserInput, roles, userStatus } from "../models/UserSchema.ts";
import {
  compareStrings,
  validateBodyFactory,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateSelect,
  validateText,
  validateDate,
} from "../middlewares/validation.ts";
import { ClientError } from "../errors/ClientError.ts";
import {
  deleteUserById,
  findUserByEmail,
  getAllUsers,
  findUserById,
  insertUser,
  updateUserById,
} from "../models/UserModel.ts";
import { signToken } from "../middlewares/jwtHandler.ts";
import { JwtPayloadT } from "../utils/utilTypes.ts";
import { objectOmit } from "../utils/helpers.ts";

// Define the validation rules for user-related fields
const userValidations: Record<keyof UserInput, ContextRunner> = {
  _id: validateText("_id", 2, 50, false),
  firstName: validateText("firstName", 2, 50),
  lastName: validateText("lastName", 2, 50),
  emailAddress: validateEmail("emailAddress"),
  phone: validatePhoneNumber("phone"),
  role: validateSelect("role", roles, "array"),
  status: validateSelect("status", userStatus, "string"),
  password: validatePassword("password", 8, 50),
  confirmPassword: compareStrings("passwords", "password", "confirmPassword"),
  createdAt: validateDate("createdAt", false),
  updatedAt: validateDate("updatedAt", false),
  passwordChangedAt: validateDate("passwordChangedAt", false),
  lastLoggedInAt: validateDate("lastLoggedInAt", false),
};

export const validateNewUserInput = () =>
  validateBodyFactory<UserInput>(userValidations)([
    "firstName",
    "lastName",
    "emailAddress",
    "phone",
    "role",
    "status",
    "password",
    "confirmPassword",
  ]);

export const validateUpdateUserInput = () =>
  validateBodyFactory<UserInput>(userValidations)([
    "firstName",
    "lastName",
    "emailAddress",
    "phone",
    "role",
    "status",
  ]);

const getValidatedUserInput = (validInputData: UserInput | UserInput[]) => {
  if (Array.isArray(validInputData)) {
    return validInputData.map((obj: UserInput) => {
      return objectOmit(obj, ["confirmPassword"]);
    });
  } else {
    return objectOmit(validInputData, ["confirmPassword"]);
  }
};

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
    const user = await findUserById(req.params.id);

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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // check if the new user's email already exists
    const user = await findUserByEmail(req.body.emailAddress);

    if (user?.length) {
      return next(
        new ClientError({ code: 400, message: "The user already exists." })
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const payload: OptionalId<User> = {
      ...getValidatedUserInput(req.body),
      password: hashedPassword,
      createdAt: req.body.createdAt ?? new Date(),
    } as OptionalId<User>;

    console.log(payload);

    const newUser = await insertUser(payload);

    if (!newUser._id) {
      return next(new ClientError({ code: 400 }));
    }
    console.log(typeof newUser._id);

    // To compare if each field in decoded payload is deeply equal to stringified fields in the database, so when signing the token, stringify each field.
    const token = signToken<
      JwtPayloadT<Pick<User, "_id" | "emailAddress" | "role" | "status">>
    >({
      _id: newUser._id.toString(),
      emailAddress: newUser.emailAddress,
      role: newUser.role.toString(),
      status: newUser.status,
    });

    res.status(201).json({
      success: true,
      token,
      data: newUser,
    });
  }
);

export const updateUserAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check if the if new email address doesn't exist excluding the old one.
    const user = await findUserByEmail(req.body.emailAddress);
    if (user?.[0]?.emailAddress !== req.body.emailAddress) {
      return next(
        new ClientError({ code: 400, message: "The email already exists." })
      );
    }

    const payload: Omit<OptionalId<User>, "password"> = {
      ...(objectOmit(getValidatedUserInput(req.body), ["password"]) as Omit<
        OptionalId<User>,
        "password"
      >),
      createdAt: req.body.createdAt ?? new Date(),
    };

    const result = await updateUserById(req.params.id, payload);

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
    const result = await deleteUserById(req.params.id);

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
