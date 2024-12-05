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
  deleteUsers,
  updateUsersRole,
} from "../models/UserModel.ts";
import { signToken } from "../middlewares/jwtHandler.ts";
import { JwtPayloadT } from "../utils/utilTypes.ts";
import { objectOmit } from "../utils/helpers.ts";

// Define the validation rules for user-related fields
export const userValidations: Record<keyof UserInput, ContextRunner> = {
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

export const validateBatchUpdateUsersRoleInput = () =>
  validateBodyFactory<UserInput>(userValidations)(["role"]);

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
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const users = await getAllUsers();

    console.log(req.query);

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

export const updateUsersRoleAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { role, createdAt } = req.query;

    // Prevent update all documents if no filter provided
    // Both role and createdAt are needed, throw error if:
    // 1) either role or createdAt or both are missing in query params
    // 2) role's length is 0
    // 3) when createdAt is a equal string, but isNaN when parse date
    // 4) when createdAt is a range object, but not all values parsed into date are number
    if (
      Object.keys(req.query).length < 2 ||
      !role?.length ||
      (createdAt &&
        typeof createdAt === "string" &&
        isNaN(Date.parse(createdAt))) ||
      (createdAt &&
        typeof createdAt === "object" &&
        !Object.values(createdAt).every(
          (v) => typeof v === "string" && !isNaN(Date.parse(v))
        ))
    ) {
      return next(
        new ClientError({
          code: 400,
          message:
            "Role and createdAt filters cannot be empty when batch update users' role.",
        })
      );
    }

    const payload: Pick<OptionalId<User>, "role" | "updatedAt"> = {
      // role has been validated in last middleware, safe to add to payload
      role: req.body.role,
      updatedAt: new Date(),
    };

    const result = await updateUsersRole({ role, createdAt }, payload);

    // if (!result?.matchedCount) {
    //   return next(new ClientError({ code: 404, message: "Users not found." }));
    // }

    res.status(200).json({
      result: {
        matchedCount: result?.matchedCount,
        modifiedCount: result?.modifiedCount,
      },
    });
  }
);

export const deleteUserAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await deleteUserById(req.params.id);

    if (!result?.deletedCount) {
      return next(
        new ClientError({
          code: 404,
          message: "The user not found.",
        })
      );
    }

    res.status(204).json({
      success: true,
      message: "Successfully deleted one document.",
      result,
    });
  }
);

export const deleteUsersAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { role, lastLoggedInAt } = req.query;

    // Prevent deleting all documents if no filter provided
    if (
      Object.keys(req.query).length < 2 ||
      role !== "student" ||
      (lastLoggedInAt &&
        typeof lastLoggedInAt === "string" &&
        isNaN(Date.parse(lastLoggedInAt))) ||
      (lastLoggedInAt &&
        typeof lastLoggedInAt === "object" &&
        !Object.values(lastLoggedInAt).every(
          (v) => typeof v === "string" && !isNaN(Date.parse(v))
        ))
    ) {
      return next(
        new ClientError({
          code: 400,
          message: "Only student role can be deleted within two dates.",
        })
      );
    }

    const result = await deleteUsers({ role, lastLoggedInAt });

    if (!result?.deletedCount) {
      return next(
        new ClientError({
          code: 404,
          message: "Users not found in this date range.",
        })
      );
    }

    res.status(204).json({
      result: {
        deletedCount: result.deletedCount,
      },
    });
  }
);
